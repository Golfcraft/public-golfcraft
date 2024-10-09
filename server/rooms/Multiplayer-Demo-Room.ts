import { Room } from "colyseus";
import {PlayFabServer} from "playfab-sdk";
import { promisify } from "util";
import { GameDefinition } from "../../common/game-definition-type";
import { getCourseDefinition } from "../../common/course-definitions/course-definition-repository";
import { migrateCourseDefinitionAnimations } from "../../common/course-animations-migration";
import {BallSchema, FrameBufferSchema} from "./GamePlayState";
import MESSAGE from "./mesages";
import { EVENT } from "../../scene/golfplay/src/gameplay-handlers/handler-def";
import { Schema, ArraySchema, MapSchema, type } from "@colyseus/schema";
import {creatServerGolfPlay2} from "./golfplay-server2";
import fetch from "cross-fetch";
import {getFrames} from "../physics-frames";
import {sleep, waitFor} from "../../common/utils";

const playfabServerApiKey = process.env.PLAYFAB_API_KEY;
const _log = console.log;
//console.log = ()=>{};
console.log(new Date(1664968106911).toISOString());
console.log("2022-10-05T11:08:26.911Z");

const BUFFER_SIZE_TIME = 200;
const FRAMES_UPDATE_INTERVAL = 100;//TODO instead of interval, we can just do X time(or frames) before the current buffer is finished,
const CLIENT_UPDATE_INTERVAL = 100;//new frames sent every 100ms
const PHYSICS_FPS = 31.25;
const APPLY_FRAMES_INTERVAL = 16;

const amountS = BUFFER_SIZE_TIME/1000;

class PlayState extends Schema {
    @type("number")
    startTime = Date.now() + 5000;

    @type({ map: BallSchema })
    balls = new MapSchema<BallSchema>();

    @type(FrameBufferSchema)
    frameBuffer:FrameBufferSchema

    clientBallMap = {};
    ballPlayFabIdMap = {};

    @type("string")
    roomName = "TestRoom2";
}

//TODO MAKE A FRAME CLOCK THAT UPDATES state.currentFrame

export class MultiplayerDemoRoom extends Room<PlayState> {
    private gameDefinition:GameDefinition;
    private golfPlay;
    private courseDefinition;
    private cannonParts;
    private ballIds = 0;

    async onCreate({roomInstanceId, realm, user, userId, gameDefinition, courseDefinition, cannonParts, timeStep = 1/(60*4)}) {//TODO client shouldn't define gameDefinition, it should inherit from currentTrainingID from player
        console.log("created", user?.displayName, roomInstanceId, {timeStep, user}, JSON.stringify(gameDefinition));
        this.gameDefinition = gameDefinition;
        this.courseDefinition = courseDefinition || migrateCourseDefinitionAnimations(await getCourseDefinition(gameDefinition, fetch, true));
        const checkpointsLength = this.courseDefinition.parts.filter(p=>p.type==="checkpoint").length;
        this.cannonParts = cannonParts;
        this.setState(new PlayState());
        this.golfPlay = await creatServerGolfPlay2({
            gameDefinition:this.gameDefinition,
            courseDefinition:this.courseDefinition,
            timeStep
        });
        console.log("this.golfPlay",!!this.golfPlay);
        this.setSimulationInterval((dt) => {
            let numFrames = Math.floor(dt/(timeStep*1000));
            while(numFrames--){
                this.golfPlay.updatePhysics();
                this.golfPlay.updateHandlers();
            }


            Object.values(this.golfPlay.getPhysicBalls()).forEach((physicBall:any) => {
                this.state.balls[physicBall.id].updateFromCANNON(physicBall.body);
            });
        },1000/PHYSICS_FPS);

        this.onMessage(MESSAGE.PING, (client)=>{
            client.send(MESSAGE.PONG, Date.now());
            const ballId = this.state.clientBallMap[client.sessionId];
            this.state.balls[ballId].lastPingTimeMs = Date.now();
        });

        this.onMessage(MESSAGE.PING2, (client)=>{
            const ballId = this.state.clientBallMap[client.sessionId];
            this.state.balls[ballId].lastPingMs = Date.now() - this.state.balls[ballId].lastPingTimeMs; //TODO this should be by client, not outer context
            this.state.balls[ballId].ping = this.state.balls[ballId].lastPingMs;
            client.send(MESSAGE.SERVER_TIME, Date.now());
        });

        this.golfPlay.onEvent(async ({type, data}) => {
            if(type === EVENT.HOLE){
                console.log("HOLE",type,data)
                const {id} = data;
                const foundClient = this.clients.find(c=>c.sessionId === this.state.balls[id].sessionId);
                foundClient.send(MESSAGE.HOLE, {id});
                this.broadcast(MESSAGE.COUNTDOWN, {time:20000});
                //TODO also se holeTime and other should see countdown
            }else if(type === EVENT.SLEEP){
                const {id} = data;
                const foundClient = this.clients.find(c=>c.sessionId === this.state.balls[id].sessionId);
                foundClient.send(MESSAGE.SLEEP, {});
            }else if(type === EVENT.OUT){
                const {id} = data;
                const foundClient = this.clients.find(c=>c.sessionId === this.state.balls[id].sessionId);
                foundClient.send(MESSAGE.OUT, {});
            }
        });
        let shooting = false;
        this.onMessage(MESSAGE.SHOOT, async (client, {impulse, timeStep, delayMs})=>{

            console.log("SHOOT");
            const id = this.state.clientBallMap[client.sessionId];
            if(this.state.startTime >= Date.now()) return;
            await sleep(200);
            this.golfPlay.shootBall({impulse, id});
            //TODO increase state.thisBall.shoots ++
            shooting = true;
            //TODO instead of creating new, concat where frame.t > Date.now
            /*    const now = Date.now();
                const frames = calcAndGetFrameBufferSchema(this.golfPlay.getWorld(), this.golfPlay.getPhysicBalls());
                physicsFrameBuffer = {t:now, frames};
                this.state.frameBuffer = new FrameBufferSchema(now, frames);
                await sleep(timeStep*1000);
                shooting = false;*/


        });
        return true;
    }

    async onJoin(client, {realm, user, userId, PlayFabId, gameDefinition, courseDefinition, cannonParts, displayName}){
        //TODO add new ball
        console.log("joining1", user.displayName, Date.now());
        await waitFor(()=>!!this.golfPlay, 100);
        this.ballIds++;
        const ballId = this.ballIds.toString();
        this.state.balls.set(ballId, new BallSchema(ballId, displayName, userId, client.sessionId));
        this.state.clientBallMap[client.sessionId] = ballId;
        this.state.ballPlayFabIdMap[ballId] = PlayFabId;
        client.send(MESSAGE.BALL_ID, ballId);
        const position = this.courseDefinition.parts.find((part:any)=>part.type === "initial_position")!.position;
        this.golfPlay.addPhysicBall(ballId, {position});
        client.send(MESSAGE.START, {startTime:this.state.startTime, serverTime:Date.now()});
    }

    onLeave(client, consented){
        console.log("leave")
        const ballId = this.state.clientBallMap[client.sessionId];
        this.state.balls.delete(ballId);
        this.golfPlay.removeBall(ballId)
        //TODO reconnect
    }

    onDispose(){
        this.clock.clear();
        /*        clearInterval(this.interval1);
                clearInterval(this.interval2);*/

        this.golfPlay && this.golfPlay.dispose();

    }
}

function assignCoords(a,b){
    a.x = b.x;

    a.y = b.y;
    a.z = b.z;
    if(b.w) a.w = b.w;
}

function assignKinetics(a,b){
    assignCoords(a.position, b.position);
    assignCoords(a.quaternion, b.quaternion);
    assignCoords(a.velocity, b.velocity);
    assignCoords(a.angularVelocity, b.angularVelocity);
    assignCoords(a.vlambda, b.vlambda);
    assignCoords(a.wlambda, b.wlambda);
    assignCoords(a.interpolatedPosition, b.interpolatedPosition);
}