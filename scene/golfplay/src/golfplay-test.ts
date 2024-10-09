import { createRandomVoxter } from "./components/voxter/voxter";
import { createVisualCourse } from "./components/course/course-visual-loader";
import { createPhysicsWorld} from "../physics/world";
import { createPhysicBall} from "../physics/ball";
import {decorateRemotePhysicParts, loadCoursePhysics} from "../physics/course-element-loader";
import { createShootControl } from "./components/shoot-control";
import { createGameHandler} from "./gameplay-handlers/gameplay-handler";
import { EVENT} from "./gameplay-handlers/handler-def";
import { getCourseDefinition } from "../../../common/course-definitions/course-definition-repository";
import { reproduceAvatarSound } from "../mana-fever-utils/lib/sound/avatar-sound";
import { sleep } from "../../../common/utils";
import { movePlayerTo } from '@decentraland/RestrictedActions';
import {migrateCourseDefinitionAnimations} from "../../../common/course-animations-migration";
import { MovingPartComponent } from "./components/course/visual-part";
import EV from "../../../lib/expression-storage/_expression-storage";
import { VisualZoneFactory } from "./components/visual-zone";
import { VisualBallFactory } from "./components/ball";
import { CheckpointFactory } from "./components/visual-checkpoint";
import {createShootControl2} from "./components/shoot-control/index-camera-version";
import {getCanvas} from "../services/canvas";

const evaluateExpression = EV.evaluateExpression;
declare const CANNON;
const FIXED_TIME_STEPS = 0.03;
const MAX_TIME_STEPS = 100;
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
        engine.removeSystem(this);
    }
}

export const createTestGolfPlay = async (parent:Entity, {gameDefinition}) => {
    await decorateRemotePhysicParts(fetch, true);
    const {createVisualBall} = VisualBallFactory({baseResourceUrl:""});
    const {createVisualZone} = VisualZoneFactory({baseResourceUrl:""});
    const {createCheckpoint} = CheckpointFactory({baseResourceUrl:""});
    const area = new UIText(getCanvas());
    area.value = "0";
    area.hAlign = "right";
    area.vAlign = "top";

    const callbacks:{[key:string]:null|Function} = {
        onFinish:null
    };
    const courseDefinition:any = migrateCourseDefinitionAnimations( await getCourseDefinition(gameDefinition, fetch, true));
    courseDefinition.expressions = courseDefinition.expressions || {};
    courseDefinition.expressions.seed = Date.now();
    const ballSpawnDefinition = courseDefinition.parts.find((part:any)=>part.type === "initial_position");
    const initialPlayerPosition = new Vector3(...courseDefinition.parts.find((part:any)=>part.type === "spawn").position);
    const {world} = createPhysicsWorld();
    const ball = createVisualBall(parent, {position:new Vector3(...ballSpawnDefinition.position)});
    const physicBall = createPhysicBall(world, { position:ballSpawnDefinition.position });

    physicBall.body.sleep();
    physicBall.onCollide((e)=>{
        if(e.body.material.name === "woodMaterial"){
            ball.reproduceSound("wood", Math.min(1, physicBall.body.velocity.length()/10));
        }else if(e.body.material.name === "dumperMaterial"){
            ball.reproduceSound("bumper", Math.min(1, physicBall.body.velocity.length()/25));
        }
    });
    const expressionState = {};
    const control = createShootControl(parent, {
        position:new Vector3(...ballSpawnDefinition.position),
        rotation:new Quaternion(...ballSpawnDefinition.rotation),
        golfclub:{

            power:5,
            control:5,
            aim:5,
            id:"8",


        }
    });
    let positionBeforeShoot;

    const visualCourse = createVisualCourse(parent, {courseDefinition});
    //TODO apply initialAssignment reactives: look for all parts with storage, then execute applyReactive

    const physicParts = loadCoursePhysics(world, {CANNON, courseDefinition:courseDefinition});
    const movingPhysicParts = Object.values(physicParts).filter((pp:any)=>pp.definition.animation).reduce((acc, current)=>{
        acc[current.definition.id] = current;
        return acc;
    },{});


    const gamePlayState = {idle:true, shoots:0, shootStartTime:null};
    const gameHandler = createGameHandler({
        gameType:'competition', world, parts:physicParts, ballBody:physicBall.body, state:gamePlayState,
        courseDefinition:{...courseDefinition, expressions:{seed:1,...courseDefinition.expressions }}, movingPhysicParts, onExpressionEvent, applySmartParts:true});
    //TODO replace it with onExpressionEvent after initialization
    Object.assign(expressionState, gameHandler.getExpressionState());
    visualCourse.applyAllValues(expressionState);
    const setIdle = () => {
        gamePlayState.idle = true;
        control.show();
        control.setPosition(physicBall.body.position);
    }
    gameHandler.onEvent(EVENT.EXPLOSIVE, (({type, data})=>{
       visualCourse.getParts()[data.id].reproduceAction();
    }));
    gameHandler.onEvent(EVENT.OUT, ({type, data})=>{
        physicBall.body.sleep();
        physicBall.body.position.set(positionBeforeShoot.x, positionBeforeShoot.y, positionBeforeShoot.z)
        setIdle();
    });

    function onExpressionEvent({type, data}){
        Object.assign(expressionState, data.newValues);

        data.targetControlIds.forEach(partId => {
            visualCourse.applyReactiveValue(
                partId,
                expressionState
            )
        });
    }

    gameHandler.onEvent(EVENT.SLEEP, async (data)=>{
        const distance = Math.pow(
            Math.pow(positionBeforeShoot.x-physicBall.body.position.x,2)/2 
            + Math.pow(positionBeforeShoot.y-physicBall.body.position.y,2)/2 + 
            Math.pow(positionBeforeShoot.z-physicBall.body.position.z,2), 0.5);
        //await sleep(1);
        physicBall.body.sleep();
        setIdle();
    });
    
    gameHandler.onEvent(EVENT.WIND,()=>{
        ball.reproduceSound("wind");
    });

    gameHandler.onEvent(EVENT.SAND, ()=>{
        ball.reproduceSound("sand");
    });
    
    control.onShoot(async ({impulse, delayMs})=>{
        
      //  control.hide();
        await sleep(delayMs);
        //gamePlayState.idle = false;
        console.log("onShoot",impulse)
        positionBeforeShoot = physicBall.body.position.clone();
        const {x,y,z} = impulse;
        gamePlayState.idle = false;
        physicBall.wakeUp();
        physicBall.applyImpulse(new CANNON.Vec3(x,y,z), physicBall.body.position);
        ball.reproduceSound("shoot"+(impulse.length()>13?2:1),1);
        gamePlayState.shoots++;
    });
    const updateSystem = new UpdateSystem(update);
    engine.addSystem(updateSystem);
    movePlayerTo({
        x:initialPlayerPosition.x+24,
        y:initialPlayerPosition.y,
        z:initialPlayerPosition.z+24
    }, { x: 8+24, y: 1, z: 8+24 });
    //TODO refactor as gameplay decorators?
    //game type specifics, to refactor to own service later
    if(gameDefinition.type === "training"){
        if(gameDefinition.subType === "1"){
            //TODO instead of creating several visual checkpoints, just create 1 and move
            const checkpoints = courseDefinition.parts.filter(part=>part.type === "checkpoint");
            const visualCheckpoint = createCheckpoint(parent, {
                position:new Vector3(...checkpoints[0].position),
                visible:true
            });
            gameHandler.onEvent(EVENT.CHECKPOINT, ({data})=>{
                const {checkpoint, index} = data;
                reproduceAvatarSound("checkpoint");
                if(index === (checkpoints.length-1)){
                    visualCheckpoint.dispose();
                }else{
                    visualCheckpoint.moveTo(new Vector3(...checkpoints[index+1].position))
                }
            });
        }else if(gameDefinition.subType === "2"){//zone
            const zoneDefinition = courseDefinition.parts.find(part => part.type === "zone");
            const visualZone = createVisualZone(parent, {
                position:new Vector3(...zoneDefinition.position),
                scale:new Vector3(...zoneDefinition.scale)
            });
            gameHandler.onEvent(EVENT.ZONE, ({data})=>{
                const {distance, position} = data;
               // visualZone.dispose();
                physicBall.body.position.set(
                    ...ballSpawnDefinition.position
                );
            });

            gameHandler.onEvent(EVENT.SLEEP, ({data})=>{
                
                physicBall.body.position.set(
                    ...ballSpawnDefinition.position
                );
            });
        }else if(gameDefinition.subType === "3"){//voxters
            const voxterDefinitions = courseDefinition.parts.filter(part => part.type === "voxter");
            const vixualVoxters = voxterDefinitions.map(voxterDefinition => {
                return createRandomVoxter(parent, {
                    position:new Vector3(...voxterDefinition.position)
                })
            });
            gameHandler.onEvent(EVENT.VOXTER, ({data})=>{
                reproduceAvatarSound("voxter");
                const { voxter, index, isLast } = data;
                vixualVoxters[index].dispose();
                if(isLast){
                    callbacks.onFinish && callbacks.onFinish(true);
                }
            });
        }else if(gameDefinition.subType === "4"){
            gameHandler.onEvent(EVENT.SLEEP, ()=>{
              /*   if(gamePlayState.shoots === 3){
                    callbacks.onFinish && callbacks.onFinish(false);
                } */
            });
            gameHandler.onEvent(EVENT.HOLE, (data)=>{               
                ball.reproduceSound("hole");
                physicBall.body.position.set(
                    ...ballSpawnDefinition.position
                );
                physicBall.body.sleep();
                setIdle();

            });
        }

    }else if(gameDefinition.type === "competition"){
        gameHandler.onEvent(EVENT.HOLE, (data)=>{

            physicBall.body.position.set(
                ...ballSpawnDefinition.position
            );
            physicBall.body.sleep();
            setIdle();
        });
    }
  
    var lastTime = Date.now()/1000;
    const STEPS_FPS = 60*4;
    const FRAME_SPEED = 1;

    const timeStep = 1/STEPS_FPS;
    var cannonInterval = setInterval(()=>{      
        var now = Date.now() / 1000;
        var timeSinceLastCall = now - lastTime;
        
        world.step(timeStep*FRAME_SPEED, timeSinceLastCall);
        lastTime = now;
    }, 15);

    const ballBoundingBox = {
        ax:0,
        ay:0,
        az:0,
        bx:0,
        by:0,
        bz:0
    }
    function update(dt:number){
        ball.setPosition(physicBall.body.position, physicBall.body.quaternion);
        control.setPosition(physicBall.body.position);
        gameHandler.update(dt, undefined, true);
        if(movingPhysicParts){
            engine.getComponentGroup(MovingPartComponent).entities.forEach((entity)=>{
                const partId = entity["name"];            
                (()=>{
                    const {x,y,z} = movingPhysicParts[partId].bodies[0].position;            
                    entity.getComponent(Transform).position.set(x,y,z);
                })();
                (()=>{
                    const {x,y,z,w} =  movingPhysicParts[partId].bodies[0].quaternion;
                    entity.getComponent(Transform).rotation.set(x,y,z,w);
                })();                        
            });
        }
        const ballPosition = physicBall.body.position;
        if(!ballBoundingBox || ballPosition.y < 0) return;
        ballBoundingBox.ax = Math.min(ballBoundingBox.ax||ballPosition.x, ballPosition.x);
        ballBoundingBox.ay = Math.min(ballBoundingBox.ay||ballPosition.y, ballPosition.y);
        ballBoundingBox.az = Math.min(ballBoundingBox.az||ballPosition.z, ballPosition.z);
        ballBoundingBox.bx = Math.max(ballBoundingBox.bx||ballPosition.x, ballPosition.x);
        ballBoundingBox.by = Math.max(ballBoundingBox.by||ballPosition.y, ballPosition.y);
        ballBoundingBox.bz = Math.max(ballBoundingBox.bz||ballPosition.z, ballPosition.z);
        area.value = Math.floor(calculateAreaFromBB(ballBoundingBox)).toString();
    }
    return {
        dispose,
        onFinish
    };
    function calculateAreaFromBB(bb){
        const x = Math.abs(bb.ax - bb.bx);
        const y = Math.abs(bb.ay - bb.by);
        const z = Math.abs(bb.az - bb.bz);
        return x*y*z;
    }
    function dispose () {
        clearInterval(cannonInterval);
        callbacks.onFinish = null;
        updateSystem.dispose();
    }

    function onFinish(fn:Function){
        callbacks.onFinish = fn;
    }
}