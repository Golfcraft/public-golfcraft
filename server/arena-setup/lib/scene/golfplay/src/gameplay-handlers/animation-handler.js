"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.animationHandler = void 0;
exports.animationHandler = (world, gameEvents, gameplay) => {
    const { courseDefinition, ballBody, state } = gameplay;
    const movingParts = courseDefinition.parts.filter(p => p.animation);
    const animationState = {
        parts: movingParts.reduce((acc, partDefinition, index) => {
            acc[partDefinition.id] = { counter: 0, currentFrame: 0 };
            return acc;
        }, {})
    };
    return {
        update,
        onEvent,
        enable: (value) => { }
    };
    function onEvent(fn) {
        gameEvents.onEvent("ANIMATION_FRAME_KINEMATICS", fn);
    }
    function update(dt) {
        movingParts.forEach((partDefinition) => {
            const partAnimationState = animationState.parts[partDefinition.id];
            if (!partAnimationState)
                return;
            const currentFrame = partAnimationState.currentFrame;
            const currentFrameTime = partDefinition.animationFrameTimes[currentFrame];
            partAnimationState.counter += dt;
            if (partAnimationState.counter >= currentFrameTime) {
                if (currentFrame === partDefinition.animationFrameTimes.length - 1) {
                    partAnimationState.counter = 0;
                }
                else {
                }
                gameEvents.trigger({ type: "ANIMATION_FRAME_KINEMATICS", data: {
                        currentFrame: partAnimationState.currentFrame,
                        partId: partDefinition.id,
                        kinematics: partDefinition.animation.kinematics[partAnimationState.currentFrame],
                        start: Date.now(),
                        duration: currentFrame < partDefinition.animationFrameTimes.length - 1
                            ? partDefinition.animationFrameTimes[getNextFrame(currentFrame)] - partDefinition.animationFrameTimes[currentFrame]
                            : 0,
                        endKinematics: partDefinition.animation.kinematics[getNextFrame(currentFrame)]
                    } });
                partAnimationState.currentFrame = getNextFrame(currentFrame);
            }
            function getNextFrame(index) {
                if (index + 1 >= partDefinition.animationFrameTimes.length) {
                    return 0;
                }
                return index + 1;
            }
        });
    }
};
