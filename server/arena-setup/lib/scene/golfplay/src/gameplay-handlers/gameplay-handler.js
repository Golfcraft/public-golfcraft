"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGameHandler = void 0;
const EventManagerFactory_1 = require("../services/EventManagerFactory");
const training_zone_handler_1 = require("./training-zone-handler");
const training_voxters_handler_1 = require("./training-voxters-handler");
const animation_handler_1 = require("./animation-handler");
const fx_handler_1 = require("./fx-handler");
const physics_config_1 = require("../../../../common/physics-config");
const utils_1 = require("../../../../common/utils");
const createGameHandler = ({ gameType, world, ballBody, state, courseDefinition, movingPhysicParts }) => {
    const gameEvents = EventManagerFactory_1.createEventManager();
    if (!CANNON)
        throw Error("CANNON not set for handlers");
    let handlers = getGameHandlersFromCourse(courseDefinition).map(h => h(world, gameEvents, { ballBody, state, courseDefinition }));
    return {
        //TODO REVIEW allow to define frequency of update, between 0.1 and 1? e.g. outHandler need less updates, checkpointHandler needs more updates: e.g. ??? (<any>outHandler).freq = 0.5; ???
        applyPartAnimationFrame: ({ data }) => {
            movingPhysicParts[data.partId].animationState = Object.assign({ count: 0 }, data);
            movingPhysicParts[data.partId].bodies.forEach(body => {
                const { position, quaternion, velocity, angularVelocity } = data.kinematics;
                body.position.set(position.x, position.y, position.z);
                body.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
                body.velocity.set(velocity.x, velocity.y, velocity.z);
                //body.angularVelocity.set(angularVelocity.x, angularVelocity.y, angularVelocity.z, angularVelocity.w);
            });
        },
        update: (dt) => {
            handlers && handlers.forEach(handler => handler.update(dt));
            //TODO move parts
            Object.values(movingPhysicParts).forEach((physicPart) => {
                if (physicPart.animationState.duration) {
                    physicPart.animationState.count += dt;
                    const { x, y, z, w } = utils_1.slerp(physicPart.animationState.kinematics.quaternion, physicPart.animationState.endKinematics.quaternion, physicPart.animationState.count / physicPart.animationState.duration);
                    physicPart.bodies.forEach(body => {
                        body.quaternion.set(x, y, z, w);
                    });
                }
            });
        },
        dispose: () => {
            gameEvents.dispose();
            handlers = null;
        },
        onEvent: (type, fn) => gameEvents.onEvent(type, fn)
    };
};
exports.createGameHandler = createGameHandler;
function getGameHandlersFromCourse(courseDefinition) {
    const result = [outHandler, sleepHandler];
    if (courseDefinition.parts.find(p => p.type === "hole")) {
        result.push(holeHandler);
    }
    if (courseDefinition.parts.find(p => p.type === "checkpoint")) {
        result.push(checkpointHandler);
    }
    if (courseDefinition.parts.find(p => p.type === "wind")) {
        result.push(fx_handler_1.windHandler);
    }
    if (courseDefinition.parts.find(p => p.type === "sand")) {
        result.push(fx_handler_1.sandHandler);
    }
    if (courseDefinition.parts.find(p => p.type === "zone")) {
        result.push(training_zone_handler_1.zoneHandler);
    }
    if (courseDefinition.parts.find(p => p.type === "voxter")) {
        result.push(training_voxters_handler_1.voxtersHandler);
    }
    if (courseDefinition.parts.find(p => p.type === "explosive")) {
        result.push(fx_handler_1.explosiveHandler);
    }
    if (courseDefinition.parts.find(p => p.animation)) {
        result.push(animation_handler_1.animationHandler);
    }
    return result;
}
const outHandler = (world, gameEvents, gameplay) => {
    const { ballBody, state } = gameplay;
    return {
        onEvent,
        update
    };
    function onEvent(fn) {
        gameEvents.onEvent("OUT", fn);
    }
    function update(dt) {
        if (state.idle)
            return;
        if (ballBody.position.y < -1) {
            gameEvents.trigger({ type: "OUT", data: {
                    position: ballBody.position
                } });
        }
    }
};
//TODO REVIEW: optimization ?? like this? (<any>outHandler).freq = 0.5; to avoid executing some updates frequently, e.g. outHandler needs less times as there is not necessary precission bellow 0
const sleepHandler = (world, gameEvents, gameplay) => {
    const { ballBody, state } = gameplay;
    let counter = 0;
    return {
        onEvent,
        update
    };
    function onEvent(fn) {
        gameEvents.onEvent("SLEEP", fn);
    }
    function update(dt) {
        if (state.idle)
            return;
        const vel = ballBody.velocity.length();
        if (vel < physics_config_1.BALL_SLEEP_VEL) {
            counter += dt;
            if (counter >= physics_config_1.BALL_SLEEP_TIMEOUT) {
                gameEvents.trigger({ type: "SLEEP", data: { position: ballBody.position } });
                ballBody.velocity = new CANNON.Vec3(0, 0, 0);
                ballBody.angularVelocity = new CANNON.Vec3(0, 0, 0);
                counter = 0;
            }
        }
        else {
            counter = 0;
        }
    }
};
const holeHandler = (world, gameEvents, gameplay) => {
    const { courseDefinition, ballBody, state } = gameplay;
    const hole = courseDefinition.parts.find(p => p.type === "hole");
    const [x2, y2, z2] = hole.position;
    return {
        update,
        onEvent,
        enable: (value) => { }
    };
    function onEvent(fn) {
        gameEvents.onEvent("HOLE", fn);
    }
    function update(dt) {
        if (state.idle || state.finished)
            return;
        const { x, y, z } = ballBody.position;
        const distance = Math.pow(Math.pow(x2 - x, 2) / 2 + Math.pow(y2 - y, 2) / 2 + Math.pow(z2 - z, 2), 0.5);
        if (distance < 0.4) {
            gameEvents.trigger({ type: 'HOLE', data: {} });
            state.finished = true;
        }
    }
};
const checkpointHandler = (world, gameEvents, gameplay) => {
    const { courseDefinition, ballBody, state } = gameplay;
    const checkpoints = courseDefinition.parts.filter(p => p.type === "checkpoint"); //TODO .sort((a,b)=>a.order-b.order);
    let currentCheck = 0;
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
        const checkpoint = checkpoints[currentCheck];
        const index = currentCheck;
        const [x2, y2, z2] = checkpoint.position;
        const { x, y, z } = ballBody.position;
        const distance = Math.pow(Math.pow(x2 - x, 2) / 2 + Math.pow(y2 - y, 2) / 2 + Math.pow(z2 - z, 2), 0.5);
        if (distance < 0.5) {
            gameEvents.trigger({ type: 'CHECKPOINT', data: { checkpoint, index } });
            currentCheck++;
            if (currentCheck === checkpoints.length) {
                state.finished = true;
            }
        }
    }
};
