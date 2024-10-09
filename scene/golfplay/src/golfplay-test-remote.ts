import { createPhysicsWorld, initializeMaterials } from "../physics/world";
import {createTestGolfPlay} from "./golfplay-test";
import {registerSound, reproduceAvatarSound} from "../mana-fever-utils/lib/sound/avatar-sound";
import Colyseus = require('colyseus.js');
import {cannonParts, decorateRemotePhysicParts, loadCoursePhysics} from "../physics/course-element-loader";
import { getCourseDefinition } from "../../../common/course-definitions/course-definition-repository";
import { migrateCourseDefinitionAnimations } from "../../../common/course-animations-migration";
import MESSAGE from "../../../server/rooms/mesages";
import {createFrameReproduction} from "../../../common/frame-reproductor";
import { createGameHandler } from "./gameplay-handlers/gameplay-handler";
import { EVENT } from "./gameplay-handlers/handler-def";
import { createPhysicBall } from "../physics/ball";
import { createShootControl } from "./components/shoot-control";
import { movePlayerTo } from "@decentraland/RestrictedActions";
import { createEventManager } from "./services/EventManagerFactory";
import { MovingPartComponent } from "./components/course/visual-part";
import { createVisualCourse } from "./components/course/course-visual-loader";
import { createRandomVoxter } from "./components/voxter/voxter";
import { VisualZoneFactory } from "./components/visual-zone";
import { sleep } from "../../../common/utils";
import { VisualBallFactory } from "./components/ball";
import { CheckpointFactory } from "./components/visual-checkpoint";

export async function createRemoteGamePlay(remote, remoteGameDefinition, parent, {golfclub} = {golfclub:undefined}){
    const {createVisualBall} = VisualBallFactory({baseResourceUrl:""});
    const {createVisualZone} = VisualZoneFactory({baseResourceUrl:""});
    const {createCheckpoint} = CheckpointFactory({baseResourceUrl:""});
    await decorateRemotePhysicParts(fetch, true);
    await sleep(1);
    const frameEventHandler = createEventManager();
    var lastPingTime = Date.now();
    var lastPing = 0;
    console.log("connecting...")
    const colyseus = new Colyseus.Client(`${remote}`);
    const expressionState = {};
    const gameDefinition = remoteGameDefinition;
    const {world} = createPhysicsWorld();
    const courseDefinition = migrateCourseDefinitionAnimations(await getCourseDefinition(gameDefinition, fetch, true));

    const physicParts = loadCoursePhysics(world, {CANNON, courseDefinition});

    const movingPhysicParts = Object.values(physicParts).filter((pp:any)=>pp.definition.animation).reduce((acc, current)=>{
        acc[current.definition.id] = current;
        return acc;
    },{});
    const room = await colyseus.joinOrCreate(`test-room`, {
        user:'test', realm:'locahost', userId:'test-userId', PlayFabId:'MockPlayFabId', 
        gameDefinition:{
            ...gameDefinition
        },
        courseDefinition,
        cannonParts,
        roomInstanceId:Date.now()
    });

    console.log("room", room);

    room.send(MESSAGE.PING);
    
    const ballSpawnDefinition = courseDefinition.parts.find((part:any)=>part.type === "initial_position");
    const ball = createVisualBall(parent, {position:new Vector3(...ballSpawnDefinition.position), collectionId: gameDefinition.collectionId});
    const physicBall = createPhysicBall(world, { position:ballSpawnDefinition.position });
    physicBall.body.sleep();
    const gamePlayState = {idle:true, shoots:0, shootStartTime:null, started:false};
    const initialPlayerPosition = new Vector3(...courseDefinition.parts.find((part:any)=>part.type === "spawn").position);
    const gameHandler = createGameHandler({
        gameType:gameDefinition.type,
        world,
        ballBody:physicBall.body,
        state:gamePlayState,
        courseDefinition,
        movingPhysicParts,
        parts:physicParts,
        excludeHandlers:["animation"],
        applySmartParts:true,
        onExpressionEvent:({type, data})=>{
            //console.log("onExpressionEvent", ...args)
            const {targetControlIds, newValues, oldValues, isDelayed} = data;
            if(isDelayed){
                Object.assign(expressionState, newValues);
                targetControlIds.forEach((partId)=>{
                    visualCourse.applyReactiveValue(partId, expressionState)
                })
            }

            //TODO apply only when it's a delayed event
        }
    });
    if(courseDefinition.expressions?.initialAssignments){
        Object.assign(expressionState, gameHandler.getExpressionState());//TODO assignments should be evaluated
    }
    const updateSystem = new UpdateSystem(update);
    const visualCourse = createVisualCourse(parent, {courseDefinition});
    visualCourse.applyAllValues(expressionState);
    const control = createShootControl(parent, {
        position: new Vector3(...ballSpawnDefinition.position),
        rotation: new Quaternion(...ballSpawnDefinition.rotation),
        golfclub:golfclub||{
            power:0,
            control:0,
            aim:0,
            id:"2"
        }
    });
    movePlayerTo({
        x:initialPlayerPosition.x+24,
        y:initialPlayerPosition.y,
        z:initialPlayerPosition.z+24
    }, { x: 8+24, y: 1, z: 8+24 });
   
    room.onMessage(MESSAGE.PONG, ()=>{
        lastPing = (Date.now() - lastPingTime) / 2;
        room.send(MESSAGE.PING2);
    });
    room.onMessage(MESSAGE.START, ({startTime, duration, serverTime})=>{//TODO duplicated code, abstract to service
            gamePlayState.started = true;
            control.show();

           /*  const localStartTime = startTime - (serverTime-Date.now());

            topBar.show();
            timeInterval = setInterval(()=>{       
                if(!state.started && localStartTime <= Date.now()){
                    state.started = true;
                    
                   
                    gameState.starting = false;
                }  
                if(state.started){
                    if((localStartTime + ( duration * 1000 )) < Date.now()) {
                        clearInterval(timeInterval);
                        topBar.updateTime(0);                    
                    } else {
                        topBar.updateTime((localStartTime + (duration * 1000)) - Date.now());
                    }   
                }              
            },100);  */
    });
    const STEPS_FPS = 60*4;
    const timeStep = 1/STEPS_FPS;
    let shootFramesInfo:any = null;
    let positionBeforeShoot;
    room.onMessage(MESSAGE.SHOOT_FRAMES, ({timeStep, impulse, frames})=>{
        shootFramesInfo = {frames, impulse, timeStep};
        positionBeforeShoot = physicBall.body.position.clone();
    });

    control.onShoot(({impulse, delayMs}) => {//delayMs is golfclub animation   
        control.hide();
        gamePlayState.idle = false;
        
        room.send(MESSAGE.SHOOT, {impulse, timeStep, delayMs});
    }); 
    let frameReproductor:any = null;

    room.onMessage(MESSAGE.START_SHOOT_FRAMES, ()=>{
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
        setIdle();    
    });
    function setIdle () {
        gamePlayState.idle = true;
        control.show();
        control.setPosition(physicBall.body.position);
    }
    frameEventHandler.onEvent(EVENT.HOLE, ()=>{
        ball.reproduceSound("hole");
    })
    frameEventHandler.onEvent(EVENT.WIND, ()=>{
        ball.reproduceSound("wind");
    });
    frameEventHandler.onEvent(EVENT.SAND, ()=>{
        ball.reproduceSound("sand");
    });
    frameEventHandler.onEvent(EVENT.OUT, ()=>{
        physicBall.body.sleep();
        physicBall.body.position.set(positionBeforeShoot.x,positionBeforeShoot.y,positionBeforeShoot.z);
        setIdle();
    });
    frameEventHandler.onEvent(EVENT.EXPLOSIVE, ({type, data})=>{
        console.log("EVENT.EXPLOSIVE",type,data);
        visualCourse.getParts()[data.id].reproduceAction();
    });

    let pingInterval = setInterval(()=>{//TODO move to update with (% count)
        lastPingTime = Date.now();
        room.send(MESSAGE.PING);        
    }, 5000);

    room.onMessage(MESSAGE.COMPLETED, ({xp, GC, time, shoots})=>{
      //  callbacks.onComplete && callbacks.onComplete({xp, GC, time, shoots});
      console.log("completed");
        //TODO show popup -> globalStore.game.getState().lastGameResult
    });
    let onlyServerPhysics = false;
    if(gameDefinition.type === "training"){
        if(gameDefinition.subType === "1"){
            const checkpoints = courseDefinition.parts.filter(part=>part.type === "checkpoint");
            const visualCheckpoints = checkpoints.map((checkpoint, index) => {
                return createCheckpoint(parent, {
                    position:new Vector3(...checkpoint.position),
                    visible:index===0 //TODO instead of visible, maybe just have 1 checkpoint and move it, make non visible when last
                });
            });
            room.onMessage(MESSAGE.CHECKPOINT,({checkpoint, index})=>{
                reproduceAvatarSound("checkpoint");
                if(index === (checkpoints.length-1)){
                    visualCheckpoints[index].dispose();
                }else{
                    visualCheckpoints[index].dispose();
                    visualCheckpoints[index+1].show();
                }
            });

            room.onLeave(()=>{
                visualCheckpoints.forEach(c=>c.dispose());
            })
        }else if(gameDefinition.subType === "2"){//TODO zone
            const zoneDefinition = courseDefinition.parts.find(part => part.type === "zone");
            const visualZone = createVisualZone(parent, {
                position: new Vector3(...zoneDefinition.position),
                scale: new Vector3(...zoneDefinition.scale)
            });
            room.onLeave((...args)=>{
                //dispose
                visualZone.dispose();
            })
        }else if(gameDefinition.subType === "3"){
            const voxters = courseDefinition.parts.filter(p=>p.type==="voxter");
            const visualVoxters = voxters.map((voxterDefinition)=>{
                return createRandomVoxter(parent, {
                    position:new Vector3(...voxterDefinition.position)
                })
            });

            frameEventHandler.onEvent(EVENT.VOXTER, ({type, data})=>{//TODO server side?
                console.log("FRAME voxter", JSON.stringify(data));
                reproduceAvatarSound("voxter");
                visualVoxters[data.index].dispose();
            });
            room.onLeave((...args)=>{
                visualVoxters.forEach(v=>v.dispose());//TODO could throw error
            });
        }
    }

    function update(dt:number){
        if(!gamePlayState.started) {
            return;
        };
        if(frameReproductor){
            frameReproductor.update(dt);
        }
        if(!onlyServerPhysics){     
           world.step(timeStep, dt);
        }; 
        ball.setPosition(
            physicBall.body.position,
            physicBall.body.quaternion
        );

        Object.values(movingPhysicParts||{}).forEach(physicPart  => {//TODO optimize
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
        gameHandler.update(dt);
    }
}

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
