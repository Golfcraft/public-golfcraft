import { Room } from "colyseus";
import { Schema, ArraySchema, MapSchema, type } from "@colyseus/schema";
import { LEAVE_CODE, PRICE_COMPETITION_GROUP } from "../../common/constants";
import { tryFetch } from "../utils/try-fetch";
import { PlayFab, PlayFabServer } from "playfab-sdk";
import { promisify } from "util";
import { creatServerGolfPlay } from "./golfplay-server";
import {Gameplay, Vector3, Quaternion} from "./GamePlayState";
import { getCourseDefinition } from "../../common/course-definitions/course-definition-repository";
import { GameDefinition } from "../../common/game-definition-type";
import { migrateCourseDefinitionAnimations, withNoiseOnStartPosition } from "../../common/course-animations-migration";
import MESSAGES from "./mesages";
import {createFrameReproduction} from "../../common/frame-reproductor";
import { createEventManager } from "../../scene/golfplay/src/services/EventManagerFactory";
import { EVENT } from "../../scene/golfplay/src/gameplay-handlers/handler-def";
import MESSAGE from "./mesages";
import { sleep } from "../../common/utils";
import fetch from "cross-fetch";

var fs = require("fs");
if(!fs.existsSync(`shoots.log`)){
    fs.writeFileSync(`shoots.log`, "", "utf8");
}
const apiKey = process.env.GOLF_API_KEY;
const GROUP_MATCHER_URL = process.env.PROD?"http://52.12.188.146/golfcraft-competition":"http://localhost:2568";
class CompetitionGroupState extends Gameplay {

    constructor(courseDefinition){
        super(courseDefinition);
        const ballSpawnDefinition:any = courseDefinition.parts.find(p=>p.type === "initial_position");
        this.startTime = Date.now() + 5000;
        this.duration = courseDefinition.metadata.duration;
    }
}
type CompetitionGroupPlayer = {//TODO duplicated code :refactor
    userId:string,
    lobbySessionId?:string,
    server:string,
    displayName:string,
    startTime:number,
    shoots?:any[],
    holeTime?:number,
    PlayFabId:string
  };
  
  type CompetitionGroupRoomRepresentation = {
    id:string,
    finished?:boolean,
    courseId:string,
    players:{
        [userId:string]:CompetitionGroupPlayer
    }
  }

export class CompetitionGroupRoom extends Room<CompetitionGroupState> {
    private interval:ReturnType<typeof setInterval>;
    private groupRepresentation:CompetitionGroupRoomRepresentation;
    private golfPlay;
    private gameDefinition;
    private courseDefinition;
    private frameReproduction = null;
    private UserInventory;
    lastPingTimeMs;
    lastPingMs;
    frameEventHandler = createEventManager();
    
    async onAuth(client, {PlayFabId, clientInfo}, request){
        //TODO ensure it is the correct group
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
        
        return true;
    }

    async clockCheck({client, userId, PlayFabId}){
        const holeTime = this.groupRepresentation?.players[userId]?.holeTime;
        if(!this.state.finished && (this.isOverdue(Date.now()) || this.isOverdue(holeTime))){    
            clearInterval(this.interval);
            this.state.finished = true;
            this.golfPlay.dispose();          
            this.broadcastUpdateGroupListToOtherPlayers({userId, group:this.groupRepresentation});  
            client.leave(LEAVE_CODE.TIMEOUT);                
        }
    }

    private async broadcastUpdateGroupListToOtherPlayers({userId, group}){
        tryFetch(3, `${GROUP_MATCHER_URL}/notify-group-update`, {
            method:'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({
                groupId:group.id,
                userId
            })
        });
    }

    private async getGroupById({groupId}){    
        return await tryFetch(5,`${GROUP_MATCHER_URL}/get-group-by-id`, {
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({
                groupId
            })
        }).then(r=>r.json(), (err)=>{
            console.error(err);
        });
    }

    private user;
    async onCreate({user, userId, groupId, gameDefinition, PlayFabId}){  
        this.user = user;
        this.groupRepresentation = await this.getGroupById({groupId});
        
        this.gameDefinition = {
            type: "competition", 
            subType: "1",
            courseId:this.groupRepresentation.courseId
        };

        const originalCourseDef:any = await getCourseDefinition(this.gameDefinition, fetch);
        this.courseDefinition = migrateCourseDefinitionAnimations(originalCourseDef, [withNoiseOnStartPosition]);
        this.setState(new CompetitionGroupState(this.courseDefinition));   
    }
    
    private isOverdue(time?:number){
        return (time||Date.now()) > (this.state.startTime + this.state.duration*1000);
    }

    
    private update(dt){
        if(this.state.finished) return;
        if(this.frameReproduction){
            this.frameReproduction.update(dt);
        }

        this.golfPlay.updateAnimations(dt);
    }
    
    async onJoin(client, {realm, groupId, PlayFabId, userId, user, clientInfo, lobbySessionId}){
        if(!this.groupRepresentation?.courseId){
            console.log("problem on group", this.groupRepresentation);
            promisify(PlayFabServer.AddUserVirtualCurrency)({
                PlayFabId,
                VirtualCurrency:"GC",
                Amount:20
            });
            client.leave(LEAVE_CODE.PROBLEM);
        }
        promisify(PlayFabServer.UpdateUserData)({
                    PlayFabId,
                    Data:{
                        clientInfo:JSON.stringify(clientInfo)
                    }
        }).then(()=>{},(err)=>{console.log("error saving clientInfo",PlayFabId,clientInfo,err)});
        this.golfPlay = await creatServerGolfPlay({
            gameDefinition:<GameDefinition>this.gameDefinition,
            courseDefinition:this.courseDefinition,
            timeStep:1/(60*4)
        });       
        this.clock.start();
        this.update = this.update.bind(this);        
        this.groupRepresentation.players[user.userId].lobbySessionId = lobbySessionId;
        this.groupRepresentation.players[user.userId].startTime = this.state.startTime; 
                     
        this.interval = setInterval(() => this.clockCheck({client, userId, PlayFabId}), 300); 
        this.setSimulationInterval((deltaTime) => this.update(deltaTime/1000), 15);
        this.broadcast(MESSAGES.START, {startTime:this.state.startTime, duration:this.state.duration, serverTime:Date.now()});
        
         this.golfPlay.onUpdate(({ball, movingParts})=>{
            //if(ball) this.state.ball.updateFromCANNON(ball);
            if(movingParts) {
                movingParts.forEach((movingPart, index)=>{
                    this.state.movingParts[index].updateFromCANNON(movingPart);
                })
            }
        }); 
        let initializedExpressionState = false;
        this.golfPlay.onEvent(({type, data})=>{
            if(!initializedExpressionState && type === EVENT.EVENT_VARIABLE_CHANGE){
                client.send("EVENT_VARIABLE_CHANGE", {data});
                initializedExpressionState = true;
            }            
        });
        
        tryFetch(5,`${GROUP_MATCHER_URL}/player-start`,{
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({
                player:this.groupRepresentation.players[user.userId],
                groupId:this.groupRepresentation.id
            })
        });  

        this.frameEventHandler.onEvent(EVENT.OUT, ()=>{
            if(this.state.finished) return;
        });

        this.frameEventHandler.onEvent(EVENT.ANY, async ({type, data}) => { //TODO MOVE TO golfplay-server (bridge)
            if(this.state.finished) return;
            this.golfPlay.updateHandlers(0);
            if(type === EVENT.HOLE){
                this.state.finished = true;
                this.completeGame({userId, PlayFabId, client})
            }
        });
        
        this.onMessage(MESSAGES.PING, (client)=>{
            client.send(MESSAGES.PONG);
            this.lastPingTimeMs = Date.now();
        });
        this.onMessage(MESSAGE.PING2, ()=>{
            this.lastPingMs = Date.now()-this.lastPingTimeMs;//TODO apply?
        });
        this.onMessage(MESSAGES.SHOOT, async (client, {impulse, timeStep, delayMs})=>{
            if(!this.state.finished && !this.isOverdue()) {
                this.state.shoots = this.state.shoots + 1;
                this.groupRepresentation.players[user.userId].shoots = this.groupRepresentation.players[user.userId].shoots || [];
                this.groupRepresentation.players[user.userId].shoots.push({
                    impulse:impulse,
                    date:Date.now()
                });       
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

        return 123;
    }

    async completeGame({PlayFabId, client, userId}){
        const bonus = 1;//getBonusFromUserInventory(this.UserInventory);
        const xpReward = this.courseDefinition.metadata.xp||0;
        const gcReward = this.courseDefinition.metadata.GC||0;

        if(this.isOverdue()) return;
        this.state.endTime = Date.now();
        this.state.finished = true;

        client.send(MESSAGES.COMPLETED, { xp: xpReward * bonus, time:Date.now()-this.state.startTime, shoots:this.state.shoots, GC:gcReward * bonus, bonus });
        setTimeout(()=>{
            client.leave(LEAVE_CODE.COMPLETED);
            this.broadcastUpdateGroupListToOtherPlayers({userId, group:this.groupRepresentation});
        }, 1000);

        this.golfPlay.dispose();
        this.groupRepresentation.players[userId].holeTime = Date.now();
        
    //    fs.appendFileSync("shoots.log",`\n${this.user.displayName} ${this.gameDefinition.courseId} ${millisecondsToTime(Date.now()-this.state.startTime)} ${JSON.stringify(this.groupRepresentation.players[this.user.userId].shoots)}`)


        await promisify(PlayFabServer.ExecuteCloudScript)({
            PlayFabId,
            FunctionName:'increaseXp',
            FunctionParameter:{
                PlayFabId,
                Amount:xpReward * bonus
            }
        });
        await promisify(PlayFabServer.AddUserVirtualCurrency)({
            PlayFabId,
            Amount:gcReward * bonus,
            VirtualCurrency:"GC"
        });

        try{
            tryFetch(4, `${GROUP_MATCHER_URL}/add-player-result`,{
                method:"POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify({
                    playerResult:this.groupRepresentation.players[userId],
                    groupId:this.groupRepresentation.id
                })
            } )
        }catch(err){
            console.error("Error adding player result:",err);
        }
        const playerGameData = {
            apiKey,
            address:this.user.address || this.user.userId,
            PlayFabId,
            course_alias:this.gameDefinition.courseId,
            startTime:new Date(this.state.startTime).toISOString(),
            endTime:this.state.endTime && new Date(this.state.endTime).toISOString() || null,
            time:this.state.endTime - this.state.startTime,
            gameMode:"competition",
            subType:1,
            data:null
        }
        await fetch(`https://golfcraftgame.com/api/player-game`, {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
            },
            body:JSON.stringify(playerGameData)
        });


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
}

function millisecondsToTime(milli)
{
      var milliseconds = milli % 1000;
      var seconds = Math.floor((milli / 1000) % 60);
      var minutes = Math.floor((milli / (60 * 1000)) % 60);

      return minutes + ":" + seconds + "." + milliseconds;
}