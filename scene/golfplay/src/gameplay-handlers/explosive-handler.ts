import {EVENT, GameplayHandler} from "./handler-def";
import { cloneJSON, isInsideBox } from "../../../../common/utils";

export const explosiveHandler:GameplayHandler = (world, gameEvents, gameplay) => {
    const {courseDefinition, ballBody, state} = gameplay;
    const explosives = courseDefinition.parts.filter(p=>p.type === "explosive" || p.subtype === "explosive_mine");
    console.log("explosives",explosives)
    const handlerState = {
        currentCheck:0,
        explosives:explosives.reduce((acc, explosive) => (acc[explosive.id] = {
            exploded:false,
        }, acc), {})
    };
    const scales = explosives.reduce((acc, explosive) => {
        acc[explosive.id] = explosive.expressions?.physics?.scale?.map(s=>Number(s)) || explosive.scale;
        return acc;
    }, {});
    const FORCE_UP = 60;
    const FORCE_DIRECTION = 220;
    return {
        update,
        onEvent,
        enable:(value)=>{}
    }

    function onEvent(fn){
        gameEvents.onEvent(EVENT.EXPLOSIVE, fn);
    }

    function update(dt) {
        if(state.idle || state.finished) return;

        explosives.filter(e=>!handlerState.explosives[e.id].exploded).forEach(explosive => {
            if( isInsideBox(explosive.position, scales[explosive.id], ballBody.position) ){//TODO replace with distance/sphere
                    handlerState.explosives[explosive.id].exploded = true;
                    gameEvents.trigger({type:EVENT.EXPLOSIVE, data:explosive});//TODO it should reproduce animation and then remove entity
                                
                    const q = new CANNON.Quaternion(...explosive.rotation);
                    
                    const vectorUp = q.vmult(new CANNON.Vec3(0, Number(explosive.expressions?.physics?.forceUp || FORCE_UP),0));
                    const directionForce = ballBody.position.vsub(new CANNON.Vec3(...explosive.position ));
                    directionForce.normalize();
                    ballBody.applyForce(vectorUp, ballBody.position);
                    ballBody.applyForce(directionForce.mult(Number(explosive.expressions?.physics?.forceDirection || FORCE_DIRECTION)), ballBody.position);
            }  
        });       
    }
}
