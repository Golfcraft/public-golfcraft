import { createEventManager } from "../services/EventManagerFactory";
import { zoneHandler } from "./training-zone-handler";
import { voxtersHandler } from "./training-voxters-handler";
import { animationHandler } from "./animation-handler";
import {magnetHandler} from "./magnet-handler";
import { windHandler, sandHandler } from "./fx-handler";
import {explosiveHandler} from "./explosive-handler";
import { BALL_SLEEP_TIMEOUT, BALL_SLEEP_VEL } from "../../../../common/physics-config";
import {EVENT, GameplayHandler} from "./handler-def";
import {createSmartPart} from "./smart-part";
import ExpressionStorage from "../../../../lib/expression-storage/_expression-storage";
const {createExpressionStorage} = ExpressionStorage;

const createGameHandler2 = ({gameType, world, ball, courseDefinition, movingPhysicParts, parts, excludeHandlers, onExpressionEvent}:any) => {
    const gameEvents = createEventManager();
    const runtimeAssignments = courseDefinition.expressions?.assignments;
    
    if(!CANNON) throw Error("CANNON not set for handlers");
    let handlers:any = getGameHandlersFromCourse(courseDefinition, excludeHandlers)
        .map(h => h(world, gameEvents, {ball, courseDefinition, movingPhysicParts}));

    const eStorage = createExpressionStorage({
        seed:courseDefinition.expressions?.seed,
        ...decorateInitialStateWithStorageDefaults(courseDefinition.expressions?.initialState||{}, courseDefinition)
    });
    
    eStorage.onEvent((event)=>{
        if(onExpressionEvent){
            onExpressionEvent(event);
        }
        gameEvents.trigger({type:"EVENT_VARIABLE_CHANGE", data:event.data});
    });

    const smartParts = courseDefinition.parts
        .filter(p=>p.expressions?.runtime)
        .map(partDef => createSmartPart(parts[partDef.id], ball.body, eStorage)) || [];

    if(runtimeAssignments){
        Object.keys(runtimeAssignments).forEach(assignmentStorage => {
            eStorage.addRuntimeAssignment({storage:assignmentStorage, ...runtimeAssignments[assignmentStorage]});
        });
    }

    return {
        //TODO REVIEW allow to define frequency of update, between 0.1 and 1? e.g. outHandler need less updates, checkpointHandler needs more updates: e.g. ??? (<any>outHandler).freq = 0.5; ???  
        update:(dt, onlyAnimations?, isSimulation?)=> {
            if(ball.body.sleepState) return;
            handlers && handlers.forEach(handler => handler.update(dt, false, isSimulation));
            smartParts.forEach(s=>s.update(dt));
        },
        dispose:()=>{//TODO care about callback leaks when dispose
            gameEvents.dispose();
            handlers = null;
        },
        onEvent:(type, fn) => gameEvents.onEvent(type, (...args)=>{
            if(ball.disabledEvents){
                return;
            }else{
                fn(...args);
            }
        })
    };

    function decorateInitialStateWithStorageDefaults(_initialState, courseDefinition){
        const initialState = {..._initialState};
        courseDefinition.parts.forEach(partInstanceDef => {
            if(partInstanceDef?.expressions?.runtime?.storage && !initialState[partInstanceDef?.expressions.runtime.storage]){
                initialState[partInstanceDef.expressions.runtime.storage] = getDefaultStorageValuePerType(partInstanceDef.subtype)
            }
        })
        return initialState;

        function getDefaultStorageValuePerType(subtype){
            if(~subtype.indexOf("control_switch")){
                return false;
            }
        }
    }
};

export {
    createGameHandler2
};

function getGameHandlersFromCourse (courseDefinition, excludeHandlers) {
    const result = [outHandler, sleepHandler];
    if(courseDefinition.parts.find(p => p.type==="hole")){
        result.push(holeHandler)
    }
    if(courseDefinition.parts.find(p => p.type==="checkpoint")){
        result.push(checkpointHandler);
    }
    /*if(courseDefinition.parts.find(p => p.type==="wind")){
        result.push(windHandler);
    }
    if(courseDefinition.parts.find(p => p.type==="sand")){
        result.push(sandHandler);
    }
    if(courseDefinition.parts.find(p => p.type==="zone")){
        result.push(zoneHandler);
    }
    if(courseDefinition.parts.find(p=>p.type ==="voxter")){
        result.push(voxtersHandler);
    }
    if(courseDefinition.parts.find(p=>p.type ==="explosive")){
        result.push(explosiveHandler);
    }
    if(courseDefinition.parts.find(p=>p.type === "magnet")){
        result.push(magnetHandler)
    }
    if(courseDefinition.parts.find(p=>p.animation) && !((excludeHandlers||[]).indexOf("animation") >= 0)){
        result.push(animationHandler);
    }*/

    return result;
}


const outHandler:GameplayHandler = (world, gameEvents, gameplay) => {
    const {ball} = gameplay;
    return {
        onEvent,
        update
    }

    function onEvent(fn){
        gameEvents.onEvent(EVENT.OUT, fn);
    }

    function update() {
        if (ball.body.sleepState) return;
        if (ball.body.position.y < -2) {
            gameEvents.trigger({
                type: EVENT.OUT,
                data: {
                    position: ball.body.position,
                    id: ball.id
                }
            });
        }
    }
}

//TODO REVIEW: optimization ?? like this? (<any>outHandler).freq = 0.5; to avoid executing some updates frequently, e.g. outHandler needs less times as there is not necessary precission bellow 0
const sleepHandler:GameplayHandler = (world, gameEvents, gameplay) => {
    const {ball} = gameplay;
    const handlerState = {
        dt:0,
        lastCheck:0
    }
    return {
        onEvent,
        update
    };

    function onEvent(fn){
        gameEvents.onEvent(EVENT.SLEEP, fn);
    }

    function update(){
        if(ball.body.sleepState) return;
        const vel = ball.body.velocity.length();

        if(vel < BALL_SLEEP_VEL){
            if((Date.now() - handlerState.lastCheck) >= BALL_SLEEP_TIMEOUT){
                gameEvents.trigger({type:EVENT.SLEEP, data:{position:ball.body.position,id:ball.id}});
                ball.body.sleep();
                ball.body.velocity = new CANNON.Vec3(0,0,0);
                ball.body.angularVelocity = new CANNON.Vec3(0,0,0);
            }
            handlerState.lastCheck = handlerState.lastCheck || Date.now();
        }

    }
};


const holeHandler:GameplayHandler = (world, gameEvents, gameplay) => {
    const {courseDefinition, ball} = gameplay;
    const hole = courseDefinition.parts.find(p=>p.type === "hole");
    const [x2,y2,z2] = hole.position;

    return {
        update,
        onEvent,
    };

    function onEvent(fn){
        gameEvents.onEvent(EVENT.HOLE, fn);
    }

    function update (dt) {
        if(ball.body.sleepState || ball.finished) return;

        const {x,y,z} = ball.body.position;
        const distance = Math.pow(Math.pow(x2-x,2)/2 + Math.pow(y2-y,2)/2 + Math.pow(z2-z,2), 0.5);
        if(distance < 0.4){
            gameEvents.trigger({type:EVENT.HOLE, data:{id:ball.id}});
            ball.finished = true;
        }
    }
}


const checkpointHandler:GameplayHandler = (world, gameEvents, gameplay) => {
    const {courseDefinition, ball} = gameplay;
    const checkpoints = courseDefinition.parts.filter(p=>p.type === "checkpoint");//TODO .sort((a,b)=>a.order-b.order);
    const handlerState = { currentCheck:0 };

    return {
        update,
        onEvent
    };

    function onEvent(fn){
        gameEvents.onEvent(EVENT.CHECKPOINT, fn);
    }

    function update() {
        if(ball.body.sleepState || ball.finished) return;
        const checkpoint = checkpoints[handlerState.currentCheck];
        if(!checkpoint) return;
        const [ x2, y2, z2 ] = checkpoint.position;
        const { x, y, z } = ball.body.position;
        const distance = Math.pow(Math.pow(x2-x,2)/2 + Math.pow(y2-y,2)/2 + Math.pow(z2-z,2), 0.5);
        if( distance < 0.5 ){
            if(handlerState.currentCheck === checkpoints.length-1){
               // state.finished = true;
            }
            gameEvents.trigger({
                type: EVENT.CHECKPOINT,
                data: {
                    index: handlerState.currentCheck,
                    checkpoint: {...checkpoint},
                    id: ball.id
                }
            });
            handlerState.currentCheck++;
        }
    }
}