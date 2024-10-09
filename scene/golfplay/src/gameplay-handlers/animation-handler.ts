import { lerp, slerp } from "../../../../common/utils";
import {EVENT, GameplayHandler} from "./handler-def";
declare const console:any;
export const animationHandler:GameplayHandler = (world, gameEvents, gameplay) => {
    const {courseDefinition, movingPhysicParts} = gameplay;    
    const definitionMovingParts = courseDefinition.parts.filter(p => p.animation);
    const handlerState = {
        globalAnimationDt:0
    };
    const backupState = {
        globalAnimationDt:0
    }
    let eventFilterCount = 0;
    return {
        id:"animation",
        update,
        onEvent,
        saveState,
        restoreState,
        getState
    };

    function getState(){
        return handlerState;
    }
    
    function saveState(){
       backupState.globalAnimationDt = handlerState.globalAnimationDt;
    }

    function restoreState(){
        handlerState.globalAnimationDt = backupState.globalAnimationDt;
    }

    function onEvent(fn){
       
    }
    
    function update(dt) { 
        eventFilterCount += dt;
        if(eventFilterCount > 0.5){  
            eventFilterCount = 0;
        }
        handlerState.globalAnimationDt += dt;
        const globalDt = handlerState.globalAnimationDt;
        
        definitionMovingParts.forEach(definitionMovingPart=>{
            const partAnimationTime = globalDt % definitionMovingPart.partAnimationTotalTime;
            const currentTransitionIndex = definitionMovingPart.animationTransitions.findIndex(t=> partAnimationTime < t.targetTime);
            const currentTransition = definitionMovingPart.animationTransitions[currentTransitionIndex];
            const currentTransitionDt = partAnimationTime- definitionMovingPart.animationFrameTimes[currentTransitionIndex];
            //TODO apply velocity also?
            const physicPart = movingPhysicParts[definitionMovingPart.id];
            physicPart.bodies.forEach(body=>{
                const {x,y,z} = definitionMovingPart.animation.kinematics[currentTransitionIndex].velocity;
                body.velocity.set(x,y,z); 
            });

            (()=>{
                const {x,y,z} = lerp(
                    definitionMovingPart.animation.kinematics[currentTransitionIndex].position,
                    definitionMovingPart.animation.kinematics[currentTransitionIndex+1].position,
                    currentTransitionDt/currentTransition.duration
                );
                physicPart.bodies.forEach(body=>{
                    body.position.set(x,y,z); 
                });
            })(); 
            (()=>{
                const {x,y,z,w} = slerp(
                    definitionMovingPart.animation.kinematics[currentTransitionIndex].quaternion,
                    definitionMovingPart.animation.kinematics[currentTransitionIndex+1].quaternion,
                    currentTransitionDt/currentTransition.duration );
                physicPart.bodies.forEach(body=>{
                    body.quaternion.set(x,y,z,w); 
                });
            })();          
        });
    } 
}