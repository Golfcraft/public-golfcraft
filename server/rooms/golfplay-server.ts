import { createPhysicsWorld} from "../../scene/golfplay/physics/world";
import { createPhysicBall} from "../../scene/golfplay/physics/ball";
import {decorateRemotePhysicParts, loadCoursePhysics} from "../../scene/golfplay/physics/course-element-loader";
import { createGameHandler } from "../../scene/golfplay/src/gameplay-handlers/gameplay-handler";
import { EVENT } from "../../scene/golfplay/src/gameplay-handlers/handler-def";
import { GameDefinition } from "../../common/game-definition-type";
import fetch from "cross-fetch";
import {getDistance, sleep} from "../../common/utils";

type ServerGolfPlayOptions = {    
    gameDefinition:GameDefinition,
    courseDefinition:any,
    timeStep:number,
    recoveredBallPosition?:number[],
    cannonParts?:any
};

export const creatServerGolfPlay = async ({gameDefinition, courseDefinition, cannonParts, recoveredBallPosition}:ServerGolfPlayOptions) => {
    await decorateRemotePhysicParts(fetch);//TODO review this is not efficient
    const callbacks:{[key:string]:null|Function} = {
        onFinish:null,
        onUpdate:null,
        onEvent:null
    };

    const {world} = createPhysicsWorld();
    const physicBall = createPhysicBall(world, {position:recoveredBallPosition || courseDefinition.parts.find((part:any)=>part.type === "initial_position")!.position });
    physicBall.body.sleep();
    let positionBeforeShoot = physicBall.body.position.clone();
    let distanceBetweenShoots = 0;
    const physicParts = loadCoursePhysics(world, {courseDefinition, overrideCannonParts:cannonParts});
    const movingPhysicParts = Object.values(physicParts).filter((pp:any)=>pp.definition.animation).reduce((acc, current:any)=>{
        acc = acc || {};
        acc[current.definition.id] = current;
        current.animationState = {currentFrame:0, count:0};
        return acc;
    },null);

    const gamePlayState = {idle:true, finished:false};//TODO move to coly State?
    const gameHandler = createGameHandler({
        gameType:gameDefinition.type,         
        world, 
        ballBody:physicBall.body, 
        state:gamePlayState, 
        courseDefinition,
        movingPhysicParts,
        parts:physicParts,
        applySmartParts:true,
        onExpressionEvent
    });

    function onExpressionEvent({type, data}){               
        setTimeout(()=>{
            callbacks.onEvent && callbacks.onEvent({type:EVENT.EVENT_VARIABLE_CHANGE, data});
        },0);
    }

    gameHandler.disableEvents();

    gameHandler.onEvent(EVENT.OUT, async ({data}) => {
        console.log("EVENT.OUT")
        console.log("physicBall.body.position.toString()", physicBall.body.position.toString())
        console.log("positionBeforeShoot", JSON.stringify(positionBeforeShoot));
        physicBall.body.velocity.set(0,0,0);
        physicBall.body.angularVelocity.set(0,0,0);
        physicBall.body.sleep();
        callbacks.onEvent && callbacks.onEvent({type:EVENT.OUT, data});

        console.log("OUT: set positionBeforeShoot", JSON.stringify(positionBeforeShoot))
        physicBall.body.position.set(positionBeforeShoot.x,positionBeforeShoot.y,positionBeforeShoot.z);


        setIdle();
    });

    gameHandler.onEvent(EVENT.SLEEP, ({data}) => {
        console.log("EVENT.SLEEP");
        console.log("physicBall.body.position.toString()", physicBall.body.position.toString())
        console.log("positionBeforeShoot", JSON.stringify(positionBeforeShoot));
        physicBall.body.velocity.set(0,0,0);
        physicBall.body.angularVelocity.set(0,0,0);
        physicBall.body.sleep();
        callbacks.onEvent && callbacks.onEvent({type:EVENT.SLEEP, data});
        setIdle();
    });

    if(gameDefinition.type === "training") {
        //TODO not handling onFinish here?
        if(gameDefinition.subType === "1"){
            gameHandler.onEvent(EVENT.CHECKPOINT, ({type, data})=>{
                callbacks.onEvent && callbacks.onEvent({type:EVENT.CHECKPOINT, data});
            });
        }else if(gameDefinition.subType === "2"){
            gameHandler.onEvent(EVENT.ZONE, ({type, data})=>{
                callbacks.onEvent && callbacks.onEvent({type:EVENT.ZONE, data});
            });
            //TODO REVIEW OUT already defined above
             /* gameHandler.onEvent("OUT", ({type, data})=>{
                callbacks.onEvent("OUT");
            }); */
        }else if(gameDefinition.subType === "3"){
            gameHandler.onEvent(EVENT.VOXTER, ({type,data})=>{
                callbacks.onEvent && callbacks.onEvent({type:EVENT.VOXTER, data});
            });
        }else if(gameDefinition.subType === "4"){
            gameHandler.onEvent(EVENT.HOLE, ({type,data}) => {
                gamePlayState.finished = true;
                callbacks.onEvent && callbacks.onEvent({type:EVENT.HOLE, data});                    
            });
        }
    }else if(gameDefinition.type === "competition"){
        gameHandler.onEvent(EVENT.HOLE, ({type, data}) => {
            gamePlayState.finished = true;                
            callbacks.onEvent && callbacks.onEvent({type:EVENT.HOLE, data});    
            callbacks.onFinish && callbacks.onFinish();
            //TODO callbaks.onEvent("HOLE") --> 
            //TODO + REVIEW: not call onFinish from here, never, delete onFinish?                
        });
    }

    function getFrames({timeStep, impulse, delayMs, lastPingMs}){
        const processingStart = Date.now();
        const frames = [];
        let i = 0;
        const backupState = {
            idle:gamePlayState.idle,
            finished:gamePlayState.finished
        };
        gamePlayState.finished = gamePlayState.idle = false;
        gameHandler.saveState();
        gameHandler.disableEvents();
        shoot({impulse});
        let delaySteps = Math.floor((delayMs/1000)/timeStep);        
        while(delaySteps--){
            gameHandler.update(timeStep);//palo de golf animation running, movingParts continue, no updates when ping is bigger than animation time
        }

        while(true){ 
            if(frames.length > 3000){
                console.warn("> 3000 frames");
                frames.push({
                    ...frames[frames.length-1],
                    events:[{type:EVENT.OUT}]
                })
                return {frames, processingTime: Date.now() - processingStart};
            }
            world.step(timeStep);
            const events = gameHandler.update(timeStep, undefined, true);
            const {position, velocity} = physicBall.body
            frames.push({
                position:{x:position.x, y:position.y, z:position.z},
                velocity:{x:velocity.x, y:velocity.y, z:velocity.z},
                events
            });
            
            if(events.find(event => event.type === EVENT.SLEEP || event.type === EVENT.OUT || event.type === EVENT.ZONE)){
                const processingTimeMs = Date.now() - processingStart;
                physicBall.body.sleep();
                gameHandler.enableEvents();//TODO remove save/restore state
                gameHandler.restoreState();
                Object.assign(gamePlayState, backupState);
                
                return {frames, processingTimeMs};        
            }
            i++;
        }
    }

    function update(dt:number){
        world.step(dt);
        gameHandler.update(dt);      
        triggerBallUpdate();
        if(movingPhysicParts){
            callbacks.onUpdate && callbacks.onUpdate({
                movingParts:Object.values(movingPhysicParts||{}).map(movingPart => {
                    const {position, angularVelocity, quaternion, velocity} = movingPart.bodies[0];
                    return {position, angularVelocity, quaternion, velocity};
                })
            });
        }
    }

    function updateAnimations(dt:number){
        if(movingPhysicParts){
            gameHandler.update(dt, true);
            callbacks.onUpdate && callbacks.onUpdate({
                movingParts:Object.values(movingPhysicParts||{}).map(movingPart => {
                    const {position, angularVelocity, quaternion, velocity} = movingPart.bodies[0];
                    return {position, angularVelocity, quaternion, velocity};
                })
            });
        }
    }

    function updateHandlers(dt){
        gameHandler.update(dt);      
    }

    return {
        getExpressionState:()=>gameHandler.getExpressionState(),
        getBallPosition,
        getFrames,
        shoot,
        update,
        updateHandlers,
        updateAnimations,
        onFinish:(fn)=>{
            callbacks.onFinish = fn;
        },
        onUpdate:(fn)=>{
            callbacks.onUpdate = fn;
            triggerBallUpdate();            
        },
        onEvent: (fn) => {
            callbacks.onEvent = fn;
        },
        dispose,
        getPhysicsParts:()=>physicParts,
        getPhysicBall:()=>physicBall,
        saveState:()=>gameHandler.saveState(),
        restoreState:()=>gameHandler.restoreState(),
        getDistance:()=>distanceBetweenShoots,
        resetLastBallPos:()=>{
            if(!positionBeforeShoot) {
                throw new Error("REVIEW BUG !positionBeforeShoot");
                callbacks.onEvent && callbacks.onEvent({type:EVENT.CLIENT_LOG, data:{message:"!positionBeforeShoot"}});
            }
            physicBall.body.position.set(positionBeforeShoot.x, positionBeforeShoot.y, positionBeforeShoot.z)
            physicBall.body.velocity.set(0,0,0);
            physicBall.body.angularVelocity.set(0,0,0);
            physicBall.body.sleep();
        },
        setIdle:(value)=>{
            gamePlayState.idle = value;
            if(!value){
                physicBall.wakeUp();
            }
        }
    }
    
    function dispose () {
        gameHandler.dispose();
        callbacks.onFinish = null;
        callbacks.onUpdate = null;
        callbacks.onEvent = null;
    }

    function getBallPosition(){
        return physicBall.body.position.clone();
    }

    function shoot({impulse}){       
        gamePlayState.idle = false;
        //TODO here calculate distance
        distanceBetweenShoots += getDistance(
            [positionBeforeShoot.x,positionBeforeShoot.y,positionBeforeShoot.z],
            [physicBall.body.position.x,physicBall.body.position.y,physicBall.body.position.z]
        );
        Object.assign(positionBeforeShoot, physicBall.body.position.clone())
        console.log("shoot", JSON.stringify(positionBeforeShoot));
        const {x,y,z} = impulse;
        physicBall.wakeUp();        
        physicBall.applyImpulse(new CANNON.Vec3(x,y,z), physicBall.body.position);   
    }

    function triggerBallUpdate(){
        if(gamePlayState.idle) return;
        const {position, angularVelocity, quaternion, velocity} = physicBall.body;
        callbacks.onUpdate && callbacks.onUpdate({
            ball:{
               position,
               angularVelocity,
               quaternion,
               velocity
            }
        });  
    }

    function setIdle(){
        gamePlayState.idle = true;
    }
}
