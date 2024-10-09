import { Room } from "colyseus";
import {PlayFabServer} from "playfab-sdk";
import {LEAVE_CODE, STATISTICS, TRAINING} from "../../common/constants";
import { promisify } from "util";
import { GameDefinition } from "../../common/game-definition-type";
import {creatServerGolfPlay} from "./golfplay-server";
import { getCourseDefinition } from "../../common/course-definitions/course-definition-repository";
import { migrateCourseDefinitionAnimations } from "../../common/course-animations-migration";
import { createEventManager } from "../../scene/golfplay/src/services/EventManagerFactory";
import {BallSchema, FrameBufferSchema, Gameplay, KinematicSchema, Vector3} from "./GamePlayState";
import MESSAGE from "./mesages";
import { EVENT } from "../../scene/golfplay/src/gameplay-handlers/handler-def";
import { sleep } from "../../common/utils";
import {createFrameReproduction} from "../../common/frame-reproductor";
import { Schema, ArraySchema, MapSchema, type } from "@colyseus/schema";
import {creatServerGolfPlay2} from "./golfplay-server2";
import fetch from "cross-fetch";
import {getFrames} from "../physics-frames";

const playfabServerApiKey = process.env.PLAYFAB_API_KEY;
const _log = console.log;
//console.log = ()=>{};
console.log(new Date(1664968106911).toISOString());
console.log("2022-10-05T11:08:26.911Z");

const BUFFER_SIZE_TIME = 200;
const FRAMES_UPDATE_INTERVAL = 50;//TODO instead of interval, we can just do X time(or frames) before the current buffer is finished,
const PHYSICS_FPS = 31.25;
const APPLY_FRAMES_INTERVAL = 16;

const amountS = BUFFER_SIZE_TIME/1000;

class PlayState extends Schema {
    @type({ map: BallSchema })
    balls = new MapSchema<BallSchema>();

    @type(FrameBufferSchema)
    frameBuffer:FrameBufferSchema

    clientBallMap = {};

    @type("string")
    roomName = "TestRoom2";
}

//TODO MAKE A FRAME CLOCK THAT UPDATES state.currentFrame

export class TestRoom2 extends Room<PlayState> {
    private gameDefinition:GameDefinition;
    private golfPlay;
    private courseDefinition;
    private cannonParts;
    private ballIds = 0;

    interval1:ReturnType<typeof setInterval>;
    interval2:ReturnType<typeof setInterval>;

    async onCreate({realm, user, userId, PlayFabId, gameDefinition, courseDefinition, cannonParts, timeStep}) {//TODO client shouldn't define gameDefinition, it should inherit from currentTrainingID from player
        const _applyCurrentFrame = applyCurrentFrame.bind(this);
        const _intervalUpdateFrameFn = intervalUpdateFrameFn.bind(this);
        let currentFrame = 0;
        let lastFrameTime = 0;
        let lastAppliedFrame;
        let lastAppliedFrameT;
        let lastPingMs = 0;
        let lastPingTimeMs = 0;
        let roomId = Date.now()%10000;
        let physicsFrameBuffer;
        console.log("created", {timeStep});

        if(gameDefinition){
            this.gameDefinition = gameDefinition;
        }
        this.courseDefinition = courseDefinition || migrateCourseDefinitionAnimations(await getCourseDefinition(gameDefinition, fetch, true));
        this.cannonParts = cannonParts;
        this.setState(new PlayState(this.courseDefinition));
        this.golfPlay = await creatServerGolfPlay2({
            gameDefinition:this.gameDefinition,
            courseDefinition:this.courseDefinition,
            timeStep:timeStep||1/(60*4)
        });

        this.interval1 = setInterval(_applyCurrentFrame, APPLY_FRAMES_INTERVAL);
        this.interval2 = setInterval(_intervalUpdateFrameFn, FRAMES_UPDATE_INTERVAL);

        this.onMessage(MESSAGE.PING, (client)=>{
            client.send(MESSAGE.PONG, Date.now());
            lastPingTimeMs = Date.now();
        });

        this.onMessage(MESSAGE.PING2, (client)=>{
            lastPingMs = Date.now()-lastPingTimeMs;
            const ballId = this.state.clientBallMap[client.sessionId];
            this.state.balls[ballId].ping = lastPingMs;
            client.send(MESSAGE.SERVER_TIME, Date.now());
        });

        this.golfPlay.onEvent(({type, data}) => {
            if(type === EVENT.SLEEP){
                const {id} = data;
                const foundClient = this.clients.find(c=>c.sessionId === this.state.balls[id].sessionId);
                foundClient.send(MESSAGE.SLEEP, {});
            }else if(type === EVENT.OUT){
                const {id} = data;
                const foundClient = this.clients.find(c=>c.sessionId === this.state.balls[id].sessionId);
                foundClient.send(MESSAGE.OUT, {});
            }
        });

        this.onMessage(MESSAGE.SHOOT, (client, {impulse, timeStep, delayMs})=>{
            const id = this.state.clientBallMap[client.sessionId];
            this.golfPlay.shootBall({impulse, id});

            //TODO instead of creating new, concat where frame.t > Date.now
            const now = Date.now();
            const frames = calcAndGetFrameBufferSchema(this.golfPlay.getWorld(), this.golfPlay.getPhysicBalls());
            physicsFrameBuffer = {t:now, frames};
            this.state.frameBuffer = new FrameBufferSchema(now, frames);
        });

        function intervalUpdateFrameFn(){
            const frameBuffer:any = this.state.frameBuffer?.toJSON();
            if(!frameBuffer) return;

            const now = Date.now();
            const frames = calcAndGetFrameBufferSchema(this.golfPlay.getWorld(), this.golfPlay.getPhysicBalls());
            physicsFrameBuffer = {t:now, frames};
            this.state.frameBuffer = new FrameBufferSchema(now, frames);
        }

        function applyCurrentFrame(_frame?){
            //console.log("applyCurrentFrame", !!_frame, !!this.state.frameBuffer);
            if(!this.state.frameBuffer) return;

            const frame = getFrame(physicsFrameBuffer, _frame);
            lastFrameTime = Date.now();
            if(!frame) return;
            if(lastAppliedFrame === frame) {
                lastAppliedFrame = null;
                console.log("frame already applied");
                return;
            }

            physicsFrameBuffer && frame?.balls.forEach(frameBall => {
                const physicBall = this.golfPlay.getPhysicBalls()[frameBall.id];
                if(!physicBall) return;
                const body = this.golfPlay.getPhysicBalls()[frameBall.id].body;
                if(!body.sleepState){
                  //  console.log("assign kinetics", currentFrame, frame.t)
                    assignKinetics(body, frameBall);
                }
            });

            this.golfPlay.updateHandlers();
            lastAppliedFrame = frame;
            currentFrame++;

            function getFrame(buffer, _frame?){
                if(_frame) return _frame;
                let frame =  buffer && buffer?.frames && buffer?.frames[currentFrame];
                let nextFrame:any = buffer && buffer?.frames && buffer?.frames[currentFrame+1];
                let b = currentFrame;
                while(nextFrame && nextFrame.t <= Date.now() && frame?.t <= Date.now()){
                    frame = nextFrame;
                    currentFrame++;
                    nextFrame = buffer && buffer?.frames && buffer?.frames[currentFrame+1];
                }
                if(frame?.t > Date.now()) return null;
                return frame;
            }
        }
        const FRAME_LIFE_MS = (1000/PHYSICS_FPS);
        function calcAndGetFrameBufferSchema(world, balls){
            const now = Date.now();
            const timeSinceLastFrameReproduced = (lastAppliedFrame && (Date.now()-lastAppliedFrame.t) || (lastFrameTime && (Date.now()-lastFrameTime))||0);
            let timeToNextFrame = (FRAME_LIFE_MS - timeSinceLastFrameReproduced) % FRAME_LIFE_MS;

            let skipedFrames = 0
            if(timeToNextFrame === 0) {
                timeToNextFrame = FRAME_LIFE_MS;
            }else if(timeToNextFrame < 0){
                while(timeToNextFrame <= 0){
                    timeToNextFrame = FRAME_LIFE_MS + timeToNextFrame;
                    skipedFrames++;
                }
            }
            /**
             * //TODO REVIEW
             * instead of world step the missingToSimulateMs, alternatives:
             * - do like if the calc starts right in the previous frame or the next
             * - make a fixed time frame clock loop
             */
            const missingToSimulateMs = (timeSinceLastFrameReproduced-timeToNextFrame);
            world.step(timeStep, (missingToSimulateMs+1)/1000);

            currentFrame = 0;

            const frames = getFrames({ world,timeStep,balls, startTime: now+timeToNextFrame, amountS, reset: true, fps:PHYSICS_FPS});

            return frames;
        }
    }

    async onJoin(client, {realm, user, userId, PlayFabId, gameDefinition, courseDefinition, cannonParts, displayName}){
        //TODO add new ball
        this.ballIds++;
        const ballId = this.ballIds.toString();
        console.log("joined ",ballId)
        this.state.balls.set(ballId, new BallSchema(ballId, displayName, userId, client.sessionId));
        this.state.clientBallMap[client.sessionId] = ballId
        client.send(MESSAGE.BALL_ID, ballId);
        const position = this.courseDefinition.parts.find((part:any)=>part.type === "initial_position")!.position;
        this.golfPlay.addPhysicBall(ballId, {position});
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
        clearInterval(this.interval1);
        clearInterval(this.interval2);

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