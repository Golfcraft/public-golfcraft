import { Room } from "colyseus";
import {PlayFabServer} from "playfab-sdk";
import {LEAVE_CODE, STATISTICS, TRAINING, USE_REMOTE_SERVER} from "../../common/constants";
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

const playfabServerApiKey = process.env.PLAYFAB_API_KEY;
class TrainingRaceState extends Gameplay {
    constructor(courseDefinition){
        super(courseDefinition, true);
        this.startTime = Date.now() + 5000;
        this.duration = courseDefinition.metadata.duration;
    }
}

export class ValidateRoom extends Room<TrainingRaceState> {
    private interval:ReturnType<typeof setInterval>;
    private gameDefinition:GameDefinition;
    private golfPlay;
    private courseDefinition;
    private cannonParts;

    lastPingTimeMs;
    lastPingMs;
    frameEventHandler = createEventManager();
    frameReproduction = null;

    async onAuth(client, {PlayFabId}, request){
        //TODO verify currentTrainingID
        //TODO avoid impersonation
        return true;
    }

    async clockCheck({client, userId, PlayFabId}){
        if(!this.state.finished && this.isOverdue()){
            this.state.finished = true;
            //await this.completeTrainingOnPlayfab({success:false, PlayFabId, currentTrainingID:this.gameDefinition.subType});
            client.leave(LEAVE_CODE.TIMEOUT);
        }
    }

    async onCreate({realm, user, userId, PlayFabId, gameDefinition, courseDefinition, cannonParts}) {//TODO client shouldn't define gameDefinition, it should inherit from currentTrainingID from player
        console.log("onCreate test-validate room", gameDefinition, !!courseDefinition, cannonParts && Object.keys(cannonParts).length);
        if(gameDefinition){
            this.gameDefinition = gameDefinition;
        }
        this.courseDefinition = courseDefinition || migrateCourseDefinitionAnimations(await getCourseDefinition(gameDefinition, fetch, true));
        this.cannonParts = cannonParts;
        this.setState(new TrainingRaceState(this.courseDefinition));
    }

    isOverdue(){
        return Date.now() > (this.state.startTime + this.state.duration*1000);
    }

    async onJoin(client, {realm, user, userId, PlayFabId, gameDefinition, courseDefinition, cannonParts, golfclub}){
        this.golfPlay = await creatServerGolfPlay({
            gameDefinition:this.gameDefinition,
            courseDefinition:this.courseDefinition,
            cannonParts:this.cannonParts,
            timeStep:1/(60*4)
        });
        //this.clock.start();
        this.broadcast(MESSAGE.START, {startTime:this.state.startTime, duration:this.state.duration, serverTime:Date.now()});

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

            await this.completeAndSendResult({client, userId, PlayFabId, golfclub});
        });
        this.broadcast(MESSAGE.VARIABLE_INITIALIZATION, this.golfPlay.getExpressionState());

        this.frameEventHandler.onEvent(EVENT.ANY, async ({type, data}) => { //TODO MOVE TO golfplay-server (bridge)
            if(this.state.finished) return;
            this.golfPlay.updateHandlers(0);
            if(type === EVENT.HOLE) {
                this.state.finished = true;
                //client.send("HOLE", {});
                await this.completeAndSendResult({client, userId, PlayFabId, golfclub});
            }else if(type === EVENT.OUT){
            }
        });

        this.lastPingTimeMs = 0;
        this.onMessage(MESSAGE.PING, (client)=>{
            client.send(MESSAGE.PONG);
            this.lastPingTimeMs = Date.now();
        });
        this.onMessage(MESSAGE.PING2, ()=>{
            this.lastPingMs = Date.now()-this.lastPingTimeMs;//TODO apply?
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
        })
    }

    async completeAndSendResult ({client, userId, success, golfclub}:any) {//TODO handle success/fail
        if(this.isOverdue()) return;

        setTimeout(()=>{
            client.leave(LEAVE_CODE.COMPLETED);
        },1000);
        if(golfclub.power !== 0) return;
        const time = Date.now() - this.state.startTime;
        client.send(MESSAGE.COMPLETED, {
            xp:0,
            GC:0,
            shoots:this.state.shoots,
            time
        });
        const baseURL = USE_REMOTE_SERVER?`https://golfcraftgame.com`:`http://localhost:2569`;
        const apiKey = process.env.GOLF_API_KEY;


        if(userId !== "admin-editor"){
           await fetch(`${baseURL}/api/editor-course-validate`,{
                method:"POST",
                body:JSON.stringify({
                    apiKey,
                    alias:this.gameDefinition.courseId
                }),
                headers:{"Content-Type":"application/json"}
            }).then(r=>r.json()).then(()=>{
                console.log("Validated!", this.gameDefinition.courseId);
            })
        }
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
        if(this.frameReproduction) this.frameReproduction.dispose();
        this.clock.clear();
        this.interval && clearInterval(this.interval);
        this.golfPlay && this.golfPlay.dispose();
    }

    completeTrainingOnPlayfab({success, PlayFabId, currentTrainingID}){
        return Promise.resolve();
        return promisify(PlayFabServer.ExecuteCloudScript)({
            PlayFabId,
            FunctionName:'completeTraining',
            FunctionParameter:{
                xp:this.courseDefinition.metadata.xp||10,
                GC:this.courseDefinition.metadata.GC||5,
                apiKey:playfabServerApiKey,
                PlayFabId,
                trainingID:currentTrainingID,
                success,
                playedTime:Date.now()-this.state.startTime
            }
        });
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
