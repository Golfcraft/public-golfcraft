import { createVisualCourse } from "../../../golfplay/src/components/course/course-visual-loader";
import { VisualBallFactory } from "../../../golfplay/src/./components/ball";
import { createPhysicsWorld, initializeMaterials} from "../../../golfplay/src/../physics/world";
import { createPhysicBall} from "../../../golfplay/src/../physics/ball";
import { loadCoursePhysics } from "../../../golfplay/src/../physics/course-element-loader";
import { createShootControl } from "../../../golfplay/src/./components/shoot-control";
import { createGameHandler, } from "../../../golfplay/src/./gameplay-handlers/gameplay-handler";
import {  EVENT, EVENT_NAME } from "../../../golfplay/src/./gameplay-handlers/handler-def";
import { movePlayerTo } from '@decentraland/RestrictedActions';
import { CheckpointFactory } from "../../../golfplay/src/components/visual-checkpoint";
import { VisualZoneFactory } from "../../../golfplay/src/components/visual-zone";
import { createRandomVoxter } from "../../../golfplay/src/components/voxter/voxter";
import {getCourseDefinition} from "../../../../common/course-definitions/course-definition-repository";
import {showAvatars, hideAvatars} from "../../services/hide-avatars";
import {reproduceAvatarSound, registerSound} from "../../../sound/avatar-sound";
import CANNON = require("cannon");
import { fadeOutOverlay } from "../ui/overlay";
import { globalStore } from "../../services/globalStore/globalStore";
import { migrateCourseDefinitionAnimations } from "../../../../common/course-animations-migration";
import { MovingPartComponent } from "../../../golfplay/src/components/course/visual-part";
import { createEventManager } from "../../../golfplay/src/services/EventManagerFactory";
import { createFrameReproduction} from "../../../../common/frame-reproductor";
import MESSAGE from "../../../../server/rooms/mesages";
import {deserializeRecipe, sleep, waitFor} from "../../../../common/utils";
import {createVisualChest} from "./visualChest";
import {showMessage} from "../server-notification";
import {getCanvas} from "../../../golfplay/services/canvas";
import {getTexture} from "../../../golfplay/services/resource-repo";
import {createFixBugButton} from "./golfplay-client-season";
const REWARD_NAMES:any = {
    WD:"wood",
    ST:"stone",
    IR:"iron",
    GD:"gold",
    DM:"diamond",
    FT:"fashion ticket",
    EN:"energy",
    wearable:"wearable"
}
const onlyServerPhysics = false;
declare const console;
class UpdateSystem implements ISystem {
    private callback;
    constructor(callback){
        this.callback = callback;
        engine.addSystem(this);
    }

    update(dt:number){
        this.callback(dt);
    }

    dispose(){
        this.callback = null;
    }
}

let fixBugButton;

const GolfplayClientFactory = ({golfplayBaseUrl}) => {//TODO MEMOIZE
    const {createVisualBall} = VisualBallFactory({baseResourceUrl:golfplayBaseUrl});
    const {createCheckpoint} = CheckpointFactory({baseResourceUrl:golfplayBaseUrl});
    const {createVisualZone} = VisualZoneFactory({baseResourceUrl:golfplayBaseUrl});

    registerSound("checkpoint", golfplayBaseUrl);
    registerSound("voxter", golfplayBaseUrl);
    registerSound("hole", golfplayBaseUrl);
    initializeMaterials();//TODO why initializing materias each time?

    const createClientGolfPlay = async (parent:Entity, {gameDefinition, room, roomBall = room.state.ball,  golfclub, wip, colyseus, expressionState = {}, currentGame}:any) => {
        const state = {
            reconnecting:false,
            disposed:false
        }
        console.log("createClientGolfPlay");

        const frameEventHandler = createEventManager();
        hideAvatars();
        const courseDefinition:any = migrateCourseDefinitionAnimations(await getCourseDefinition(gameDefinition, fetch, wip));

        if(globalStore?.game){
            globalStore.game.getState().courseAuthor = courseDefinition.authorName || null;
            globalStore.game.getState().courseName = courseDefinition.displayName || courseDefinition.alias;
            globalStore.game.getState().courseIsSeason = !!courseDefinition.isSeason;
            globalStore.game.getState().playing = true;
        }

        const callbacks:{[key:string]:null|Function} = {
            onFinish:null,
            onComplete:null
        };
        
        const remoteBallPosition = roomBall.position.toJSON();
        const remoteBallRotation = roomBall.quaternion.toJSON();
        const ballSpawnDefinition = {
            position:[remoteBallPosition.x,remoteBallPosition.y,remoteBallPosition.z],
            rotation:[remoteBallRotation.x, remoteBallRotation.y, remoteBallRotation.z, remoteBallRotation.w]
        };
        
        const initialPlayerPosition = new Vector3(...courseDefinition.parts.find((part:any)=>part.type === "spawn").position);
        const {world} = createPhysicsWorld();
        const ball = createVisualBall(parent, {position:new Vector3(...ballSpawnDefinition.position), collectionId: courseDefinition.collectionId});
        //const dummyBall = createVisualBall(parent, {position:new Vector3(...ballSpawnDefinition.position), dummy:true});
        const physicBall = createPhysicBall(world, {  position:ballSpawnDefinition.position, onlyKinematic:false });
        physicBall.body.sleep();
        const physicParts = loadCoursePhysics(world, { courseDefinition});
        const movingPhysicParts = Object.values(physicParts).filter((pp:any)=>pp.definition.animation).reduce((acc, current:any)=>{
            acc[current.definition.id] = current;
            current.animationState = {currentFrame:0, count:0};
            return acc;
        }, {});

        physicBall.onCollide((e)=>{
            if(e.body.material.name === "woodMaterial"){
                ball.reproduceSound("wood", Math.min(1, physicBall.body.velocity.length()/10));
            }else if(e.body.material.name === "dumperMaterial"){
                ball.reproduceSound("bumper", Math.min(1, physicBall.body.velocity.length()/25));
            }
        });
        const control = createShootControl(parent, {
            position: new Vector3(...ballSpawnDefinition.position),
            rotation: new Quaternion(...ballSpawnDefinition.rotation),
            golfclub
        });
        control.hide();
        const gamePlayState = { idle:true, started:false, finished:false};
        const gameHandler = createGameHandler({
            gameType:gameDefinition.type,
            world,
            ballBody:physicBall.body,
            state:gamePlayState,
            courseDefinition,
            movingPhysicParts,
            parts:physicParts,
            excludeHandlers:["animation"],
            onExpressionEvent:({type, data})=>{
                const {targetControlIds, newValues, oldValues, isDelayed} = data;
                if(isDelayed){
                    Object.assign(expressionState, newValues);
                    targetControlIds.forEach((partId)=>{
                        visualCourse.applyReactiveValue(partId, expressionState)
                    })
                }
            },
            applySmartParts:true
        });
       /* if(courseDefinition.expressions?.initialAssignments){
            Object.assign(expressionState, gameHandler.getExpressionState());//TODO assignments should be evaluated
        }*/
        const updateSystem = new UpdateSystem(update);
        const visualCourse = createVisualCourse(parent, {courseDefinition});
        console.log("visual expressionState", JSON.stringify(expressionState));
        visualCourse.applyAllValues(expressionState);
        let positionBeforeShoot;
        await movePlayerTo({
            x:initialPlayerPosition.x+24,
            y:initialPlayerPosition.y,
            z:initialPlayerPosition.z+24
        }, { x: 8+24, y: 1, z: 8+24 });

        await fadeOutOverlay(1);

        const fixBug = await createFixBugButton(visualCourse, ()=>{
            visualCourse.reset();
            visualCourse.applyAllValues(expressionState)
            control.show();
            room.send(MESSAGE.FIX_BUGS);
        });

        frameEventHandler.onEvent(EVENT.EVENT_VARIABLE_CHANGE, ({type, data})=>{//TODO change Event type code
            Object.assign(expressionState, data.newValues);
            data.targetControlIds.forEach(partId => {
                visualCourse.applyReactiveValue(
                    partId,
                    expressionState
                )
            });
        });

        frameEventHandler.onEvent(EVENT.SLEEP, ()=>{
            physicBall.body.sleep();
            if(gamePlayState.finished) return;
            setIdle();    
        });
    
        frameEventHandler.onEvent(EVENT.HOLE, ()=>{
            console.log("hole");
            control.hide();
            gamePlayState.idle = false;
            gamePlayState.finished = true;
            ball.reproduceSound("hole");
            visualCourse.reproduceHoleAction();
        })
        frameEventHandler.onEvent(EVENT.WIND, ()=>{
            ball.reproduceSound("wind");
        });
        frameEventHandler.onEvent(EVENT.SAND, ()=>{
            ball.reproduceSound("sand");
        });
        frameEventHandler.onEvent(EVENT.OUT, async ()=>{
            physicBall.body.sleep();
            if(gamePlayState.finished) return;
            await sleep(100);
            physicBall.body.position.set(positionBeforeShoot.x,positionBeforeShoot.y,positionBeforeShoot.z);
            await sleep(100);
            setIdle();
        });
        frameEventHandler.onEvent(EVENT.EXPLOSIVE, ({type, data})=>{
            console.log("frame EVENT.EXPLOSIVE", type, data);
            visualCourse.getParts()[data.id].reproduceAction();
        });
    
        var lastPingTime = Date.now();
        var lastPing = 0;
        room.send(MESSAGE.PING);
        listenRoom();

        function onMessagePong(){
            lastPing = (Date.now() - lastPingTime) / 2;
            room.send(MESSAGE.PING2);
        }
        function onClientLog(data){
            console.log("CLIENT_LOG", data);
        }
    
        let pingInterval = setInterval(()=>{//TODO move to update with (% count)
            if(state.reconnecting) return;
            lastPingTime = Date.now();
            room.send(MESSAGE.PING);        
        }, 5000);
    
        room.onMessage(MESSAGE.COMPLETED, onMessageCompleted);

        let checkpointCallback:any, voxterCallback:any;
        if(gameDefinition.type === "training"){
            if(gameDefinition.subType === "1"){
                const checkpoints = courseDefinition.parts.filter(part=>part.type === "checkpoint");
                const visualCheckpoint = createCheckpoint(parent, {
                    position:new Vector3(...checkpoints[0].position),
                    visible:true
                });
                checkpointCallback = getOnMessageCheckpoint(visualCheckpoint, checkpoints);
                room.onMessage(MESSAGE.CHECKPOINT, checkpointCallback);
                room.onLeave((code)=>{
                    console.log("roomclient onLeave connection", code);
                    if(code >= 4000){
                        visualCheckpoint.dispose();
                    }
                });
    
            }else if(gameDefinition.subType === "2"){//TODO zone
                const zoneDefinition = courseDefinition.parts.find(part => part.type === "zone");
                const visualZone = createVisualZone(parent, {
                    position: new Vector3(...zoneDefinition.position),
                    scale: new Vector3(...zoneDefinition.scale)
                });
                room.onLeave((code)=>{
                    if(code >= 4000){
                            visualZone.dispose();
                    }
                })
            }else if(gameDefinition.subType === "3"){
                const voxters = courseDefinition.parts.filter(p=>p.type==="voxter");
                const visualVoxters = voxters.map((voxterDefinition)=>{
                    return createRandomVoxter(parent, {
                        position:new Vector3(...voxterDefinition.position)
                    })
                });
                voxterCallback = getOnMessageVoxter(visualVoxters);
                room.onMessage(MESSAGE.VOXTER, voxterCallback);
                
                room.onLeave((code)=>{
                    if(code >= 4000){
                        visualVoxters.forEach(v=>v.dispose());//TODO could throw error
                    }
                });
            }
        }

        let shootFramesInfo:any = null;
        control.onShoot(({impulse, delayMs}) => {//delayMs is golfclub animation
            if(state.reconnecting) return;
            control.hide();
            gamePlayState.idle = false;
            room.send(MESSAGE.SHOOT, {impulse, timeStep, delayMs});
        });
        let frameReproductor = null;

        const visualChests:any = [];
        setTimeout(() => {
            if(room.state.chests){
                console.log("room.state.chests",room.state.chests.length)
                room.state.chests.forEach((chest, index)=>{
                    const [chestRewardKey, chestRewardAmount] = chest.reward.split(":");
                    visualChests.push(createVisualChest(parent, {
                        chest,
                        onClick: async () => {
                            if(state.reconnecting) return;
                            room.send(MESSAGE.CHEST, {index});

                            showMessage({timeout:5000, message:`HI! Found ${chestRewardAmount} ${REWARD_NAMES[chestRewardKey]} !!<br>(Complete the hole to receive it)`})
                            await sleep(1000);
                            visualChests[index].dispose();
                        },
                        model:room.state.chestModel
                    }));
                })
            }
        }, 1000);


        room.onLeave(onLeave);
    
        engine.addSystem(updateSystem);
    
        const STEPS_FPS = 60*4;
        const timeStep = 1/STEPS_FPS;


        function listenRoom () {
            room.onLeave(cancellableCallback(onLeave));
            room.onMessage(MESSAGE.CLIENT_LOG, cancellableCallback(onClientLog));
            room.onMessage(MESSAGE.PONG, cancellableCallback(onMessagePong));
            room.onMessage(MESSAGE.SHOOT_FRAMES, cancellableCallback(onMessageShootFrames));
            room.onMessage(MESSAGE.START_SHOOT_FRAMES, cancellableCallback(onMessageStartShootFrame));
            room.onMessage(MESSAGE.COMPLETED, cancellableCallback(onMessageCompleted));
            //room.onMessage(MESSAGE.COUNTDOWN, cancellableCallback(onMessageHoleCountdown));
            //room.onMessage(MESSAGE.END_COUNTDOWN, cancellableCallback(onMessageHoleEndCountdown));
            room.onMessage(MESSAGE.CHECKPOINT, cancellableCallback(checkpointCallback));
            room.onMessage(MESSAGE.VOXTER, cancellableCallback(voxterCallback));
            room.onMessage(MESSAGE.COMPLETED, cancellableCallback(onMessageCompleted));
        }

        function cancellableCallback(fn){
            //TODO REVIEW: because we cannot remove previous listeners from room, the previous clientGolfplay is still alive, unless...
            return (...args) => {
                if(fn.name !== "onMessagePong") console.log("callback ", fn.name, ...args, currentGame, room.state.currentGame, Date.now())
                if(!state.disposed) {
                    fn(...args);
                }
            }
        }
        function onLeave(code){
            console.log("leave", code);
            if(code < 4000 && code !== 1000){
                const roomId = room.id;
                const sessionId = room.sessionId;
                state.reconnecting = true;
                colyseus.reconnect(roomId, sessionId).then(_room => {
                    state.reconnecting = false;
                    control.show();
                    room = _room;
                    listenRoom();
                })
            }else{
                showAvatars();
                callbacks.onFinish && callbacks.onFinish(code);
            }
        }
        function onMessageCompleted({xp, GC, time, shoots, PT, materialDrops} = {xp:0, GC:0, time:0, shoots:0, PT:0, materialDrops:{}}){
            console.log("materialDrops", materialDrops)
            callbacks.onComplete && callbacks.onComplete({xp, GC, PT, time, shoots, materialDrops});
            //TODO show popup -> globalStore.game.getState().lastGameResult
        }

        function getOnMessageVoxter(visualVoxters){
            return (data)=>{
                reproduceAvatarSound("voxter");
                visualVoxters[data.index].dispose();
            }
        }
        function getOnMessageCheckpoint(visualCheckpoint, checkpoints){
            return function onMessageCheckpoint({checkpoint, index, altIndex}){
                reproduceAvatarSound("checkpoint");
                if(altIndex === (checkpoints.length-1)){
                    visualCheckpoint.dispose();
                }else{
                    visualCheckpoint.moveTo(new Vector3(...checkpoints[altIndex+1].position))
                }
            }
        }
        function onMessageShootFrames({timeStep, impulse, frames}){
            shootFramesInfo = {frames, impulse, timeStep};
            positionBeforeShoot = physicBall.body.position.clone();
        }
        function onMessageStartShootFrame(){
            ball.reproduceSound("shoot1");
            physicBall.wakeUp();
            frameReproductor = createFrameReproduction({
                timeStep,
                frames:shootFramesInfo.frames,
                onEvent: (event) => frameEventHandler.trigger(event),
                onUpdateBall: ({position, velocity} ) => {
                    Object.assign(physicBall.body.position, position);
                    Object.assign(physicBall.body.velocity, velocity);
                },
                onFinish: () => frameReproductor=null
            })
            //reproduceShootFrames();
        }

        function update(dt:number){
            if(!gamePlayState.started) {
                return;
            }
            if(frameReproductor){
                frameReproductor.update(dt);
            }
            if(!onlyServerPhysics){     
               world.step(timeStep, dt);
            }

            ball.setPosition(
                physicBall.body.position,
                physicBall.body.quaternion
            );
            movingPhysicParts && Object.values(movingPhysicParts).forEach(physicPart  => {//TODO optimize
                physicPart.bodies.forEach(body=>{
                    const partId = physicPart.definition.id;
                    const serverPart = room.state.movingParts.toJSON().find(m=>m.partId === partId);
                    const {x,y,z} = serverPart.velocity;
                    body.velocity.set(x,y,z); 
                });
            })
            engine.getComponentGroup(MovingPartComponent).entities.forEach(entity=>{
                const entityTransform = entity.getComponent(Transform);
                const partId = entity["name"];
    
                const serverPart = room.state.movingParts.toJSON().find(m=>m.partId === partId);//TODO optimize
                (()=>{
                    const {x,y,z} = serverPart.position;
                    entityTransform.position.set(x,y,z)
                })(); 
                (()=>{
                    const {x,y,z,w} = serverPart.quaternion;
                    entityTransform.rotation.set(x,y,z,w)
                })();
            });
            gameHandler.update(dt, true);
        }

        return {
            ready:()=>room.send(MESSAGE.READY),
            setExpressionState:(data)=>Object.assign(expressionState, data),
            id:Date.now(),
            dispose,
            onFinish,
            start,
            onComplete,
            setAnimationGlobalDt:gameHandler.setAnimationGlobalDt
        };
    
        function start(){
            console.log("GolfPlayClient start game")
            gamePlayState.started = true;
            control.show();
        }
    
        function setIdle () {
            gamePlayState.idle = true;
            control.show();
            control.setPosition(physicBall.body.position);
        }
    
        function dispose () {
            fixBug.hide();
            clearInterval(pingInterval);
            visualChests.forEach((v:any) =>v.dispose());
           /*  dummyBall.getEntity().setParent(null);
            engine.removeEntity(dummyBall.getEntity());
            if (dummyMovingParts) {
                dummyMovingParts.forEach((dummyMovingPart)=>{
                    dummyMovingPart.setParent(null);
                    engine.removeEntity(dummyMovingPart);
                })
            }  */

            checkpointCallback = null;
            voxterCallback = null;
            frameEventHandler.dispose();
            gameHandler.dispose();
            updateSystem.dispose();
            visualCourse.dispose();
            control.dispose();
            ball.dispose();

            control.getEntity().setParent(null);
            engine.removeEntity(control.getEntity());
            engine.removeSystem(updateSystem);
            callbacks.onFinish = null;
            callbacks.onComplete = null;

            state.disposed = true;
        }
        
    
        function onComplete(fn:Function){
            callbacks.onComplete = fn;
        }
    
        function onFinish(fn:Function){        
            callbacks.onFinish = fn;
        }

        async function createFixBugButton(visualCourse?, onClick?){
            const callbacks = {
                onClick:onClick||noop
            };
            if(!fixBugButton){
                fixBugButton = new UIImage(getCanvas(), getTexture(`images/spritesheet.png`,{samplingMode:0, hasAlpha:true}));
                fixBugButton.sourceWidth = 128;
                fixBugButton.sourceHeight = 28;
                fixBugButton.width = 128;
                fixBugButton.height = 28;
                fixBugButton.sourceLeft = 335;
                fixBugButton.sourceTop = 452;
                fixBugButton.vAlign = "top";
                fixBugButton.hAlign = "left";
                fixBugButton.positionX = 200;
                fixBugButton.positionY = 55;
            }
            fixBugButton.visible = true;
            fixBugButton.onClick = new OnClick(()=>{
                console.log("fixing bugs")
                callbacks.onClick();
            });
            return {
                hide:()=>{
                    fixBugButton.visible = false;
                }
            }
        }
    }
    
    return {createClientGolfPlay};



}


export {GolfplayClientFactory, createFixBugButton}

function noop(){}