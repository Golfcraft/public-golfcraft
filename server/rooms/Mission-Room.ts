import { Room } from "colyseus";
import {PlayFabServer} from "playfab-sdk";
import {LEAVE_CODE, STATISTICS, TRAINING} from "../../common/constants";
import { promisify } from "util";
import { GameDefinition } from "../../common/game-definition-type";
import {creatServerGolfPlay} from "./golfplay-server";
import { getCourseDefinition } from "../../common/course-definitions/course-definition-repository";
import { migrateCourseDefinitionAnimations } from "../../common/course-animations-migration";
import { createEventManager } from "../../scene/golfplay/src/services/EventManagerFactory";
import { Gameplay, Vector3 } from "./GamePlayState";
import MESSAGE from "./mesages";
import { EVENT } from "../../scene/golfplay/src/gameplay-handlers/handler-def";
import { sleep } from "../../common/utils";
import {createFrameReproduction} from "../../common/frame-reproductor";
import fetch from "cross-fetch";
import MESSAGES from "./mesages";

const playfabServerApiKey = process.env.PLAYFAB_API_KEY;
class TrainingRaceState extends Gameplay {
    constructor(courseDefinition){
        super(courseDefinition, true);
        this.startTime = Date.now() + 5000;
        this.duration = courseDefinition.metadata.duration;        
    }
}

export class MissionRoom extends Room<TrainingRaceState> {
    private interval:ReturnType<typeof setInterval>;
    private gameDefinition:GameDefinition;
    private golfPlay;
    private courseDefinition;
    private cannonParts;
    
    lastPingTimeMs;
    lastPingMs;
    frameEventHandler = createEventManager();
    frameReproduction = null;

    async onAuth(client, {PlayFabId, gameDefinition}, request){
        console.log("Test-Room onAuth", PlayFabId)
        try {
            const {data} = await promisify(PlayFabServer.GetPlayerStatistics)({PlayFabId, StatisticNames:["current_mission"]});
            const missionOnServer = Number(data.Statistics[0]?.Value || 1);
            if(missionOnServer !== Number(gameDefinition.courseId.replace("mission-",""))){
                console.log("onAuth error, invalid mission",gameDefinition.courseId, missionOnServer );
                return false;
            }
            return true;
        }catch(error){
            return false;
        }
    }

    clockCheck({client, userId, PlayFabId}){
        if(!this.state.finished && this.isOverdue()){
            this.state.finished = true;
            //await this.completeTrainingOnPlayfab({success:false, PlayFabId, currentTrainingID:this.gameDefinition.subType});
            client.leave(LEAVE_CODE.TIMEOUT);
            clearInterval(this.interval);
            this.state.finished = true;
            this.golfPlay.dispose();
        }
    }

    async onCreate({realm, user, userId, PlayFabId, gameDefinition, courseDefinition, cannonParts}) {//TODO client shouldn't define gameDefinition, it should inherit from currentTrainingID from player               
        if(gameDefinition){
            this.gameDefinition = gameDefinition;
        }
        this.courseDefinition = courseDefinition || migrateCourseDefinitionAnimations(await getCourseDefinition(gameDefinition, fetch));
        this.cannonParts = cannonParts;
        this.setState(new TrainingRaceState(this.courseDefinition));
    }

    isOverdue(){        
        return Date.now() > (this.state.startTime + this.state.duration*1000);
    }
    
    async onJoin(client, {realm, user, userId, PlayFabId, gameDefinition, courseDefinition, cannonParts, golfclub}){
        console.log("Test-Room join",{realm, user, userId})
        //const {data} = await promisify(PlayFabServer.GetUserReadOnlyData)({PlayFabId});
       // const currentTrainingID = data.Data.currentTrainingID.Value;
    //    const currentTrainingCourseID = data.Data.currentTrainingCourseID.Value;
        const checkpointsLength = this.courseDefinition.parts.filter(p=>p.type==="checkpoint").length;
        const zone = this.courseDefinition.parts.find(p=>p.type==="zone");
        
        /* this.gameDefinition = this.gameDefinition || {
            type:"training",
            subType:currentTrainingID,
            courseId:currentTrainingCourseID
        };   */
 
        this.golfPlay = await creatServerGolfPlay({
            gameDefinition:this.gameDefinition,
            courseDefinition:this.courseDefinition,
            cannonParts:this.cannonParts,
            timeStep:1/(60*4)
        });
        //this.clock.start();
        console.log("broadcast START")
        //TODO don't send START onJoin, send it when client sends READY
        this.onMessage(MESSAGE.FIX_BUGS, () => {
            this.state.started = true;
            this.state.finished = false;
            this.golfPlay.setIdle(true);
        });

        this.onMessage(MESSAGE.READY, ()=>{
            this.state.startTime = Date.now() + 12000;
            client.send(MESSAGES.START, {
                startTime: this.state.startTime,
                serverTime: Date.now(),
                duration:this.state.duration,
                courseAlias:this.courseDefinition.alias
            });

            this.update = this.update.bind(this);
            this.setSimulationInterval((deltaTime) => this.update(deltaTime/1000), 30);
            this.interval = setInterval(() => this.clockCheck({client, userId, PlayFabId}), 100);
            this.golfPlay.onUpdate(({ball, movingParts}) => {//DUMMY SERVER
                //if(ball) this.state.ball.updateFromCANNON(ball);
                if(movingParts) {
                    movingParts.forEach((movingPart, index)=>{
                        this.state.movingParts[index].updateFromCANNON(movingPart);
                    })
                }
            });
            this.golfPlay.onFinish(async ()=>{
                this.state.finished = true;
                this.golfPlay.dispose();

                await this.completeAndSendResult({client, PlayFabId});
            });
            this.broadcast(MESSAGE.VARIABLE_INITIALIZATION, this.golfPlay.getExpressionState());
            this.frameEventHandler.onEvent(EVENT.ANY, async ({type, data}) => { //TODO MOVE TO golfplay-server (bridge)
                if(this.state.finished) return;
                this.golfPlay.updateHandlers(0);
                if( type === EVENT.CHECKPOINT ){
                    const {checkpoint, index} = data;
                    if( index === (checkpointsLength-1) ) {
                        this.state.finished = true;
                        await this.completeAndSendResult({client, PlayFabId});
                    } else {
                        client.send(MESSAGE.CHECKPOINT, {checkpoint, index});
                    }
                } else if(type === EVENT.ZONE) {//zone is triggered when sleep, and contains info with distance from ball to center of zone
                    const {distance} = data;
                    const success = distance <= zone.scale[0];
                    this.state.finished = true;

                    if(success){
                        await this.completeAndSendResult({client, PlayFabId});
                    }else{
                        await this.completeMissionOnPlayFab({
                            PlayFabId,
                            success, gameDefinition:this.gameDefinition
                        });
                        client.leave(LEAVE_CODE.FAILED);
                    }

                } else if(type === EVENT.VOXTER){
                    const {voxter, index, hit, isLast} = data;
                    console.log("frame voxter", index, hit, isLast);
                    if(isLast){

                        this.state.finished = true;
                        //client.send("VOXTER", {voxter, index, isLast});

                        await this.completeAndSendResult({client, PlayFabId});
                    } else {
                        //client.send("VOXTER", {voxter, index, isLast});
                    }
                } else if(type === EVENT.HOLE) {
                    this.state.finished = true;
                    //client.send("HOLE", {});
                    if(this.gameDefinition.subType === "4"){
                        await this.completeAndSendResult({client, PlayFabId, golfclub});
                    }
                } else if(type === EVENT.SLEEP){
                    /* if(this.gameDefinition.subType === "4"){
                        if(this.state.shoots === 3){
                            this.state.finished = true;
                            await this.completeTrainingOnPlayfab({success:false, PlayFabId, currentTrainingID:this.gameDefinition.subType});
                            client.leave(LEAVE_CODE.FAILED);
                        }
                    } */
                }else if(type === EVENT.OUT) {
                    if (this.gameDefinition.subType === TRAINING.HOLE && this.state.shoots === 3) {
                        this.state.finished = true;
                        await this.completeMissionOnPlayFab({
                            success: false,
                            PlayFabId,
                            gameDefinition: this.gameDefinition
                        });
                        client.leave(LEAVE_CODE.FAILED);
                    } else if (this.gameDefinition.subType === TRAINING.ZONE) {
                        this.state.finished = true;
                        await this.completeMissionOnPlayFab({
                            success: false,
                            PlayFabId,
                            gameDefinition: this.gameDefinition
                        });
                        client.leave(LEAVE_CODE.FAILED);
                    }
                }else{
                    console.log("unmatched frame event", type, data);
                }
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


        });

        this.lastPingTimeMs = 0;
        this.onMessage(MESSAGE.PING, (client)=>{
            client.send(MESSAGE.PONG);
            this.lastPingTimeMs = Date.now();
        });
        this.onMessage(MESSAGE.PING2, ()=>{
            this.lastPingMs = Date.now()-this.lastPingTimeMs;//TODO apply?
        });
    }
    
    async completeAndSendResult ({client, PlayFabId}:any) {//TODO handle success/fail
        const time = Date.now() - this.state.startTime;
        await this.completeMissionOnPlayFab({success:true, PlayFabId, gameDefinition:this.gameDefinition});
        //const {FunctionResult} = data;
        client.send(MESSAGE.COMPLETED, {
            xp:0,
            GC:0,
            shoots:this.state.shoots,
            time
        });

        setTimeout(()=>{
            client.leave(LEAVE_CODE.COMPLETED);
        },1000);
    }

    async onLeave(client, consented){
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
        if(this.frameReproduction) this.frameReproduction.dispose()
        this.clock.clear();
        this.interval && clearInterval(this.interval);
        this.golfPlay && this.golfPlay.dispose();
    }

    async completeMissionOnPlayFab({success, PlayFabId, gameDefinition}){
        const FunctionParameter = {
            PlayFabId,
            currentMission:Number(gameDefinition.courseId.replace("mission-",""))
        };
        console.log("completeMissionOnPlayFab FunctionParameter",FunctionParameter)
        const result = await promisify(PlayFabServer.ExecuteCloudScript)({
            PlayFabId,
            FunctionName:"completeMission",
            FunctionParameter
        });
        console.log("completeMissionOnPlayFab result", JSON.stringify(result))
        return result;
    }
   
    private update(dt){        
        if(this.state.finished) {
            //console.log("FINISHED, avoid update");
            return
        }
        
        if(this.frameReproduction){
            this.frameReproduction.update(dt);
        }

        this.golfPlay.updateAnimations(dt);
    }
}
