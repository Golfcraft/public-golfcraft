import {EVENT, GameplayHandler} from "./handler-def";

export const zoneHandler:GameplayHandler = (world, gameEvents, gameplay) => {
    const {ballBody,state} = gameplay;
    const zone = gameplay.courseDefinition.parts.find(p=>p.type==="zone");

    gameEvents.onEvent(EVENT.SLEEP, ()=>{
        if(state.finished || state.idle) return;
        const [ x2, y2, z2 ] = zone.position;
        const { x, y, z } = ballBody.position;
        const distance = Math.pow(Math.pow(x2-x,2)/2 + Math.pow(y2-y,2)/2 + Math.pow(z2-z,2), 0.5);

        state.finished = true;
        gameEvents.trigger({type:EVENT.ZONE, data:{
            position:ballBody.position,
            distance,
            inside:distance <= zone.scale[0]
        }});
    })
    return {
        onEvent,
        update
    }

    function onEvent(fn){
        gameEvents.onEvent(EVENT.ZONE, fn);
    }

    function update(dt){

    }
}
