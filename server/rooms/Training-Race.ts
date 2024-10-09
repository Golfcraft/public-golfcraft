import { Room } from "colyseus";
import { Schema, ArraySchema, MapSchema, type } from "@colyseus/schema";
import {PlayFabServer} from "playfab-sdk";
import {LEAVE_CODE, STATISTICS, TRAINING} from "../../common/constants";
import { promisify } from "util";
import { GameDefinition } from "../../common/game-definition-type";
import {creatServerGolfPlay} from "./golfplay-server";
import {courseDefinitionsRepo, getCourseDefinition} from "../../common/course-definitions/course-definition-repository";
import { migrateCourseDefinitionAnimations } from "../../common/course-animations-migration";
import { createEventManager } from "../../scene/golfplay/src/services/EventManagerFactory";
import { Gameplay, Vector3 } from "./GamePlayState";
import MESSAGE from "./mesages";
import { EVENT } from "../../scene/golfplay/src/gameplay-handlers/handler-def";
import {getLevelInfo, getRandomFromList, getRandomInt, sleep} from "../../common/utils";
import {createFrameReproduction} from "../../common/frame-reproductor";
import fetch from "cross-fetch";
import {fetchRemoteCoursesData, RemoteCourseData} from "../../common/fetch-remote-courses";
const apiKey = process.env.GOLF_API_KEY;
const playfabServerApiKey = process.env.PLAYFAB_API_KEY;
class TrainingRaceState extends Gameplay {
    @type("string")
    displayName;

    constructor(courseDefinition){
        super(courseDefinition);
        this.startTime = Date.now() + 5000;
        this.duration = courseDefinition.metadata.duration;        
    }
}

export class TrainingRace extends Room<TrainingRaceState> {
    private interval:ReturnType<typeof setInterval>;
    private gameDefinition:GameDefinition;
    private golfPlay;
    private courseDefinition;
    lastPingTimeMs;
    lastPingMs;
    frameEventHandler = createEventManager();
    frameReproduction = null;
    playerBonus = {}; //PlayFabId:bonus

    async onAuth(client, {PlayFabId, clientInfo}, request){
        //TODO verify currentTrainingID
        //TODO avoid impersonation
        return true;
    }

    async clockCheck({client, userId, PlayFabId}){
        if(!this.state.finished && this.isOverdue()){
            this.state.finished = true;
            await this.completeTrainingOnPlayfab({success:false, PlayFabId, currentTrainingID:this.gameDefinition.subType, materialDrops:undefined});
            client.leave(LEAVE_CODE.TIMEOUT);
        }
    }

    async onCreate({realm, user, userId, PlayFabId, gameDefinition}) {//TODO client shouldn't define gameDefinition, it should inherit from currentTrainingID from player       
        if(gameDefinition){
            this.gameDefinition = gameDefinition;
        }
        this.courseDefinition = migrateCourseDefinitionAnimations(await getCourseDefinition(gameDefinition, fetch));
        console.log("metadata", this.courseDefinition.metadata);
        this.setState(new TrainingRaceState(this.courseDefinition));
        this.completeAndSendResult = this.completeAndSendResult.bind(this);
        this.completeTrainingOnPlayfab = this.completeTrainingOnPlayfab.bind(this);
    }

    isOverdue(){        
        return Date.now() > (this.state.startTime + this.state.duration*1000);
    }
    
    async onJoin(client, {realm, user, userId, PlayFabId, clientInfo}){
        const {data} = await promisify(PlayFabServer.GetUserReadOnlyData)({PlayFabId});
        const {training} = await promisify(PlayFabServer.ExecuteCloudScript)({
            FunctionName:"getUserBonus",
            FunctionParameter:{PlayFabId},
            PlayFabId
        }).then(r=>r.data.FunctionResult);
        this.playerBonus[PlayFabId] = training;
        const currentTrainingID = data.Data.currentTrainingID.Value;
        const currentTrainingCourseID = data.Data.currentTrainingCourseID.Value;
        const checkpointsLength = this.courseDefinition.parts.filter(p=>p.type==="checkpoint").length;
        const zone = this.courseDefinition.parts.find(p=>p.type==="zone");
        this.state.displayName = user.displayName;
        this.gameDefinition = this.gameDefinition || {
            type:"training",
            subType:currentTrainingID,
            courseId:currentTrainingCourseID
        };  
 
        this.golfPlay = await creatServerGolfPlay({
            gameDefinition:this.gameDefinition,
            courseDefinition:this.courseDefinition,
            timeStep:1/(60*4)
        });
        
        this.clock.start();
        this.broadcast(MESSAGE.START, {startTime:this.state.startTime, duration:this.state.duration, serverTime:Date.now()});
        this.update = this.update.bind(this);        
        this.setSimulationInterval((deltaTime) => this.update(deltaTime/1000), 30);
        this.interval = setInterval(() => this.clockCheck({client, userId, PlayFabId}), 100); 
        this.golfPlay.onUpdate(({ball, movingParts}) => {
            //if(ball) this.state.ball.updateFromCANNON(ball); 
            if(movingParts && this.state.movingParts) {
                movingParts.forEach((movingPart, index)=>{
                    this.state.movingParts[index].updateFromCANNON(movingPart);
                })
            }
        }); 
        let initializedExpressionState = false;
        this.golfPlay.onEvent(({type, data})=>{
            console.log("training race golfplay event ", type, data);
            if(!initializedExpressionState && type === EVENT.EVENT_VARIABLE_CHANGE){
                client.send("EVENT_VARIABLE_CHANGE", {data});
                initializedExpressionState = true;
            }            
        });
        this.golfPlay.onFinish(async ()=>{
            this.state.finished = true;
            this.golfPlay.dispose();
            
            await this.completeAndSendResult({client, PlayFabId});
        });
        let hitVoxters = 0;
        let checkpoints = 0;
        this.frameEventHandler.onEvent(EVENT.ANY, async ({type, data}) => { //TODO MOVE TO golfplay-server (bridge)
            if(this.state.finished) return;
            this.golfPlay.updateHandlers(0);
            if( type === EVENT.CHECKPOINT ){
                const {checkpoint, index} = data;
                checkpoints++;
                if( index === (checkpointsLength-1) || (checkpoints === checkpointsLength) ) {
                    this.state.finished = true;
                    await this.completeAndSendResult({client, PlayFabId});
                } else {
                    client.send(MESSAGE.CHECKPOINT, {checkpoint, index, altIndex:checkpoints-1});
                }
            } else if(type === EVENT.ZONE) {//zone is triggered when sleep, and contains info with distance from ball to center of zone
                const {distance} = data;
                const success = distance <= zone.scale[0];
                this.state.finished = true;
                
                if(success){
                    await this.completeAndSendResult({client, PlayFabId});
                }else{
                    await this.completeTrainingOnPlayfab({
                        PlayFabId,
                        success, currentTrainingID:this.gameDefinition.subType,
                        materialDrops:undefined
                    });
                    client.leave(LEAVE_CODE.FAILED);
                }
                
            } else if(type === EVENT.VOXTER){
                const voxters = this.courseDefinition.parts.filter(p=>p.type === "voxter");
                const {voxter, index, hit, isLast} = data;
                console.log("frame reproduction event VOXTER", hit, index, isLast, this.state.displayName);
                hitVoxters++;
                if(isLast || hitVoxters === voxters.length){ //TODO || hitVoxters === voxters.length shouldn't be necessary, but there is a but, where "hit" is received duplicated sometimes (maybe because bad connection and async problem)
                    this.state.finished = true;
                    //client.send("VOXTER", {voxter, index, isLast});
                    console.log("voxter finish!")
                    await this.completeAndSendResult({client, PlayFabId});
                } else {
                    
                    client.send(MESSAGE.VOXTER, {voxter, index, hit, isLast});
                }
            } else if(type === EVENT.HOLE) {
                this.state.finished = true;
                //client.send("HOLE", {});
                if(this.gameDefinition.subType === "4"){
                    await this.completeAndSendResult({client, PlayFabId});
                }
            } else if(type === EVENT.SLEEP){
                if(this.gameDefinition.subType === "4"){
                    if(this.state.shoots === 3){
                        this.state.finished = true;
                        await this.completeTrainingOnPlayfab({success:false, PlayFabId, currentTrainingID:this.gameDefinition.subType, materialDrops:undefined});
                        client.leave(LEAVE_CODE.FAILED);
                    }
                }
            }else if(type === EVENT.OUT){
                if(this.gameDefinition.subType === TRAINING.HOLE && this.state.shoots === 3){
                    this.state.finished = true;
                    await this.completeTrainingOnPlayfab({success:false, PlayFabId, currentTrainingID:this.gameDefinition.subType, materialDrops:undefined});
                    client.leave(LEAVE_CODE.FAILED);
                } else if(this.gameDefinition.subType === TRAINING.ZONE){
                    this.state.finished = true;
                    await this.completeTrainingOnPlayfab({success:false, PlayFabId, currentTrainingID:this.gameDefinition.subType, materialDrops:undefined});
                    client.leave(LEAVE_CODE.FAILED);
                }
            }
        });
        
        this.lastPingTimeMs = 0;
        this.onMessage(MESSAGE.PING, (client)=>{
            client.send(MESSAGE.PONG);
            this.lastPingTimeMs = Date.now();
        });
        let savedPing = false;
        this.onMessage(MESSAGE.PING2, ()=>{
            this.lastPingMs = Date.now() - this.lastPingTimeMs;//TODO apply?
            if(!savedPing){
                savedPing = true;
                promisify(PlayFabServer.UpdateUserData)({
                    PlayFabId,
                    Data:{
                        lastPingMs:this.lastPingMs.toString(),
                        clientInfo:JSON.stringify(clientInfo)
                    }
                }).then(()=>{},(err)=>{console.log("error saving lastPingMs",PlayFabId,JSON.stringify(this.gameDefinition),err)});
                if(!clientInfo){
                    setTimeout(()=>{
                        client.leave(LEAVE_CODE.FAILED);
                    },1000);
                }
            }
            //TODO save ping 1 time in user data
        });
       
        this.onMessage(MESSAGE.SHOOT, async (client, {impulse, timeStep, delayMs = 400})=>{
            if(!this.state.finished && !this.isOverdue()) {
                this.state.shoots = this.state.shoots + 1;
                const framesDelayMs = Math.max(0, delayMs - (this.lastPingMs || 0));
                const {frames, processingTimeMs } = this.golfPlay.getFrames({timeStep, impulse, delayMs:framesDelayMs, lastPingMs:this.lastPingMs});
                client.send(MESSAGE.SHOOT_FRAMES, {frames, timeStep, impulse}); 
                await sleep(Math.max(0, delayMs-(processingTimeMs||0)-this.lastPingMs*2));
                client.send(MESSAGE.START_SHOOT_FRAMES);
                await sleep(this.lastPingMs);

                this.golfPlay.setIdle(false);
                
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


    }
    
    async completeAndSendResult ({client, PlayFabId, success}:any) {//TODO handle success/fail
        const time = Date.now() - this.state.startTime;
        const bonus = this.playerBonus[PlayFabId]||1;
        const currentTrainingID = this.gameDefinition.subType;
        const materialDrops = getMaterialsDropForTraining(currentTrainingID,(this.courseDefinition.metadata.xp||5)*bonus);
        client.send(MESSAGE.COMPLETED, {
            xp:Math.floor((this.courseDefinition.metadata.xp||10)*bonus),
            GC:Math.floor((this.courseDefinition.metadata.GC||5)*bonus),
            PT:Math.floor((this.courseDefinition.parts.filter(p=>p.type === "checkpoint" || p.type === "voxter").length)*bonus),
            shoots:this.state.shoots,
            time,
            materialDrops
        });

        await this.completeTrainingOnPlayfab({
            success:true,
            PlayFabId,
            currentTrainingID,
            materialDrops
        });

        client.leave(LEAVE_CODE.COMPLETED);

        function getMaterialsDropForTraining(currentTrainingID,xp){
            const ran = getRandomInt(1,7);
            let selectedMaterial;
            if(ran <= 4){
                selectedMaterial = "WD"
            }else if(ran <= 6){
                selectedMaterial = "ST"
            }else if(ran <= 7){
                selectedMaterial = "IR"
            }

            const amount = Math.max(1, Math.floor(xp / 60));
            return {[selectedMaterial]:amount};
        }
    }

    async onLeave(client, consented){
        //TODO reconnect
        try {
            if(consented){
                throw new Error('consented leave');
            }
            await this.allowReconnection(client, 10);
        } catch(error){
            this.golfPlay.dispose();
        }
    }

    onDispose(){
        if(this.frameReproduction) this.frameReproduction.dispose();
        this.clock.clear();
        this.interval && clearInterval(this.interval);
        this.golfPlay && this.golfPlay.dispose();
    }

    async completeTrainingOnPlayfab({success, PlayFabId, currentTrainingID, materialDrops}){
        const bonus = this.playerBonus[PlayFabId]||1;
        const rewards = {
            xp:Math.floor((this.courseDefinition.metadata.xp||10)*bonus),
            GC:Math.floor((this.courseDefinition.metadata.GC||5)*bonus),
            PT:Math.floor((this.courseDefinition.parts.filter(p=>p.type === "checkpoint" || p.type === "voxter").length)*bonus),
        };
        if(success){
            this.state.endTime = Date.now();
            const rewardsResult = await promisify(PlayFabServer.ExecuteCloudScript)({
                PlayFabId,
                FunctionName:'completeTraining',
                FunctionParameter:{
                    apiKey:playfabServerApiKey,
                    PlayFabId,
                    trainingID:currentTrainingID, //TODO no use
                    success,
                    playedTime:Date.now()-this.state.startTime,
                    materialDrops,
                    ...rewards
                }
            });
            await sleep(50);
            const playerGameData = {
                apiKey,
                //address:this.user.address || this.user.userId,
                PlayFabId:PlayFabId,
                course_alias:this.gameDefinition.courseId,
                startTime:new Date(this.state.startTime).toISOString(),
                endTime:this.state.endTime && new Date(this.state.endTime).toISOString() || null,
                time:this.state.endTime - this.state.startTime,
                gameMode:"training",
                subType:Number(currentTrainingID),
                data:JSON.stringify({rewards})
            }
            console.log("player-game", PlayFabId, JSON.stringify({...playerGameData, apiKey:undefined}));
            await fetch(`https://golfcraftgame.com/api/player-game`, {
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                },
                body:JSON.stringify(playerGameData)
            });
        }
        await setPlayerPlayfabNextTrainingCourse();

        async function setPlayerPlayfabNextTrainingCourse(){
                const trainingCourses = courseDefinitionsRepo.training;
                const nextTrainingSubType = getRandomFromList([1,1,2,2,2,2,2,3,4,4,4,4,4]).toString();
                const remoteTrainings = await fetchRemoteCoursesData({
                    where:{
                        mode:"training",
                        status:2,
                        subType:nextTrainingSubType
                    }
                });
                const localTrainings:RemoteCourseData[] = Object.keys(trainingCourses[nextTrainingSubType]).map((courseId)=>{
                    return {
                        courseId,
                        metadata:trainingCourses[nextTrainingSubType][courseId].metadata || {GC:10,xp:10,minLevel:0}
                    };
                });
                const allTrainingCourseData = [...localTrainings, ...remoteTrainings];
                const xp = await (promisify(PlayFabServer.GetUserReadOnlyData)({
                    PlayFabId,
                    Keys:["xp"]
                }).then(r=>r.data?.Data?.xp?.Value || 1));
                const levelInfo = getLevelInfo(xp);
                const nextCourseId = pickTrainingCourseIdForLevel(levelInfo.currentLevel, allTrainingCourseData).courseId;
                console.log("nextCourseId", nextCourseId);
                const result = await promisify(PlayFabServer.UpdateUserReadOnlyData)({
                    PlayFabId,
                    Data:{
                        currentTrainingID:nextTrainingSubType,
                        currentTrainingCourseID:nextCourseId
                    }
                });

        }

        function pickTrainingCourseIdForLevel(level, allTrainingCourseData){
            const randomIndex = getRandomInt(0, allTrainingCourseData.length-1);
            console.log("allTrainingCourseData.length,index",allTrainingCourseData.length,randomIndex);
            let pickedCourse = allTrainingCourseData[randomIndex];
            console.log("pickedCourse",JSON.stringify(pickedCourse), level, PlayFabId);
            while(pickedCourse.metadata.minLevel > level){
                pickedCourse = pickTrainingCourseIdForLevel(level, allTrainingCourseData);
            }
            return pickedCourse;
        }
    }
   
    private update(dt){        
        if(this.state.finished) return;
        if(this.frameReproduction){
            this.frameReproduction.update(dt);
        }

        this.golfPlay.updateAnimations(dt);
    }
}
