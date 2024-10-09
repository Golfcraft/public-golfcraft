import { Room } from "colyseus";
import {LEAVE_CODE, PRICE_COMPETITION_GROUP} from "../../common/constants";
import { tryFetch } from "../utils/try-fetch";
import { PlayFab, PlayFabServer } from "playfab-sdk";
import { promisify } from "util";
import { creatServerGolfPlay } from "./golfplay-server";
import {Gameplay, Vector3, Quaternion, ChestSchema} from "./GamePlayState";
import { getCourseDefinition } from "../../common/course-definitions/course-definition-repository";
import { GameDefinition } from "../../common/game-definition-type";
import { migrateCourseDefinitionAnimations, withNoiseOnStartPosition } from "../../common/course-animations-migration";
import {createFrameReproduction} from "../../common/frame-reproductor";
import { createEventManager } from "../../scene/golfplay/src/services/EventManagerFactory";
import { EVENT } from "../../scene/golfplay/src/gameplay-handlers/handler-def";
import MESSAGE from "./mesages";
import {deserializeRecipe, getRandomInt, sleep, waitFor, defaultChestRewardChances} from "../../common/utils";
import fetch from "cross-fetch";
import {callDiscordHook} from "../../common/discord";
import {pushChests} from "./chests-generator";
import MESSAGES from "./mesages";

const HALLOWEEN_WEARABLE_STATISTIC = "wearable:halloween-2022";//TODO make it dynamic depending on event-key
const OPEN_CHEST_STATISTIC = "chests_open";
const TOURNAMENTS_URL = process.env.PROD ? `https://golfcraftgame.com` : `http://localhost:2569`;
class CompetitionGroupState extends Gameplay {
    constructor(courseDefinition, initialState){
        super(courseDefinition);

        this.startTime = Date.now() + 5000;
        this.endTime = null;
        this.duration = courseDefinition.metadata.duration;
        if(initialState){
            Object.assign(this, initialState);
        }
    }
}

export class TournamentRoom extends Room<CompetitionGroupState> {
    private interval:ReturnType<typeof setInterval>;
    private golfPlay;
    private gameDefinition;
    private courseDefinition;
    private frameReproduction = null;
    private lastPingTimeMs;
    private lastPingMs;
    private frameEventHandler = createEventManager();
    private tournamentData;
    private user;
    private participation;

    async authTournamentParticipant({PlayFabId, clientInfo, code, userId, user, tournamentID}){
        this.tournamentData = await tryFetch(2, `${TOURNAMENTS_URL}/api/get-tournament-by-id`, {
            method:'POST',
            headers:{'Content-Type':"application/json"},
            body:JSON.stringify({ID:tournamentID})
        }).then(async r=> await r.json(), (err)=>{
            console.log("get-tournament-by-id error",{PlayFabId, clientInfo, code, userId, user, tournamentID})
            console.error(err);
            throw Error(err);
        });

        if(!this.tournamentData){
            return false;
        }
        if(this.tournamentData?.whitelist?.length && !this.tournamentData.whitelist.find(a=>a.toLowerCase() === userId.toLowerCase())){
            return false;
        }
        if(this.tournamentData?.participants.length >= this.tournamentData.max_participants){
            return false;
        }
        if(this.tournamentData?.expiration_date*1000 < Date.now()){
            return false;
        }
        if(this.tournamentData?.start_date*1000 > Date.now()){
            return false;
        }
        return !!clientInfo;
    }
    private UserInventory;
    async onAuth(client, {PlayFabId, clientInfo}){
        if(!clientInfo) return false;
        const {data} = await promisify(PlayFabServer.GetUserInventory)({ PlayFabId });
        this.UserInventory = data.Inventory;
        const {VirtualCurrency} = data;

        if(Number(VirtualCurrency.GC||0) < PRICE_COMPETITION_GROUP){
            return false;
        }
        promisify(PlayFabServer.SubtractUserVirtualCurrency)({
            PlayFabId,
            "VirtualCurrency": "GC",
            "Amount": PRICE_COMPETITION_GROUP
        });
        return this.authOk;
    }

    private authOk;
    private courseStateIndex = 0;
    private recoveredLastCourse;

    private ballBoundingBox = {
        ax:0,
        ay:0,
        az:0,
        bx:0,
        by:0,
        bz:0
    }

    async onCreate({tournamentID, user, userId, PlayFabId, code, clientInfo, roomInstanceId}){
        console.log("onCreate", JSON.stringify({tournamentID, user, userId, PlayFabId, code, clientInfo, roomInstanceId}));
        this.authOk = await this.authTournamentParticipant({user, userId, PlayFabId, code, clientInfo, tournamentID});
        console.log("tournament auth ok", tournamentID, code, this.authOk, roomInstanceId);
        this.participation = this.tournamentData?.participants?.find(p=>p.address.toLowerCase() === userId.toLowerCase());
        const alreadyPlayedParticipations = this.participation?.data?.courseStates?.length || 0;
        const lastCourse = this.participation?.data.courseStates.length && this.participation.data.courseStates[this.participation.data.courseStates.length-1] || null;

        let currentCourseId = lastWasAbandoned()
                                ? this.tournamentData.courses[this.participation?.data.courseStates.length-1]
                                  :  this.participation ? this.tournamentData.courses[alreadyPlayedParticipations]
                                  :  this.tournamentData.courses[0];
        this.gameDefinition = {
            type: "competition",
            subType: "1",
            courseId:currentCourseId
        };
        console.log("gameDefinition", this.gameDefinition);
        const originalCourseDef:any = await getCourseDefinition(this.gameDefinition, fetch, code == "COCO");
        this.courseDefinition = migrateCourseDefinitionAnimations(originalCourseDef, [/*withNoiseOnStartPosition*/]);//TODO check if we should add noise at lesat for non user created maps
        console.log("courseDefinition", !!this.courseDefinition)
        this.courseDefinition.expressions = this.courseDefinition.expressions || {};
        this.courseDefinition.expressions.seed = `${code}-${this.gameDefinition.alias}`;

        if(!this.authOk){
            //TODO make client leave
            console.error("wrong auth");
            await this.disconnect();
            return;
        }
        //TODO if not overdue, and not holeTime, player should be able to restart from last ball position

        this.user = {PlayFabId, ...user, address:user.address || userId};


        let initialState;

        if(lastWasAbandoned()){
            lastCourse.abandoned = false;
            initialState = {};
            initialState.shoots = lastCourse.shoots;
            initialState.startTime = Date.now() + 5000;
            initialState.duration = Math.floor(this.courseDefinition.metadata.duration - (lastCourse.elapsedMs/1000));
            this.recoveredLastCourse = lastCourse;
        }else if(this.participation){
            this.participation.data.courseStates.push({
                startTime:null,
                holeTime:null,
                shoots:null,
                courseId:currentCourseId
            });
            //TODO Update
            tryFetch(1, `${TOURNAMENTS_URL}/api/update-tournament-participant`, {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(this.participation)
            });
        }else{
            this.courseStateIndex = 0;
            this.participation = {
                ID:this.tournamentData.ID,
                address:userId,
                playfab:PlayFabId,
                displayName:user.displayName,
                data:{
                    courseStates:[
                        {
                            startTime:null,
                            holeTime:null,
                            shoots:null,
                            courseId:currentCourseId,
                            finished:false
                        }
                    ]
                }
            }
            //TODO Insert
            tryFetch(2, `${TOURNAMENTS_URL}/api/add-tournament-participant`,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(this.participation)
            }).then(async (res)=>{
                console.log("added tournament participant", await res.json());
            },(err)=>{
                console.error("error on insert", err);
            });
        }
        this.setState(new CompetitionGroupState(this.courseDefinition, initialState));
        this.participation.data.courseStates[this.participation.data.courseStates.length-1].startTime = this.state.startTime;

        const {data} = await promisify(PlayFabServer.GetLeaderboard)({StatisticName:HALLOWEEN_WEARABLE_STATISTIC, StartPosition:0, MaxResultsCount:100});
        const gottenWearables = data.Leaderboard.reduce((acc, current)=>{
            acc = acc + current.StatValue;
            return acc;
        }, 0)+27+4;

        const chestEvent = await tryFetch(1,`${TOURNAMENTS_URL}/api/prisma-find-first/chest_events`, {
            method:"POST",
            body:JSON.stringify({
                "where":{
                    "startDate":{
                        "lte":new Date().toISOString()
                    },
                    "endDate":{
                        "gte":new Date().toISOString()
                    }
                }
            }),
            headers:{"Content-Type":"application/json"},
        }).then(async r=>{
            try{return await r.json()}catch(error){console.log("error",error)}
        }, ()=>undefined);
        if(chestEvent && chestEvent.inTournament){
            await pushChests({
                PlayFabId,
                chestEvent,
                chestCollection:this.state.chests
            })
        }

        this.golfPlay = await creatServerGolfPlay({
            gameDefinition:<GameDefinition>this.gameDefinition,
            courseDefinition:this.courseDefinition,
            timeStep:1/(60*4),
            recoveredBallPosition:this.recoveredLastCourse?.recoveredLastBallPosition
        });

        console.log("onCreate DONE");

        function lastWasAbandoned(){
            return lastCourse && !lastCourse.holeTime && !lastCourse.overdue && lastCourse.abandoned
        }
    }

    async onJoin(client, {tournamentID, realm, groupId, PlayFabId, userId, user, clientInfo, lobbySessionId}){
        console.log("onJoin", JSON.stringify( {tournamentID, realm, groupId, PlayFabId, userId, user, clientInfo, lobbySessionId}));

        if(!this.authOk){
            console.log("onJoin no authOk",this.authOk);
            client.leave();
            await this.disconnect();
        }
        console.log("onJoin authOk");
        await waitFor(() => !!this.golfPlay);
        //TODO ask for current event

        promisify(PlayFabServer.UpdateUserData)({
            PlayFabId,
            Data:{
                clientInfo:JSON.stringify(clientInfo)
            }
        }).then(()=>{},(err)=>{console.log("error saving clientInfo",PlayFabId,clientInfo,err)});

        if(this.recoveredLastCourse?.recoveredLastBallPosition){
            this.state.ball.updateFromCANNON({
                position:new Vector3(...this.recoveredLastCourse?.recoveredLastBallPosition as [number,number,number])
            });
        }

        this.golfPlay.onUpdate(({ball, movingParts})=>{

            //if(ball) this.state.ball.updateFromCANNON(ball);
           /* if(movingParts) {
                movingParts.forEach((movingPart, index)=>{
                    this.state.movingParts[index].updateFromCANNON(movingPart);
                })
            }*/
        });
        this.broadcast(MESSAGE.VARIABLE_INITIALIZATION, this.golfPlay.getExpressionState());
        this.frameEventHandler.onEvent(EVENT.OUT, ()=>{
            if(this.state.finished) return;
        });

        this.frameEventHandler.onEvent(EVENT.ANY, async ({type, data}) => { //TODO MOVE TO golfplay-server (bridge)
            if(this.state.finished) return;
            this.golfPlay.updateHandlers(0);
            if(type === EVENT.HOLE){
                this.completeGame({client, PlayFabId})
            }
        });
        this.frameEventHandler.onEvent(EVENT.SLEEP, ()=>{
             this.lastSleepBallPosition = this.golfPlay.getBallPosition();
        });
        this.onMessage(MESSAGE.PING, (client)=>{
            client.send(MESSAGE.PONG);
            this.lastPingTimeMs = Date.now();
        });
        this.onMessage(MESSAGE.FIX_BUGS, () => {
            this.state.started = true;
            this.state.finished = false;
            this.golfPlay.setIdle(true);
        });
        this.onMessage(MESSAGE.CHEST, (client, {index})=>{
            console.log("chest", index);
            this.state.chests.at(index).used = true;
        });

        this.onMessage(MESSAGE.PING2, ()=>{
            this.lastPingMs = Date.now()-this.lastPingTimeMs;//TODO apply?
        });
        this.onMessage(MESSAGES.READY, async (client) => {
            console.log("READY");
            await waitFor(()=>this.courseDefinition)
            this.state.startTime = Date.now() + 12000;
            this.clock.start();
            this.update = this.update.bind(this);
            this.interval = setInterval(() => this.clockCheck({client, userId, PlayFabId}), 300);
            this.setSimulationInterval((deltaTime) => this.update(deltaTime/1000), 15);
            const startData = {
                startTime: this.state.startTime,
                duration:this.state.duration,//TODO apply duration
                serverTime: Date.now(),
                courseAlias:this.courseDefinition?.alias,
                recoveredLastBallPosition:this.recoveredLastCourse?.recoveredLastBallPosition,//TODO if not overdue, and not holeTime
            };
            console.log("send START", startData)
            client.send(MESSAGES.START, startData );
            console.log("SENT START", startData)
        });
        this.onMessage(MESSAGE.SHOOT, async (client, {impulse, timeStep, delayMs})=>{
            if(!this.state.finished && !this.isOverdue()) {
                this.state.shoots = this.state.shoots + 1;
                const framesDelayMs = Math.max(0, delayMs - (this.lastPingMs || 0));
                const {frames, processingTimeMs } = this.golfPlay.getFrames({timeStep, impulse, delayMs:framesDelayMs, lastPingMs:this.lastPingMs});
                client.send(MESSAGE.SHOOT_FRAMES, {frames, timeStep, impulse});
                await sleep(Math.max(0, delayMs-(processingTimeMs||0)-this.lastPingMs*2));
                client.send(MESSAGE.START_SHOOT_FRAMES);
                await sleep(this.lastPingMs);

                this.golfPlay.setIdle(false);
                //gameplay
                this.frameReproduction = createFrameReproduction({
                    frames,
                    timeStep,
                    onEvent: (event) => this.frameEventHandler.trigger(event),
                    onUpdateBall: ({position, velocity}) => {
                        Object.assign(this.golfPlay.getPhysicBall().body.position, position);
                        Object.assign(this.golfPlay.getPhysicBall().body.velocity, velocity);
                        //  this.state.ball.updateFromCANNON({position, velocity}); //TODO only for dummy ball
                    },
                    onFinish: () => {
                        this.frameReproduction = null;
                    }
                });
            }
        });

        console.log("JOINED DONE");

        return 123;
    }

    async clockCheck({client, userId, PlayFabId}){
        if(!this.state.finished && (this.isOverdue(Date.now()))){
            clearInterval(this.interval);
            this.state.endTime = Date.now();
            this.state.finished = true;
            this.golfPlay.dispose();
            console.log("MAKE CLIENT LEAVE OVERDUE")
            client.leave(LEAVE_CODE.TIMEOUT);
            const courseState = this.participation.data.courseStates[this.participation.data.courseStates.length-1];
            courseState.overdue = true;
            courseState.finished = true;
            courseState.shoots = this.state.shoots;
            try{
                tryFetch(1, `${TOURNAMENTS_URL}/api/update-tournament-participant`,{
                    method:"POST",
                    body:JSON.stringify(this.participation),
                    headers:{"Content-Type":"application/json"},
                }).then(()=>{},()=>{});
            }catch(err){
                console.error("Error adding player result:",err);
            }
        }
    }

    private isOverdue(time?:number){
        return (time||Date.now()) > (this.state.startTime + this.state.duration*1000);
    }

    private update(dt){
        if(this.state.finished) return;
        if(this.frameReproduction){
            this.frameReproduction.update(dt);
        }
        //TODO update ball boundingBox
        const ballPosition = this.golfPlay.getBallPosition();
        if(ballPosition.y < 0) return;
        this.ballBoundingBox.ax = Math.min(this.ballBoundingBox.ax||ballPosition.x, ballPosition.x);
        this.ballBoundingBox.ay = Math.min(this.ballBoundingBox.ay||ballPosition.y, ballPosition.y);
        this.ballBoundingBox.az = Math.min(this.ballBoundingBox.az||ballPosition.z, ballPosition.z);
        this.ballBoundingBox.bx = Math.max(this.ballBoundingBox.bx||ballPosition.x, ballPosition.x);
        this.ballBoundingBox.by = Math.max(this.ballBoundingBox.by||ballPosition.y, ballPosition.y);
        this.ballBoundingBox.bz = Math.max(this.ballBoundingBox.bz||ballPosition.z, ballPosition.z);
        //this.golfPlay.updateAnimations(dt);

    }

    async completeGame({client, PlayFabId}){
        this.state.endTime = Date.now();
        if(this.isOverdue()){
            return;
        }
        client.send(MESSAGE.COMPLETED, { time:Date.now()-this.state.startTime, shoots:this.state.shoots });

        const courseState = this.participation.data.courseStates[this.participation.data.courseStates.length-1];
        courseState.holeTime = Date.now();
        courseState.shoots = this.state.shoots;
        courseState.finished = true;
        this.state.finished = true;
        try{
            await tryFetch(2, `${TOURNAMENTS_URL}/api/update-tournament-participant`,{
                method:"POST",
                body:JSON.stringify(this.participation),
                headers:{"Content-Type":"application/json"},
            }).then(async (res)=>{
                console.log("updated tournament participation", await res.json());
            },(error)=>{
                console.log("Failed to update tournament participation", error);
            });
        }catch(err){
            console.error("Error adding player result:",err);
        }
        await handleChestRewards(this.state.chests, this.user.displayName);

        this.golfPlay.dispose();
        setTimeout(()=>{
            console.log("CLIENT LEAVE onTimeout")
            client.leave(LEAVE_CODE.COMPLETED);
        },1000);

        const callDiscord = (str)=>{
            callDiscordHook(str,"https://discord.com/api/webhooks/993647590421831740/Am5YhymUTewExCEYcZ_eFnUJz_9yNFfFARuuaVa_ABBxSWf3v7W9IME9LIMQMkcX1B6g")
        }

        if(this.participation.data.courseStates.length === 12){
            try{
                await promisify(PlayFabServer.UpdatePlayerStatistics)({
                    PlayFabId,
                    Statistics:[
                        {
                            StatisticName:"tournaments_completed",
                            Value:1
                        }
                    ]
                });
            }catch(error){
                console.log("error on tournament FT reward",error);
            }
        }else{
            callDiscord(`User ${this.user.displayName} ${PlayFabId} finished map on tournament ${this.tournamentData.code}`);
        }

        async function handleChestRewards(chests, displayName){
            let i = chests.length;
            let foundWearables = 0;
            const rewards = {FT:0, DM:0, WD:0, ST:0, IR:0, GD:0};
            while(i--){
                const chest = chests.at(i);
                if(chest.used){
                    const reward = deserializeRecipe(chest.reward);
                    if(reward.wearable){
                        foundWearables++;
                        callDiscordHook(`${displayName} found a wearable in a gift!`,"https://discord.com/api/webhooks/906781944380031006/nMF7o9M-MtiWlV510kJshIpH_Pxj-w2K7evahDhHeWMnz4TFNMc_kFOT15hgCsXFcS6O")
                    }else{
                        const VirtualCurrency = Object.keys(reward)[0];
                        rewards[VirtualCurrency] += reward[VirtualCurrency];
                    }
                }
            }

            const foundChests = chests.filter(chest => chest.used).length;
            const openChestStatisticDef = {
                StatisticName:OPEN_CHEST_STATISTIC,
                Value:foundChests
            };
            console.log("updating statistics", PlayFabId, rewards);
            const rewardKeys = Object.keys(rewards).filter(key=>rewards[key]);
            console.log("rewardKeys",rewardKeys);
            for(let key of rewardKeys){
                console.log("giving reward", PlayFabId, key, rewards[key]);
                await promisify(PlayFabServer.AddUserVirtualCurrency)({
                    PlayFabId,
                    VirtualCurrency:key,
                    Amount:rewards[key]
                });
            }
            await promisify(PlayFabServer.UpdatePlayerStatistics)({
                PlayFabId,
                Statistics: foundWearables
                    ? [{
                        StatisticName: HALLOWEEN_WEARABLE_STATISTIC,
                        Value: foundWearables
                        },
                        openChestStatisticDef
                      ]
                    : [openChestStatisticDef]
            });
            console.log("updated statistics", PlayFabId);
        }
    }

    async onLeave(client, consented){
        //TODO allow reconnection
        //TODO reconnect
        console.log("leaving", consented, client?.sessionId, this.user?.PlayFabId, this.user?.displayName );
        try {
            if(consented){
                throw new Error('consented leave');
            }
            console.log("awaiting reconnection");
            await this.allowReconnection(client, 10);
            console.log("awaited reconnection")
        } catch(error){
            console.log("onLeave error",consented, error);
            this.golfPlay.dispose();
        }
    }
    private lastSleepBallPosition;

    async onDispose(){
        console.log("dispose", this.user.PlayFabId, this.user.displayName );
        const courseState = this.participation?.data?.courseStates[this.participation.data.courseStates.length-1];
        courseState.shoots = this.state?.shoots || 0;
        if(!this.state?.shoots && this.participation?.data?.courseStates?.length){
            //remove inserted courseState
            this.participation.data.courseStates.pop();
            try{
                tryFetch(1, `${TOURNAMENTS_URL}/api/update-tournament-participant`,{
                    method:"POST",
                    body:JSON.stringify(this.participation),
                    headers:{"Content-Type":"application/json"},
                }).then(()=>{},()=>{});
            }catch(err){
                console.error("Error adding player result:",err);
            }
        }else if(!this.state.finished){
            courseState.abandoned = true;
            courseState.elapsedMs = (Date.now() - this.state.startTime);
            courseState.shoots = this.state?.shoots || 0;
            const {x,y,z} = this.lastSleepBallPosition || {};
            courseState.recoveredLastBallPosition = x && y && z && [x,y,z] || null;
            try{
                tryFetch(1, `${TOURNAMENTS_URL}/api/update-tournament-participant`,{
                    method:"POST",
                    body:JSON.stringify(this.participation),
                    headers:{"Content-Type":"application/json"},
                }).then(()=>{},()=>{});
            }catch(err){
                console.error("Error adding player result:",err);
            }
        }
        if(this.frameReproduction) this.frameReproduction.dispose()
        this.clock.clear();
        this.interval && clearInterval(this.interval);
        const apiKey = process.env.GOLF_API_KEY;
        try{
            //TODO dont send when server restarted for isQualityAbandoned
            const isQualityAbandoned = !this.state.finished || this.isOverdue(this.state.endTime) || !this.state.endTime;//TODO caution with this overdue, onDispose takes some time to be executed
            const timesAbandoned = isQualityAbandoned?(this.courseDefinition?.timesAbandoned||0)+1:this.courseDefinition.timesAbandoned;
            const {timesPlayed} = this.courseDefinition;
            const area = Math.floor(calculateAreaFromBB(this.ballBoundingBox));
            const distance = Math.floor(this.golfPlay.getDistance());
            const spentTime = Math.floor((this.state.endTime - this.state.startTime)/1000);
            const averageTime = Math.floor(addAverage(timesPlayed, this.courseDefinition.averageTime||0, spentTime));
            const averageShoots = Math.floor(addAverage(timesPlayed, this.courseDefinition.averageShoots||0, this.state.shoots||0));
            const averageArea = Math.floor(addAverage(timesPlayed, this.courseDefinition.averageArea||0, area));
            const averageDistance = Math.floor(addAverage(timesPlayed, this.courseDefinition.averageDistance||0, distance));
            console.log("this.courseDefinition", {...this.courseDefinition, definition:undefined, parts:undefined, });

            console.log("sending evaluation data", {  alias:this.gameDefinition.courseId,
                timesPlayed:(this.courseDefinition?.timesPlayed||0)+1,
                timesAbandoned,
                averageTime,
                averageShoots,
                spentTime,
                averageArea,
                averageDistance,
                area,
                distance,
                shoots:this.state.shoots
            });

            if(area){
                const partTypes = Array.from(new Set(this.courseDefinition.parts.map(p=>p.subtype)));
                console.log("partTypes", partTypes);
                await fetch(`https://golfcraftgame.com/api/update-course-valuation`, {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify({//TODO move logix to endpoint , just send 1,0 and time played
                        alias:this.gameDefinition.courseId,
                        timesPlayed:(this.courseDefinition?.timesPlayed||0)+1,
                        timesAbandoned,
                        averageTime,
                        averageShoots,
                        averageArea,
                        averageDistance,
                        partTypes
                    })
                });
            }

            callDiscordHook(`map:${this.gameDefinition.courseId} area: ${area} shoots:${this.state.shoots} distance:${distance}`);
            console.log("dates", this.state.startTime, this.state.endTime);
            const playerGameData = {
                apiKey,
                address:this.user.address || this.user.userId,
                PlayFabId:this.user.PlayFabId,
                course_alias:this.gameDefinition.courseId,
                startTime:this.state.startTime && new Date(this.state.startTime).toISOString() || null,
                endTime:this.state.endTime && new Date(this.state.endTime).toISOString() || null,
                time:this.state.endTime - this.state.startTime,
                gameMode:"tournament",
                subType:1,
                data:JSON.stringify({
                    tournamentID:this.tournamentData.ID,
                    participationID:this.participation.participationID,
                    playedMaps:this.participation.data.courseStates.length
                })
            }
            if(playerGameData.time > 0){
                await fetch(`https://golfcraftgame.com/api/player-game`, {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                    },
                    body:JSON.stringify(playerGameData)
                });
                console.log("sent player game data");
            }else{
                console.log("SOMETHING WRONG ON PLAYED GAME")
            }
        }catch(error){
            console.log("error",error)
        }

        this.golfPlay && this.golfPlay.dispose();

        function addAverage(timesPlayed, currentAverage, added){
            return  ((!timesPlayed || !currentAverage) && added)
                    ? added
                    : (timesPlayed * currentAverage + added) / (timesPlayed+1)
        }
    }
}

function calculateAreaFromBB(bb){
    const x = Math.abs(bb.ax - bb.bx);
    const y = Math.abs(bb.ay - bb.by);
    const z = Math.abs(bb.az - bb.bz);
    return x*y*z;
}