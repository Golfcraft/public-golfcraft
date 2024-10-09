import {EVENT, GameplayHandler} from "./handler-def";
import {cloneJSON, isInsideBox} from "../../../../common/utils";

export const directionAreaHandler:GameplayHandler = (world, gameEvents, gameplay) => {
    const {courseDefinition, ballBody, state} = gameplay;
    const winds = courseDefinition.parts.filter(p=>p.subtype === "direction_area");

    const handlerState = {
        inWind:[]
    };
    const backupState = cloneJSON(handlerState);
    const FORCE = 120;

    const WIND_POSITIONS_WITH_OFFSET = winds.map(wind => {
        return [wind.position[0],wind.position[1]+0.25,wind.position[2]];
    });
    const BOX_SCALE = [2,0.25,2];
    return {
        update,
        onEvent,
        enable:(value)=>{},
        saveState:()=>Object.assign(backupState, handlerState),
        restoreState:()=>Object.assign(handlerState, backupState),
    }

    function onEvent(fn){
        gameEvents.onEvent(EVENT.WIND, fn);
    }

    function update(dt) {
        if(state.idle || state.finished) return;
        winds.forEach((wind, index)=>{
            if( isInsideBox(WIND_POSITIONS_WITH_OFFSET[index], BOX_SCALE, ballBody.position) ){
                if(!handlerState.inWind[index]){
                    gameEvents.trigger({type:EVENT.WIND, data:{}})
                }
                handlerState.inWind[index] = true;
                const q = new CANNON.Quaternion(...wind.rotation);
                const vector = wind.rotation.every(r=>!r)
                    ? new CANNON.Vec3(0,0,dt * FORCE)
                    : q.vmult(new CANNON.Vec3(0,0,dt * FORCE));

                ballBody.applyForce(vector, ballBody.position);
            }else{
                handlerState.inWind[index] = false;
            }
        })

        function getVectorFromQ(x,y,z,w){
            let V = [];
            V[0] = 2 * (x * z - w * y)
            V[1] = 2 * (y * z + w * x)
            V[2] = 1 - 2 * (x * x + y * y);
            return V;
        }

    }
}