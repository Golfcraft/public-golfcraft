import { createPhysicsWorld} from "../../scene/golfplay/physics/world";
import { createPhysicBall} from "../../scene/golfplay/physics/ball";
import {decorateRemotePhysicParts, loadCoursePhysics} from "../../scene/golfplay/physics/course-element-loader";
import { createGameHandler2 } from "../../scene/golfplay/src/gameplay-handlers/gameplay-handler2";
import { EVENT } from "../../scene/golfplay/src/gameplay-handlers/handler-def";
import { GameDefinition } from "../../common/game-definition-type";
import EV from "../../lib/expression-storage/_expression-storage";
import fetch from "cross-fetch";
import {getFrames} from "../physics-frames";
const evaluateExpression = EV.evaluateExpression;
type ServerGolfPlayOptions = {
    gameDefinition:GameDefinition,
    courseDefinition:any,
    timeStep:number,
    recoveredBallPosition?:number[]

};

export const creatServerGolfPlay2 = async ({gameDefinition, courseDefinition, timeStep, recoveredBallPosition}:ServerGolfPlayOptions) => {
    await decorateRemotePhysicParts(fetch);//TODO review this is not efficient
    const callbacks:{[key:string]:null|Function} = {
        onFinish:null,
        onUpdate:null,
        onEvent:null
    };
    const expressionState = {};
    const {world} = createPhysicsWorld();
    const balls = {};
    const handlers = {};
    const physicParts = loadCoursePhysics(world, {courseDefinition});
    const gamePlayState = {idle:true, finished:false, positionBeforeShoot:null};//TODO move to coly State?


    function removeBall(ballId){
        world.remove(balls[ballId].body);
        delete balls[ballId];
    }

    function addPhysicBall(id, {position}){
        const physicBall = balls[id] = createPhysicBall(world, {id, position:recoveredBallPosition || courseDefinition.parts.find((part:any)=>part.type === "initial_position")!.position });
        balls[id].body.sleep();
        const ballHandler = handlers[id] = createGameHandler2({
            gameType:gameDefinition.type,
            ball:balls[id],
            world,
            courseDefinition,
            parts:physicParts,
            onExpressionEvent:undefined
        });
        ballHandler.onEvent(EVENT.ANY,({data,type})=>{
            callbacks.onEvent && callbacks.onEvent({type, data});
        });
    }

    function updatePhysics(){
        world.step(timeStep, timeStep);
    }

    function updateHandlers(){
        Object.values(handlers).forEach((h:any) => h.update());
    }

    function shootBall({impulse, id}){
        const {x,y,z} = impulse;
        const physicBall = balls[id];
        gamePlayState.positionBeforeShoot = physicBall.body.position.clone();
        physicBall.wakeUp();
        physicBall.applyImpulse(new CANNON.Vec3(x,y,z), physicBall.body.position);
    }


    return {
        getWorld:()=>world,
        removeBall,
        shootBall,
        getPhysicsBalls,
        getBallPosition,
        updatePhysics,
        updateHandlers,
        addPhysicBall,
        getFrames:({startTime,amountS, fps, reset}) => getFrames({startTime, world, amountS, timeStep, balls, reset, fps}),
        onFinish:(fn)=>{
            callbacks.onFinish = fn;
        },
        onEvent: (fn) => {
            callbacks.onEvent = fn;
        },
        dispose,
        getPhysicsParts:()=>physicParts,
        getPhysicBalls:()=>balls,
        resetLastBallPos:(id)=>{
            const {positionBeforeShoot} = gamePlayState;
            if(!positionBeforeShoot) throw new Error("REVIEW BUG");

            balls[id].body.position.set(positionBeforeShoot.x, positionBeforeShoot.y, positionBeforeShoot.z)
            balls[id].body.velocity.set(0,0,0);
            balls[id].body.angularVelocity.set(0,0,0);
            balls[id].body.sleep();
        },
        setIdle:(value, id)=>{
            gamePlayState.idle = value;
            if(!value){
                balls[id].wakeUp();
            }
        }
    }

    function dispose () {
        Object.values(handlers).forEach((h:any)=>h.dispose());
        Object.keys(handlers).forEach(key =>{
            delete handlers[key];
        });
        callbacks.onFinish = null;
        callbacks.onUpdate = null;
        callbacks.onEvent = null;
    }

    function getBallPosition(id){
        return balls[id].body.position;
    //    return physicBall.body.position.clone();
    }

    function getPhysicsBalls(){
        return balls;
    }
}
