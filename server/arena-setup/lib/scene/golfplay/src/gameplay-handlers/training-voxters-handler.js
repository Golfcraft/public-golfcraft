"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voxtersHandler = void 0;
exports.voxtersHandler = (world, gameEvents, gameplay) => {
    const { courseDefinition, ballBody, state } = gameplay;
    const voxters = courseDefinition.parts.filter(p => p.type === "voxter");
    const voxtersState = {
        hit: 0,
        collidedIndexes: []
    };
    return {
        update,
        onEvent,
        enable: (value) => { }
    };
    function onEvent(fn) {
        gameEvents.onEvent("CHECKPOINT", fn);
    }
    function update(dt) {
        if (state.idle || state.finished)
            return;
        const collision = voxters.reduce((acc, voxter, index) => {
            if (acc)
                return acc;
            if (~voxtersState.collidedIndexes.indexOf(index))
                return;
            const [x2, y2, z2] = voxter.position;
            const { x, y, z } = ballBody.position;
            const distance = Math.pow(Math.pow(x2 - x, 2) / 2 + Math.pow(y2 - y, 2) / 2 + Math.pow(z2 - z, 2), 0.5);
            if (distance < 0.4) { //TODO REVIEW: check if sphere is good enough or need check box collision
                return { voxter, index };
            }
        }, undefined);
        if (collision) {
            console.log("collision voxter", collision);
            voxtersState.hit++;
            voxtersState.collidedIndexes.push(collision.index);
            gameEvents.trigger({ type: 'VOXTER', data: {
                    voxter: collision.voxter,
                    index: collision.index,
                    isLast: voxtersState.hit === voxters.length
                } });
        }
    }
};
