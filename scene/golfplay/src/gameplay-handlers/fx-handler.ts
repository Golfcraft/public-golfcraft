import {EVENT, GameplayHandler} from "./handler-def";
import { cloneJSON, isInsideBox } from "../../../../common/utils";

export const windHandler:GameplayHandler = (world, gameEvents, gameplay) => {
    const {courseDefinition, ballBody, state} = gameplay;
    const winds = courseDefinition.parts.filter(p=>p.type === "wind");

    const handlerState = {
        inWind:false
    };
    const backupState = cloneJSON(handlerState);
    return {
        update,
        onEvent,
        enable:(value)=>{},
        saveState:()=>Object.assign(backupState, handlerState),
        restoreState:()=>Object.assign(handlerState, backupState)
    }

    function onEvent(fn){
        gameEvents.onEvent(EVENT.WIND, fn);
    }

    function update(dt) {
        if(state.idle || state.finished) return;
        winds.forEach((wind)=>{
            if( isInsideBox(wind.position, wind.scale, ballBody.position) ){
                if(!handlerState.inWind){
                    gameEvents.trigger({type:EVENT.WIND, data:{}})
                }
                handlerState.inWind = true;
                //resultVelocity = velocity + acceleration * (1 - velocity / terminalVelocity);
                const q = new CANNON.Quaternion(...wind.rotation);
                const vector = q.vmult(new CANNON.Vec3(0,0,dt*80));
                ballBody.applyForce(vector, ballBody.position);
            }else{
                handlerState.inWind = false;
            }
        })

    }
}

export const sandHandler:GameplayHandler = (world, gameEvents, gameplay) => {
    const {courseDefinition, ballBody, state} = gameplay;
    const sands = courseDefinition.parts.filter(p=>p.type === "sand");
    const handlerState = {
        currentCheck:0,
        inSand:false
    }
    const backupState = cloneJSON(handlerState);
    return {
        update,
        onEvent,
        enable:(value)=>{},
        saveState:()=>Object.assign(backupState, handlerState),
        restoreState:()=>Object.assign(handlerState, backupState)
    }

    function onEvent(fn){
        gameEvents.onEvent(EVENT.SAND, fn);
    }

    function update(dt) {
        if(state.idle || state.finished) return;
        const sand = sands[handlerState.currentCheck];

        if( isInsideBox(sand.position, sand.scale, ballBody.position) ){
            if(!handlerState.inSand){
                gameEvents.trigger({type:EVENT.SAND,data:{}});
            }
            handlerState.inSand = true;
            const coefficient = 0.09;
            const speed = ballBody.velocity.length();
            const dragMagnitude = coefficient * Math.pow(speed, 2);
            const drag = ballBody.velocity.clone();
            drag.scale(-1, drag);
            drag.normalize();
            drag.scale(dragMagnitude, drag);
            ballBody.applyForce(drag, ballBody.position);
            //TODO Review next line? ballBody.angularVelocity = new CANNON.Vec3()
            ballBody.angularVelocity = new CANNON.Vec3();
        }else{
            handlerState.inSand = false;
        }

        handlerState.currentCheck++;
        if(handlerState.currentCheck === sands.length){
            handlerState.currentCheck = 0;
        }
    }
}