import {EVENT, GameplayHandler} from "./handler-def";
import { cloneJSON, getDistance, isInsideBox } from "../../../../common/utils";

export const magnetHandler:GameplayHandler = (world, gameEvents, gameplay) => {
    const {courseDefinition, ballBody, state} = gameplay;
    const magnets = courseDefinition.parts.filter(p=>p.type === "magnet");


    const scales = magnets.reduce((acc,magnet)=>{
        acc[magnet.id] =  (magnet?.expressions?.physics?.radius)
            ? magnet?.expressions?.physics?.radius
            : 2;
        return acc;
    }, {});

    return {
        update,
        onEvent,
        enable:(value)=>{},
        saveState:()=>{},
        restoreState:()=>{}
    };

    function onEvent(fn){
        gameEvents.onEvent(EVENT.WIND, fn);
    }

    function update(dt) {
        if(state.idle || state.finished) return;
        magnets.forEach((magnet)=>{
            if( isInsideSphere(magnet.position, scales[magnet.id], ballBody.position) ){
                const q = new CANNON.Quaternion();
                const magentPosition = new CANNON.Vec3(...magnet.position );
                q.setFromVectors( ballBody.position, magentPosition );

                const distance = ballBody.position.distanceTo(magentPosition);
                const MULT = Number(magnet.expressions?.physics?.force || 150);
                const force = dt*MULT/distance
                const diffVector = magentPosition.vsub(ballBody.position);
                diffVector.normalize();
              
                ballBody.applyForce(diffVector.mult(force), ballBody.position);
            }
        })

        function isInsideSphere(position:number[], radius, ballPosition:CANNON.Vec3 ){
            return ballPosition.distanceTo(new CANNON.Vec3(...position)) < radius;
        }
    }
}
