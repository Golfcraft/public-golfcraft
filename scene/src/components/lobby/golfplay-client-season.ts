import { createVisualCourse } from "../../../golfplay/src/components/course/course-visual-loader";
import { VisualBallFactory } from "../../../golfplay/src/./components/ball";
import { createPhysicsWorld, initializeMaterials} from "../../../golfplay/src/../physics/world";
import { createPhysicBall} from "../../../golfplay/src/../physics/ball";
import { loadCoursePhysics } from "../../../golfplay/src/../physics/course-element-loader";
import { createShootControl } from "../../../golfplay/src/./components/shoot-control";
import { createGameHandler, } from "../../../golfplay/src/./gameplay-handlers/gameplay-handler";
import {  EVENT, EVENT_NAME } from "../../../golfplay/src/./gameplay-handlers/handler-def";
import { movePlayerTo } from '@decentraland/RestrictedActions';

import {getCourseDefinition} from "../../../../common/course-definitions/course-definition-repository";
import {showAvatars, hideAvatars} from "../../services/hide-avatars";
import {reproduceAvatarSound, registerSound} from "../../../sound/avatar-sound";
import {fadeInOverlay, fadeOutOverlay} from "../ui/overlay";
import { globalStore } from "../../services/globalStore/globalStore";
import { migrateCourseDefinitionAnimations } from "../../../../common/course-animations-migration";
import { MovingPartComponent } from "../../../golfplay/src/components/course/visual-part";
import { createEventManager } from "../../../golfplay/src/services/EventManagerFactory";
import { createFrameReproduction} from "../../../../common/frame-reproductor";
import MESSAGE from "../../../../server/rooms/mesages";
import {createVisualChest} from "./visualChest";
import {showMessage} from "../server-notification";
import {hideWaitPlayers, showWaitForPlayers} from "./season-game-countdown";
import {getCanvas} from "../../../golfplay/services/canvas";
import {formatTime, sleep} from "../../../../common/utils";
import {createInGameResultsUi, createInGameTime} from "./ingame-ui";
import {getTexture} from "../../../golfplay/services/resource-repo";
let fixBugButton;
const cdText = new UIText(getCanvas());
cdText.vAlign = "top";
cdText.hAlign = "center";
cdText.hTextAlign = "center";
cdText.value = "10";
cdText.fontSize = 60;
cdText.visible = false;
cdText.positionY = -60;

const REWARD_NAMES:any = {
    WD:"wood",
    ST:"stone",
    IR:"iron",
    GD:"gold",
    DM:"diamond",
    FT:"fashion ticket",
    wearable:"wearable"
}

const onlyServerPhysics = false;
declare const console;
let timeUI = createInGameTime();
timeUI.hide()
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
const RED = Color3.Red();
const GREEN = Color3.Green();
const BLUE = Color3.Blue();
const YELLOW = Color3.Yellow();
let inGameResults;
const GolfplayClientSeasonFactory = ({golfplayBaseUrl}) => {//TODO MEMOIZE
    const {createVisualBall} = VisualBallFactory({baseResourceUrl:golfplayBaseUrl});

    registerSound("checkpoint", golfplayBaseUrl);
    registerSound("voxter", golfplayBaseUrl);
    registerSound("hole", golfplayBaseUrl);
    initializeMaterials();//TODO why initializing materias each time?

    const createClientGolfPlay = async (parent:Entity, {gameDefinition, room, golfclub, wip, colyseus, expressionState = {}, currentGame, currentUserName, ghostsData}:any) => {
        const state ={
            reconnecting:false
        }
        console.log("createClientGolfPlay", currentGame, gameDefinition, formatTime(Date.now(), true));
        const frameEventHandler = createEventManager();
        hideAvatars();
        const courseDefinition:any = migrateCourseDefinitionAnimations(await getCourseDefinition(gameDefinition, fetch, wip));
        if(globalStore?.game){
            globalStore.game.getState().courseAuthor = courseDefinition.authorName || null;
            globalStore.game.getState().courseName = courseDefinition.displayName || courseDefinition.alias;
            globalStore.game.getState().courseIsSeason = !!courseDefinition.isSeason;
        }

        const callbacks:{[key:string]:null|Function} = {
            onFinish:null,
            onComplete:null
        };
        const initialPosDef =  courseDefinition.parts.find(p=>p.type === "initial_position");

        const remoteBallPosition = room.state.ball.position.toJSON();
        const remoteBallRotation = room.state.ball.quaternion.toJSON();
        const ballSpawnDefinition = {
            position:[...initialPosDef.position],
            rotation:[...initialPosDef.rotation]
        };

        const initialPlayerPosition = new Vector3(...courseDefinition.parts.find((part:any)=>part.type === "spawn").position);
        const {world} = createPhysicsWorld();
        const ball = createVisualBall(parent, {position:new Vector3(...ballSpawnDefinition.position)});
        //const dummyBall = createVisualBall(parent, {position:new Vector3(...ballSpawnDefinition.position), dummy:true});
        const physicBall = createPhysicBall(world, {  position:ballSpawnDefinition.position, onlyKinematic:false });
        physicBall.body.sleep();
        const physicParts = loadCoursePhysics(world, { courseDefinition});
        const movingPhysicParts = Object.values(physicParts).filter((pp:any)=>pp.definition.animation).reduce((acc, current:any)=>{
            acc[current.definition.id] = current;
            current.animationState = {currentFrame:0, count:0};
            return acc;
        }, {});
        let cancelEnding = false;

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
            golfclub,
            currentGame
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
            excludeHandlers: ["animation"],
            onExpressionEvent: ({type, data}) => {
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
        let positionBeforeShoot;
        let shootFramesInfo:any = null;
        let frameReproductor = null;
        let lastPingTime = Date.now();
        let lastPing = 0;
        let pingInterval;

        console.log("visual expressionState", JSON.stringify(expressionState));
        visualCourse.applyAllValues(expressionState);
        await movePlayerTo({
            x:initialPlayerPosition.x+24,
            y:initialPlayerPosition.y,
            z:initialPlayerPosition.z+24
        }, { x: 8+24, y: 1, z: 8+24 });
        handleFrameEvents();

        room.send(MESSAGE.PING);
        control.onShoot(({impulse, delayMs}) => {//delayMs is golfclub animation
            if(state.reconnecting) return;
            control.hide();
            gamePlayState.idle = false;
            room.send(MESSAGE.SHOOT, {impulse, timeStep, delayMs});
        });
        listenPing();
        listenRoom();

        const visualChests:any = [];

        setTimeout(() => {//TODO why timeout? FIX IT!
            if(room.state.chests){
                console.log("room.state.chests.length", room.state.chests.length)
                room.state.chests.forEach((chest, index)=>{
                    const [chestRewardKey, chestRewardAmount] = chest.reward.split(":");
                    visualChests.push(createVisualChest(parent, {chest, onClick:async () => {
                            if(state.reconnecting) return;
                            room.send(MESSAGE.CHEST, {index});

                            showMessage({timeout:5000, message:`HI! Found ${chestRewardAmount} ${REWARD_NAMES[chestRewardKey]} !!<br>(Complete the hole to receive it)`});
                            await sleep(1000);
                            visualChests[index].dispose();
                            //TODO show price
                        }, model:room.state.chestModel
                    }));
                });
            }
        },1000)
    
        engine.addSystem(updateSystem);
    
        const STEPS_FPS = 60*4;
        const timeStep = 1/STEPS_FPS;
        const ghostBalls = [];
        const GHOST_FPS = 30;
        const GHOST_FMS = 1000/GHOST_FPS;
        let ghostInterval, timeInterval;
        let ghostsFrameCount = 0;
        let disposed = false;

        //room.send(MESSAGE.READY);//will immediately receive MESSAGE.START
        const fixBug = await createFixBugButton(visualCourse, ()=>{
            visualCourse.reset();
            control.show();
            room.send(MESSAGE.FIX_BUGS);
        });

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

        function onMessagePong(){
            if(state.reconnecting) return;
            lastPing = (Date.now() - lastPingTime) / 2;
            room.send(MESSAGE.PING2);
        }

        function cancellableCallback(fn){
            //TODO REVIEW: because we cannot remove previous listeners from room, the previous clientGolfplay is still alive, unless...
            return (...args) => {
                if(fn.name !== "onMessagePong") console.log("callback ", fn.name, ...args, currentGame, room.state.currentGame, Date.now())
                if(!disposed) {
                    fn(...args);
                }
            }
        }
        function onClientLog(data){
            console.log("CLIENT_LOG", data);
        }
        function listenRoom(){
            room.onLeave(cancellableCallback(onLeave));
            room.onMessage(MESSAGE.CLIENT_LOG, cancellableCallback(onClientLog));
            room.onMessage(MESSAGE.PONG, cancellableCallback(onMessagePong));
            room.onMessage(MESSAGE.SHOOT_FRAMES, cancellableCallback(onMessageShootFrames));
            room.onMessage(MESSAGE.START_SHOOT_FRAMES, cancellableCallback(onMessageStartShootFrame));
            room.onMessage(MESSAGE.COMPLETED, cancellableCallback(onMessageCompleted));
            room.onMessage(MESSAGE.START, cancellableCallback(onMessageStart));
            room.onMessage(MESSAGE.COUNTDOWN, cancellableCallback(onMessageHoleCountdown));
            room.onMessage(MESSAGE.END_COUNTDOWN, cancellableCallback(onMessageHoleEndCountdown));
        }

        function onLeave(code){
            console.log("roomclient onLeave connection", code);
            if(code < 4000 && code !== 1000){
                const roomId = room.id;
                const sessionId = room.sessionId;
                state.reconnecting = true;
                console.log("reconnecting colyseus", colyseus);

                colyseus.reconnect(roomId, sessionId).then(_room => {
                    state.reconnecting = false;
                    room = _room;
                    listenRoom();
                })
            }
        }

        async function onMessageStart ({startTime, serverTime, courseAlias}){
            const currentGameGhostsData = ghostsData[currentGame];
            console.log("executing onMessageStart", currentGame);

            const localStartTime = startTime - (serverTime-Date.now());
            const timeToStart = localStartTime - Date.now();
            console.log("courseAlias",courseAlias);
            console.log("serverTime",serverTime);
            console.log("Date.now()",Date.now());
            console.log("localStartTime",localStartTime);
            console.log("timeToStart",timeToStart);
            console.log("ghostsData",currentGameGhostsData);
            //TODO
            hideWaitPlayers();

            cdText.visible = true;
            let startCountdownInterval = setInterval(()=>{
                const timeToStart = localStartTime - Date.now();
                cdText.value = "Starting in...\n"+Math.floor(timeToStart/1000).toString();
                if(timeToStart <= 0){
                    cdText.visible = false;
                    clearInterval(startCountdownInterval)
                }
            },100)

            if(currentGame === 0){
                inGameResults = inGameResults || createInGameResultsUi(room.state.results);
                room.state.results.forEach((playerResult, playerIndex) => {
                    playerResult.onChange = ()=>{
                        console.log("playerResult onChange", playerResult.toJSON());
                        inGameResults.updateView(room.state.results, room.state.currentGame);
                    }
                    playerResult.time.onChange = ()=>{
                        console.log("playerResult added time,", playerResult.toJSON());
                        inGameResults.updateView(room.state.results, room.state.currentGame);
                    }
                    playerResult.shots.onChange = (shots, key)=>{
                        console.log("playerResult shots.onChange,", playerResult.shots[currentGame]);
                        inGameResults.updateView(room.state.results, room.state.currentGame);
                    }
                });
            }else if(currentGame > 0){
                //cdText.visible = true;
                //await createOrShowNextGameUi(currentGame, room.state.results.toJSON());
            }

            inGameResults.resetView();
            inGameResults.show();

            currentGameGhostsData.forEach((g, index) => {
                const [x,y,z] = courseDefinition.parts.find(i=>i.type === "initial_position").position; //g.frames[0];
                ghostBalls.push({
                    visualBall:createVisualBall(parent, {
                        position:new Vector3(x,y,z),
                        displayName:g.displayName,
                        id:10 + index,
                        _color:new Color4(0,0,1,0.3)
                    }),
                    currentFrame:0,
                    finished:false,
                    ...g
                });
            });

            // @ts-ignore
            setTimeout(()=>{
                let idleStartTime = [0,0,0];
                ghostInterval = setInterval(()=>{
                    ghostBalls.forEach((ghost, index) => {
                        if(ghost.finished) return;
                        const {visualBall, frames} = ghost;

                        const frame = frames[ghost.currentFrame];
                        const [type] = frame;

                        if (type === 0) {//IDLE
                            idleStartTime[index] = idleStartTime[index] || Date.now();
                            visualBall.changeColor("GREEN");
                            const [,x,y,z,framesToPass] = frame;
                            const timeDiff = Date.now() - idleStartTime[index];
                            const timeDiffInFrames = Math.floor(timeDiff / GHOST_FMS);
                            //TODO or just set a timeout
                            if(timeDiffInFrames > framesToPass){
                                idleStartTime[index] = 0;
                                ghost.currentFrame++;//TODO or sum framesToPass
                            }else{
                                //console.log("IDLE"+index, ghostsFrameCount, ghost.currentFrame)
                            }
                        } else if (type === 1) {//SHOOT
                            visualBall.changeColor("RED");
                            if(!ghost.shooting){
                                setTimeout(()=>{
                                    ghost.currentFrame++;
                                    ghost.shooting = false;
                                },400)
                            }

                            ghost.shooting = true;
                        } else if (type === 2) {//MOVE
                            visualBall.changeColor("BLUE");
                            const [type,x,y,z, vx,vy,vz] = frame;
                            visualBall.setPosition(new Vector3(x,y,z));
                            ghost.currentFrame++;
                        }else if(type === 3){
                            visualBall.changeColor("YELLOW");
                            ghost.finished = true;
                        }
                    });

                     ghostsFrameCount = Math.floor((Date.now() - localStartTime)/GHOST_FMS );
                }, GHOST_FMS);

                timeUI.show();
                timeInterval = setInterval(()=>{
                    if(room.state.finished) {
                        clearInterval(timeInterval);
                    }else{
                        const timeElapsed = Date.now() - localStartTime;
                        timeUI.updateMs(timeElapsed);
                    }
                },1000)
                start();
            },timeToStart);
        }
        async function onMessageCompleted({xp, GC, time, shoots, PT, materialDrops, rewards, tierSub, newTierSub, rewardsBonus}){
            console.log("COMPLETED",rewardsBonus);
            clearInterval(ghostInterval);
            clearInterval(timeInterval);
            timeUI.hide();
            console.log("materialDrops", materialDrops)
            await sleep(3000);

            callbacks.onComplete && callbacks.onComplete({xp, GC, PT, time, shoots, materialDrops, rewards, tierSub, newTierSub, rewardsBonus});
            inGameResults.hide();
        }
        function onMessageShootFrames({timeStep, impulse, frames}){
            console.log("onMessageShootFrames",timeStep,impulse,frames.length)
            shootFramesInfo = {frames, impulse, timeStep};
            positionBeforeShoot = physicBall.body.position.clone();
        }
        function onMessageStartShootFrame(){
            console.log("onMessageStartShootFrame")
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
        function start(){
            console.log("GolfPlayClient start game and allow player handle golfclub")
            gamePlayState.started = true;
            setIdle();
            console.log("start show control");
            setTimeout(()=>control.show(),1)
        }
    
        function setIdle () {
            if(gamePlayState.finished) return;
            gamePlayState.idle = true;
            control.show();
            control.setPosition(physicBall.body.position);
        }
    
        function dispose () {
            fixBug.hide();
            disposed = true;
            clearInterval(pingInterval);
            visualChests.forEach((v:any) =>v.dispose());
            frameEventHandler.dispose();
            gameHandler.dispose();
            updateSystem.dispose();
            visualCourse.dispose();
            control.dispose();
            ball.getEntity().setParent(null);
            ghostBalls.forEach(gb => gb.visualBall.dispose());
            engine.removeEntity(ball.getEntity());
            control.getEntity().setParent(null);
            engine.removeEntity(control.getEntity());
            engine.removeSystem(updateSystem);
            callbacks.onFinish = null;
            callbacks.onComplete = null;
            showAvatars();
        }

        function onComplete(fn:Function){
            callbacks.onComplete = fn;
        }
    
        function onFinish(fn:Function){        
            callbacks.onFinish = fn;
        }

        function listenPing(){
            lastPingTime = Date.now();

            pingInterval = setInterval(()=>{//TODO move to update with (% count)
                if(state.reconnecting) return;
                lastPingTime = Date.now();
                room.send(MESSAGE.PING);
            }, 5000);
        }

        function handleFrameEvents(){
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
                setIdle();
            });

            frameEventHandler.onEvent(EVENT.HOLE, async () => {
                gamePlayState.finished = true;
                console.log("MY HOLE");
                control.hide();
                ball.reproduceSound("hole");
                ball.hide();
                visualCourse.reproduceHoleAction();
            });

            frameEventHandler.onEvent(EVENT.WIND, ()=>{
                ball.reproduceSound("wind");
            });

            frameEventHandler.onEvent(EVENT.SAND, ()=>{
                ball.reproduceSound("sand");
            });

            frameEventHandler.onEvent(EVENT.OUT, async ()=>{
                physicBall.body.sleep();
                await sleep(100);
                physicBall.body.position.set(positionBeforeShoot.x,positionBeforeShoot.y,positionBeforeShoot.z);
                await sleep(100);
                setIdle();
            });

            frameEventHandler.onEvent(EVENT.EXPLOSIVE, ({type, data})=>{
                console.log("frame EVENT.EXPLOSIVE", type, data);
                visualCourse.getParts()[data.id].reproduceAction();
            });
        }

        async function onMessageHoleCountdown(ms){
            console.log("HOLE COUNTDOWN", Date.now())
            cdText.visible = true;
            cdText.value = "";

            let counter = Math.floor(ms/1000);
            let holeCountdownInterval = setInterval(()=>{
                cdText.value = "Ending in...\n"+(--counter).toString();
                if(counter <= 0 || room.state.finished || cancelEnding){
                    console.log("CANCEL COUNTDOWN", Date.now(), cancelEnding, counter, room.state.finished)
                    cancelEnding = false;
                    clearInterval(holeCountdownInterval);
                    cdText.visible = false;
                }
            },1000);
            //TODO here we should start creating the new map game
        }

        async function onMessageHoleEndCountdown(){
            cancelEnding = true;
            console.log("HOLE END COUNTDOWN");
            await fadeInOverlay(3);
        }


    }

    return {createClientGolfPlay};
}
function noop(){}
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

export {GolfplayClientSeasonFactory, createFixBugButton}