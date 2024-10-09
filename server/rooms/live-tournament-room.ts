import {Client, Room} from "colyseus";
import {ArraySchema, Schema, type} from "@colyseus/schema";
import {sleep, tryFn, waitFor} from "../../common/utils";
const API_URL = process.env.PROD ? `https://golfcraftgame.com` : `http://localhost:2569`;
import MESSAGE from "./mesages";
import {creatServerGolfPlay} from "./golfplay-server";
import {getCourseDefinition} from "../../common/course-definitions/course-definition-repository";
import {GameDefinition} from "../../common/game-definition-type";
import {KinematicSchema, Quaternion, Vector3} from "./GamePlayState";
import fetch from "cross-fetch";
import {createFrameReproduction} from "../../common/frame-reproductor";
import { createEventManager } from "../../scene/golfplay/src/services/EventManagerFactory";
import { EVENT } from "../../scene/golfplay/src/gameplay-handlers/handler-def";
import {lobbyResetRoom} from "./live-room-manager";
import {USE_REMOTE_SERVER} from "../../common/constants";
import {callDiscordHook} from "../../common/discord";
import {getTotalResultsText} from "../../common/live-tournament-utils";
const FIRST_SHOT_PERIOD = 10000;
class LivePlayer extends Schema {
    @type("string")
    address:string;
    @type("string")
    realm:string;
    @type("string")
    displayName:string;
    @type("boolean")
    ready:boolean = false;

    @type(Vector3)
    positionBeforeShoot = new Vector3(0,0,0);
    @type(KinematicSchema)
    ball = new KinematicSchema();
    @type("boolean")
    idle:boolean = false;
    @type("uint8")
    playerIndex:number;

    golfplay;
    frameReproduction;
    frameEventHandler;
    client;
    PlayFabId;

    constructor({ address, PlayFabId, displayName, realm, client, playerIndex}){
        super();
        this.address = address;
        this.client = client;
        this.PlayFabId = PlayFabId;
        this.displayName = displayName;
        this.realm = realm;
        this.client = client;
        this.frameEventHandler = createEventManager();
        this.playerIndex = playerIndex;
        console.log("this.frameEventHandler", this.frameEventHandler)
    }
}

class CourseResult extends  Schema {
    @type("string")
    courseId:string;
    @type("string")
    courseAlias;

    @type("boolean")
    completed = false;

    @type(["number"])
    playersShots = new ArraySchema<"number">();

    @type(["number"])
    playersTime = new ArraySchema<"number">();

    constructor({numberOfPlayers}){
        super();
        this.playersShots = new ArraySchema<"number">(...new Array(numberOfPlayers).fill(0))
        this.playersTime = new ArraySchema<"number">(...new Array(numberOfPlayers).fill(0))
    }
}

class LiveRoomState extends Schema {
    @type([CourseResult])
    courseResults;

    @type([LivePlayer])
    players = new ArraySchema<LivePlayer>();//TODO just for test, we can remove later

    @type("string")
    organizerDisplayName;

    @type("uint8")
    roomIndex:number = 0;

    @type("uint8")
    currentMapIndex:number = 0;

    @type(["string"])
    courseIds:string[]


    starting = false;
    started = false;
    mapStartTime = 0;
    useOwnMaps = true;

    constructor ({roomIndex, useOwnMaps, numberOfMaps, address, displayName, courseIds, numberOfPlayers}){
        super();
        this.roomIndex = roomIndex;
        this.useOwnMaps = useOwnMaps;
        this.organizerDisplayName = displayName;
        console.log("organizerDisplayName",this.organizerDisplayName)
        console.log("courseIds",courseIds)
        this.courseIds = new ArraySchema<string>(...courseIds);
        console.log("this.courseIds.this.courseIds",this.courseIds)
        const pristineCourseResults:CourseResult[] = (new Array(numberOfMaps).fill(null).map(i=>new CourseResult({numberOfPlayers})));
        console.log("init courseResults", pristineCourseResults)
        this.courseResults = new ArraySchema<CourseResult>(...pristineCourseResults);
    }
}
const MAX_TIME_INACTIVE = 60000;
export class LiveTournamentRoom extends Room<LiveRoomState> {
    lastPingTimeMs;
    lastPingMs;
    lastActivityTime;
    interval;
    async onCreate({roomIndex, useOwnMaps, numberOfMaps, address, displayName, courseIds, numberOfPlayers}){
        this.lastActivityTime = Date.now();
        this.interval = setInterval(()=>{
            tryFn(()=>{
                if( (Date.now() - this.lastActivityTime) > MAX_TIME_INACTIVE){
                    this.disconnect();
                }
            })
        },1000);
        console.log("live-room onCreate", {roomIndex, useOwnMaps, numberOfMaps, address, displayName, courseIds})
        this.setState(new LiveRoomState({roomIndex, useOwnMaps, numberOfMaps, address, displayName, courseIds, numberOfPlayers}))
        this.onMessage(MESSAGE.PING, (client)=>{
            client.send(MESSAGE.PONG);
            this.lastPingTimeMs = Date.now();
        });
        this.onMessage(MESSAGE.PING2, ()=>{
            this.lastPingMs = Date.now()-this.lastPingTimeMs;//TODO apply?
        });
        this.onMessage(MESSAGE.SHOOT, async (client, {impulse, timeStep, delayMs} )=>{
            this.lastActivityTime = Date.now();
            const player = this.state.players.find(p=>p.client === client);
            this.state.courseResults[this.state.currentMapIndex].playersShots[player.playerIndex]++;
            const framesDelayMs = Math.max(0, delayMs - (this.lastPingMs || 0));
            const {frames, processingTimeMs } = player.golfplay.getFrames({timeStep, impulse, delayMs:framesDelayMs, lastPingMs:this.lastPingMs});

            client.send(MESSAGE.SHOOT_FRAMES, {frames, timeStep, impulse});
            await sleep(Math.max(0, delayMs-(processingTimeMs||0)-this.lastPingMs*2));
            client.send(MESSAGE.START_SHOOT_FRAMES);
            await sleep(this.lastPingMs);

            player.golfplay.setIdle(false);
            player.frameReproduction = createFrameReproduction({
                frames,
                timeStep: 1 / (60 * 4),
                onEvent: (event) => player.frameEventHandler.trigger(event),
                onUpdateBall: ({position, velocity}) => {
                    Object.assign(player.golfplay.getPhysicBall().body.position, position);
                    Object.assign(player.golfplay.getPhysicBall().body.velocity, velocity);
                    Object.assign(player.ball.position, position);
                },
                onFinish: () => {
                    player.frameReproduction = null;
                }
            });

            this.broadcastPatch()
        });

        this.update = this.update.bind(this);
        this.setSimulationInterval((deltaTime) => this.update(deltaTime/1000), 15);
        (async ()=>{
            await sleep(1000);

            let waitStart = Date.now();
            await waitFor(()=>this.state.players.length === numberOfPlayers || (Date.now() - waitStart > 10000));
            console.log("WAITED AND READY TO PREPARE MAP AND SEND START");
            this.state.starting = true;
            this.resetAndStartMap();
        })();
    }

    async completeMap(mapIndex){
        //TODO if ( mapIndex+1 % 4 ) === 0, sum live_tournament_participation

        this.state.courseResults[this.state.currentMapIndex].completed = true;
        this.broadcastPatch();

        const completedMaps = this.state.courseResults.filter(i=>i.completed).length;
        const allMapsCompleted = this.state.courseResults.length === completedMaps;
        console.log("broadcast COMPLETED")
        this.broadcast(MESSAGE.COMPLETED);//on this message, clients make fadeIn and load next map, waiting for START message

        if(!allMapsCompleted){
            await sleep(3000);
            this.state.currentMapIndex++;
            this.resetAndStartMap();
        }else{
            //TODO send message LIVE_TOURNAMENT_END
            this.broadcastPatch();
            const tournamentOrganizerPoints = (Math.floor(completedMaps / 4) * (this.state.players.filter((player,playerIndex) => {
                //to validate that the player was active to give points to the organizer
                return this.state.courseResults[this.state.courseResults.length-1].playersShots[playerIndex];
            })).length  - 1)
        const body = {
            apiKey:process.env.GOLF_API_KEY,
            organizer:this.state.players[0].address.toLowerCase(),
            organizer_display_name:this.state.players[0].displayName,
            points:tournamentOrganizerPoints,
        };
            console.log("tournamentOrganizerPoints",tournamentOrganizerPoints)
            if(tournamentOrganizerPoints){
                try{
                    const sumResult = await fetch(`${USE_REMOTE_SERVER?"https://golfcraftgame.com":"http://localhost:2569"}/api/sum-live-tournament-participation`, {
                        headers:{"Content-Type":"application/json"}, method:"POST",
                        body:JSON.stringify(body)
                    }).then(r=>r.json());

                    console.log("sum-live-tournament-participation result", sumResult)
                }catch(error){
                    console.log("sum-live-tournament-participation error",error)
                }
            }

            await sleep(3000);
            this.broadcast(MESSAGE.LIVE_TOURNAMENT_END, this.state.toJSON());
            if(this.state.players.length){
                callDiscordHook(`Live Tournament organized by ${this.state.players[0].displayName} has finished\n\n${getTotalResultsText(this.state)}`,"https://discord.com/api/webhooks/1009065576817229966/gufYreTUOraoUZJvf43sKi_wr15hqEQ-wnXo1lPlO91THK5q3SLFAb2t-J_1cPRXk54D")
            }
            //TODO everyone should leave the room
        }
    }

    async resetAndStartMap(){
        console.log("resetAndStartMap")
        const gameDefinition:GameDefinition = {
            type:"competition", subType:"1", courseId:this.state.courseIds[this.state.currentMapIndex]
        };
        console.log("gameDefinition",gameDefinition)
        const courseDefinition:any = await getCourseDefinition(gameDefinition, fetch, true);
        const initialPosDef =  courseDefinition.parts.find(p=>p.type === "initial_position");
        console.log("initialPosDef", JSON.stringify(initialPosDef))
        const [x,y,z] = initialPosDef.position;
        const [qx,qy,qz,qw] =  initialPosDef.rotation;

        for(let player of this.state.players){
            player.ball.updateFromCANNON({
                position:new Vector3(x,y,z),
                quaternion:new Quaternion(qx,qy,qz,qw)
            });
            console.log("player.ball.toJSON()", player.ball.toJSON());

            player.positionBeforeShoot.x = player.ball.position.x;
            player.positionBeforeShoot.y = player.ball.position.y;
            player.positionBeforeShoot.z = player.ball.position.z;
            player.golfplay = await creatServerGolfPlay({
                gameDefinition,
                courseDefinition,
                timeStep: 1 / (60 * 4)
            });
        }
        this.broadcastPatch();
        await sleep(1000);

        console.log("sending START",this.state.players.length)
        let i = this.state.players.length;
        const TIME_TO_START = 10000;
        const startTime = Date.now() + TIME_TO_START;
        while(i--){
            const playerIndex = i;
            this.state.players[playerIndex]?.client?.send(MESSAGE.START, {
                startTime,
                serverTime:Date.now(),
                playerIndex
            })
        }
        this.state.mapStartTime = startTime;
        await sleep(TIME_TO_START);
        //TODO set all player balls positions
        for(let player of this.state.players){
            player.ball.updateFromCANNON({
                position:new Vector3(x,y,z),
                quaternion:new Quaternion(qx,qy,qz,qw)
            });
            player.positionBeforeShoot.x = player.ball.position.x;
            player.positionBeforeShoot.y = player.ball.position.y;
            player.positionBeforeShoot.z = player.ball.position.z;
        }
    }

    firstHoleTime = 0;
    async onJoin(client: Client, {address, PlayFabId, realm, displayName}, auth?: any): Promise<any> {
        console.log("live-room onJoin", this.state.starting, {address, PlayFabId, realm, displayName}, auth);
        if(this.state.starting) return false;
        const playerIndex = this.state.players.length;
        console.log("playerIndex", playerIndex);
        const player = new LivePlayer({
            address, PlayFabId, displayName, realm, client, playerIndex
        });
        console.log("adding players")
        this.state.players.push(player);

console.log("player.frameEventHandler",player.frameEventHandler)
        player.frameEventHandler.onEvent(EVENT.ANY, async ({type, data}) => { //TODO MOVE TO golfplay-server (bridge)
            //if(this.state.finished) return;
            player.golfplay.updateHandlers(0);//TODO review
            if(type === EVENT.HOLE){
                console.log("HOLE", playerIndex, this.state.courseResults[this.state.currentMapIndex].completed);
                if(this.state.courseResults[this.state.currentMapIndex].completed) return;
                const time = Date.now() - this.state.mapStartTime;
                this.state.courseResults[this.state.currentMapIndex].playersTime[playerIndex] = time;
                const numOfPlayerThatMadeHole = this.state.courseResults[this.state.currentMapIndex].playersTime.reduce(sumTruthy, 0);
                const isFirstShotTimePeriodPassed = (Date.now() - this.state.mapStartTime) > FIRST_SHOT_PERIOD;
                const allPlayersMadeHole = this.state.courseResults[this.state.currentMapIndex].playersTime.every(i=>i)
                const skipCountdown =
                    (!numOfPlayerThatMadeHole && !isFirstShotTimePeriodPassed)
                        ? false
                        : allPlayersMadeHole
                            || (isFirstShotTimePeriodPassed && this.state.courseResults[this.state.currentMapIndex].playersTime.every((time, index) => {
                                return time || !this.state.courseResults[this.state.currentMapIndex].playersShots[index];
                            }));

                console.log("broadcast PLAYER_HOLE", playerIndex, numOfPlayerThatMadeHole, skipCountdown, isFirstShotTimePeriodPassed);
                const serverTime = Date.now();
                this.broadcast(MESSAGE.PLAYER_HOLE, {
                    playerIndex,
                    showCountdown:numOfPlayerThatMadeHole === 1 && !skipCountdown,
                    serverTime
                });

                this.state.courseResults[this.state.currentMapIndex].playersTime[playerIndex] = serverTime - this.state.mapStartTime;
                this.firstHoleTime = this.firstHoleTime || serverTime;
                const currentMapIndex = this.state.currentMapIndex;
                this.broadcastPatch();
                if(skipCountdown){
                    this.completeMap(currentMapIndex);
                }else if(numOfPlayerThatMadeHole === 1){
                    await sleep(1000 * 60);//TODO
                    if(this.state.courseResults[currentMapIndex].completed) return;
                    this.completeMap(currentMapIndex);
                }

            }
        });
    }

    onDispose(): void | Promise<any> {
        console.log("dispose")
        lobbyResetRoom(this.state.roomIndex);
        clearInterval(this.interval);
    }

    onLeave(client: Client, consented?: boolean): void | Promise<any> {
        console.log("leave", consented, this.state.players.find(p => p.client === client).displayName);
    }

    private update(dt){
        for(let player of this.state.players){
            //if(this.state.finished) return;
            player.frameReproduction?.update(dt);
        }
    }
}
function sumTruthy(acc, current){
    if(current) acc++;
    return acc;
}