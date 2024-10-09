import courseMockTrainingHole2 from "../../../../common/course-definitions/courseMockTrainingHole2";
import { cloneJSON } from "../../../../common/utils";
import {EVENT, GameplayHandler} from "./handler-def";

export const voxtersHandler:GameplayHandler = (world, gameEvents, gameplay) => {
    const {courseDefinition, ballBody, state} = gameplay;
    const voxters = courseDefinition.parts.filter(p=>p.type === "voxter");
    const voxtersState = {
        collidedIndexes:[]
    };
    const backupState = cloneJSON(voxtersState);
    return {
        update,
        onEvent,
        enable:(value)=>{},
        saveState:() => {
            Object.assign(backupState, cloneJSON(voxtersState));
        },//TODO fix array reference
        restoreState:() => {
            Object.assign(voxtersState, cloneJSON(backupState));
        }
    };

    function onEvent(fn){
        gameEvents.onEvent(EVENT.VOXTER, fn);
    }

    function update(dt) {        
        if(state.idle || state.finished) return;

        const collision = voxters.reduce((acc, voxter,index) => { //TODO REVIEW: if necessary performance optimization (pre array lookup, chunk zone, etc.)
            if(acc) return acc;
            if(~voxtersState.collidedIndexes.indexOf(index)) return;
            const [ x2, y2, z2 ] = voxter.position;
            const { x, y, z } = ballBody.position;
            
            const distance = Math.pow(Math.pow(x2-x,2)/2 + Math.pow(y2-y,2)/2 + Math.pow(z2-z,2), 0.5);
            if( distance < 0.4 ){//TODO REVIEW: check if sphere is good enough or need check box collision
                return { voxter, index };
            }
        }, undefined);
        
        if(collision){           
            voxtersState.collidedIndexes.push(collision.index);
            gameEvents.trigger({type:EVENT.VOXTER, data:{
                index:collision.index,
                hit:voxtersState.collidedIndexes.length,
                isLast:voxtersState.collidedIndexes.length === voxters.length
            }});
        }
    }
}