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
import {directionAreaHandler} from "./direction-area-handler";
import {partsWithHole} from "../editor/hole-part-registry";
const {createExpressionStorage} = ExpressionStorage;

export type FrameData = {
    data:{
        partId,
        currentFrame,
        kinematics,
        endKinematics,
        duration,
        start
    }
}

const createGameHandler = ({gameType, world, ballBody, state, courseDefinition, movingPhysicParts, parts, excludeHandlers, onExpressionEvent, applySmartParts}:any) => {
    const gameEvents = createEventManager();
    const runtimeAssignments = courseDefinition.expressions?.assignments;
    let disposed = false;
    state.disabledEvents = false;
    if(!CANNON) throw Error("CANNON not set for handlers");
    let handlers:any = getGameHandlersFromCourse(courseDefinition, excludeHandlers)
        .map(h => h(world, gameEvents, {ballBody, state, courseDefinition, movingPhysicParts}));
        //TODO smart parts -> setValue , update
    const animationHandler = handlers.find(h=>h.id==="animation");
    //TODO collect all parts with expressions.runtime.storage, and if it's not in initialState add it with false value
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
    const eStorage = createExpressionStorage({
        seed:courseDefinition.expressions?.seed,
        ...decorateInitialStateWithStorageDefaults(courseDefinition.expressions?.initialState||{}, courseDefinition)
    }, courseDefinition.expressions?.initialAssignments);

    eStorage.onEvent((event)=>{
        if(onExpressionEvent){
            onExpressionEvent(event);
        }
        gameEvents.trigger({type:EVENT.EVENT_VARIABLE_CHANGE, data:event.data});
    });

    const smartParts = applySmartParts && courseDefinition.parts
        .filter(p=>p.expressions?.runtime)
        .map(partDef => {
            console.log("creating smart part", partDef)
            return createSmartPart(parts[partDef.id] || {definition:partDef, bodies:[]}, ballBody, eStorage)
        }) ||[];


    if(runtimeAssignments){
        Object.keys(runtimeAssignments).forEach(assignmentStorage => {
            console.log("adding runtime assignment", assignmentStorage, runtimeAssignments[assignmentStorage]);
            eStorage.addRuntimeAssignment({storage:assignmentStorage, ...runtimeAssignments[assignmentStorage]});
        });
    }  

    let ballBackup;
    let frameEvents = [];
    gameEvents.onEvent(EVENT.ANY, (event)=>{
        frameEvents.push(event);
    });

    return {
        getExpressionState:()=>eStorage.getState(),
        //TODO REVIEW allow to define frequency of update, between 0.1 and 1? e.g. outHandler need less updates, checkpointHandler needs more updates: e.g. ??? (<any>outHandler).freq = 0.5; ???  
        update:(dt, onlyAnimations?, isSimulation?)=> {
            if(disposed) return;
            if(onlyAnimations){
                animationHandler && animationHandler.update(dt, onlyAnimations, isSimulation);
            }else{
                handlers && handlers.forEach(handler => handler.update(dt, false, isSimulation));
            }
            smartParts.forEach(s=>s.update(dt));
            const updateEvents = frameEvents;
            frameEvents = [];
            return updateEvents;
        },
        dispose:()=>{//TODO care about callback leaks when dispose
            disposed = true;
            gameEvents.dispose();
            handlers = null;
        },
        setAnimationGlobalDt:(value)=>{
            animationHandler.getState().globalAnimationDt = value;
            animationHandler.update(0);
        },
        getAnimationGlobalDt:()=>animationHandler.getState().globalAnimationDt,
        onEvent:(type, fn) => gameEvents.onEvent(type, (...args)=>{
            if(disposed) return;
            if(state.disabledEvents){
                return;
            }else{
                fn(...args);
            }
        }),
        disableEvents:()=>{
            state.disabledEvents=true;
        },
        enableEvents:()=>{
            state.disabledEvents=false;
        },
        saveState:()=>{
            if(disposed) return;
            handlers.forEach(h=>h.saveState && h.saveState());
            //TODO copy movingParts props and anitmationState
           
            //TODO copy ball props
            ballBackup = {
                position:{x:ballBody.position.x, y:ballBody.position.y, z:ballBody.position.z},
                velocity:{x:ballBody.velocity.x, y:ballBody.velocity.y, z:ballBody.velocity.z},
                angularVelocity:{x:ballBody.angularVelocity.x, y:ballBody.angularVelocity.y, z:ballBody.angularVelocity.z},
                quaternion:{x:ballBody.quaternion.x, y:ballBody.quaternion.y, z:ballBody.quaternion.z, w:ballBody.quaternion.w}
            }
        },
        restoreState:()=>{
            if(disposed) return;
            handlers.forEach(h=>h.restoreState && h.restoreState());
            copyCoords(ballBackup.position, ballBody.position);
            copyCoords(ballBackup.velocity, ballBody.velocity);
            copyCoords(ballBackup.angularVelocity, ballBody.angularVelocity);
            copyCoords(ballBackup.quaternion, ballBody.quaternion);
            
            function copyCoords(source, target:{set:Function}){
                source.w
                    ? target.set(source.x, source.y, source.z, source.w)
                    : target.set(source.x, source.y, source.z)
            }
        }
    };
};

export {
    createGameHandler
};

function getGameHandlersFromCourse (courseDefinition, excludeHandlers) {
    const result = [outHandler, sleepHandler];
    /*if(courseDefinition.parts.find(p => p.type==="hole")){
        result.push(holeHandler)
    }*/
    if(courseDefinition.parts.find(p => Object.keys(partsWithHole).indexOf(p.subtype) > -1)){
        result.push(holeHandler)
    }
    if(courseDefinition.parts.find(p => p.type==="checkpoint")){
        result.push(checkpointHandler);
    }
    if(courseDefinition.parts.find(p => p.type==="wind")){
        result.push(windHandler);
    }
    if(courseDefinition.parts.find(p => p.subtype === "direction_area")){
        result.push(directionAreaHandler);
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
    if(courseDefinition.parts.find(p=>p.type ==="explosive" || p.subtype === "explosive_mine")){
        result.push(explosiveHandler);
    }
    if(courseDefinition.parts.find(p=>p.type === "magnet")){
        result.push(magnetHandler);
    }
    if(courseDefinition.parts.find(p=>p.animation) && !((excludeHandlers||[]).indexOf("animation") >= 0)){
        result.push(animationHandler);
    }

    return result;
}


const outHandler:GameplayHandler = (world, gameEvents, gameplay) => {
    const {ballBody, state} = gameplay;
    return {
        onEvent,
        update
    }

    function onEvent(fn){
        gameEvents.onEvent(EVENT.OUT, fn);
    }

    function update(dt){
        if(state.idle) return;
        if(ballBody.position.y < -2){
            console.log("trigger OUT", JSON.stringify(ballBody.position))
            gameEvents.trigger({type:EVENT.OUT,data:{
                position:ballBody.position
            }});
        }
    }
}

//TODO REVIEW: optimization ?? like this? (<any>outHandler).freq = 0.5; to avoid executing some updates frequently, e.g. outHandler needs less times as there is not necessary precission bellow 0
const sleepHandler:GameplayHandler = (world, gameEvents, gameplay) => {
    const {ballBody, state} = gameplay;
    const handlerState = {
        counter:0
    }
    const backupState = {counter:0};
    return {
        onEvent,
        update,
        saveState:()=>backupState.counter = handlerState.counter,
        restoreState:()=>handlerState.counter = backupState.counter,
    }

    function onEvent(fn){
        gameEvents.onEvent(EVENT.SLEEP, fn);
    }

    function update(dt){
        if(state.idle) return;
        if(ballBody.position.y <= -0.6) {
            return;//let OUT event be triggered
        }
        const vel = ballBody.velocity.length();

        if(vel < BALL_SLEEP_VEL){
            handlerState.counter += dt;
            if(handlerState.counter >= BALL_SLEEP_TIMEOUT){
                gameEvents.trigger({type:EVENT.SLEEP, data:{position:ballBody.position}});
                ballBody.velocity.set(0,0,0);
                ballBody.angularVelocity.set(0,0,0);
                handlerState.counter = 0;
            }
        } else {
            handlerState.counter = 0;
        }
    }
};

const holeHandler:GameplayHandler = (world, gameEvents, gameplay) => {
    const {courseDefinition, ballBody, state} = gameplay;
    // Hole part is ignored
    //const hole = courseDefinition.parts.find(p=>p.type === "hole");
    //const [x2,y2,z2] = hole.position;

    const hole = courseDefinition.parts.find(p=>Object.keys(partsWithHole).indexOf(p.subtype) > -1);
    const hole_visible_position = new CANNON.Vec3(
        hole.position[0],
        hole.position[1],
        hole.position[2]
    )
    const hole_visible_rotation = new CANNON.Vec3(
        hole.rotation[0],
        hole.rotation[1],
        hole.rotation[2]
    )
    const hole_sensor_local_position = new CANNON.Vec3(
        -partsWithHole[hole.subtype][0],
        -partsWithHole[hole.subtype][1],
        -partsWithHole[hole.subtype][2]
    )
    //const ball_global_position = parent.getComponent(Transform).position.add(ball_local_position.rotate(parent.getComponent(Transform).rotation))
    
    const hole_sensor_global_position = hole_visible_position.vadd(rotateVectorByEuler(hole_sensor_local_position, hole_visible_rotation))

    return {
        update,
        onEvent,
        enable:(value)=>{}
    };

    function onEvent(fn){
        gameEvents.onEvent(EVENT.HOLE, fn);
    }

    function update (dt) {
        if(state.idle || state.finished) return;

        //const {x,y,z} = ballBody.position;
        //const distance = Math.pow(Math.pow(x2-x,2)/2 + Math.pow(y2-y,2)/2 + Math.pow(z2-z,2), 0.5);
        const distance = hole_sensor_global_position.distanceTo(ballBody.position);
        if(distance < 0.4){
            gameEvents.trigger({type:EVENT.HOLE, data:{}});
            state.finished = true;
        }
    }
}

const checkpointHandler:GameplayHandler = (world, gameEvents, gameplay) => {
    const {courseDefinition, ballBody, state} = gameplay;
    const checkpoints = courseDefinition.parts.filter(p=>p.type === "checkpoint");//TODO .sort((a,b)=>a.order-b.order);
    const handlerState = { currentCheck:0 };

    return {
        update,
        onEvent,
        enable:(value)=>{},
        saveState:()=>{

        },
        restoreState:()=>{

        }
    };

    function onEvent(fn){
        gameEvents.onEvent(EVENT.CHECKPOINT, fn);
    }

    function update(dt, animationsOnly, isSimulation) {
        if(state.idle || state.finished || !isSimulation) return;
        const checkpoint = checkpoints[handlerState.currentCheck];
        const [ x2, y2, z2 ] = checkpoint.position;
        const { x, y, z } = ballBody.position;
        const distance = Math.pow(Math.pow(x2-x,2)/2 + Math.pow(y2-y,2)/2 + Math.pow(z2-z,2), 0.5);
        if( distance < 0.5 ){
            if(handlerState.currentCheck === checkpoints.length-1){
                state.finished = true;
            }
            gameEvents.trigger({type:EVENT.CHECKPOINT, data:{ 
                index:handlerState.currentCheck, 
                checkpoint:{...checkpoint}}
            });
            handlerState.currentCheck++;
        }
    }
}

function rotateVectorByEuler(vector: CANNON.Vec3, rotation: CANNON.Vec3): CANNON.Vec3 {
    const radiansX = degreesToRadians(rotation.x);
    const radiansY = degreesToRadians(rotation.y);
    const radiansZ = degreesToRadians(rotation.z);

    const cosX = Math.cos(radiansX);
    const sinX = Math.sin(radiansX);
    const cosY = Math.cos(radiansY);
    const sinY = Math.sin(radiansY);
    const cosZ = Math.cos(radiansZ);
    const sinZ = Math.sin(radiansZ);

    const rotatedVector = new CANNON.Vec3(
        vector.x * (cosY * cosZ) + vector.y * (-cosY * sinZ) + vector.z * sinY,
        vector.x * (sinX * sinY * cosZ + cosX * sinZ) + vector.y * (sinX * sinY * sinZ - cosX * cosZ) + vector.z * (-sinX * cosY),
        vector.x * (-cosX * sinY * cosZ + sinX * sinZ) + vector.y * (-cosX * sinY * sinZ - sinX * cosZ) + vector.z * (cosX * cosY)
    );

    return rotatedVector;
}

function degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}