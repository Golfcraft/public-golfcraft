"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.explosiveHandler = exports.sandHandler = exports.windHandler = void 0;
const utils_1 = require("../../../../common/utils");
exports.windHandler = (world, gameEvents, gameplay) => {
    const { courseDefinition, ballBody, state } = gameplay;
    const winds = courseDefinition.parts.filter(p => p.type === "wind");
    let currentCheck = 0;
    let inWind = false;
    return {
        update,
        onEvent,
        enable: (value) => { }
    };
    function onEvent(fn) {
        gameEvents.onEvent("WIND", fn);
    }
    function update(dt) {
        if (state.idle || state.finished)
            return;
        const wind = winds[currentCheck];
        if (utils_1.isInsideBox(wind.position, wind.scale, ballBody.position)) {
            if (!inWind) {
                gameEvents.trigger({ type: "WIND", data: {} });
            }
            inWind = true;
            const [r_x, r_y, r_z, r_w] = wind.rotation;
            const q = new CANNON.Quaternion(r_x, r_y, r_z, r_w);
            const vector = q.vmult(new CANNON.Vec3(0, 0, 1));
            const force = 2;
            ballBody.applyForce(new CANNON.Vec3(vector.x * force, vector.y * force, vector.z * force), ballBody.position);
        }
        else {
            inWind = false;
        }
        currentCheck++;
        if (currentCheck === winds.length) {
            currentCheck = 0;
        }
    }
};
exports.sandHandler = (world, gameEvents, gameplay) => {
    const { courseDefinition, ballBody, state } = gameplay;
    const sands = courseDefinition.parts.filter(p => p.type === "sand");
    let currentCheck = 0;
    let inSand = false;
    return {
        update,
        onEvent,
        enable: (value) => { }
    };
    function onEvent(fn) {
        gameEvents.onEvent("SAND", fn);
    }
    function update(dt) {
        if (state.idle || state.finished)
            return;
        const sand = sands[currentCheck];
        if (utils_1.isInsideBox(sand.position, sand.scale, ballBody.position)) {
            if (!inSand) {
                gameEvents.trigger({ type: "SAND", data: {} });
            }
            inSand = true;
            const coefficient = 0.99999;
            const speed = ballBody.velocity.length();
            const dragMagnitude = coefficient * Math.pow(speed, 2);
            const drag = ballBody.velocity.clone();
            drag.scale(-1, drag);
            drag.normalize();
            drag.scale(dragMagnitude, drag);
            const centerInWorldCoords = ballBody.pointToWorldFrame(new CANNON.Vec3());
            ballBody.applyForce(drag, centerInWorldCoords);
            //TODO Review next line? ballBody.angularVelocity = new CANNON.Vec3()
            ballBody.angularVelocity = new CANNON.Vec3();
        }
        else {
            inSand = false;
        }
        currentCheck++;
        if (currentCheck === sands.length) {
            currentCheck = 0;
        }
    }
};
exports.explosiveHandler = (world, gameEvents, gameplay) => {
    const { courseDefinition, ballBody, state } = gameplay;
    const explosives = courseDefinition.parts.filter(p => p.type === "explosive");
    let currentCheck = 0;
    let inWind = false;
    return {
        update,
        onEvent,
        enable: (value) => { }
    };
    function onEvent(fn) {
        gameEvents.onEvent("EXPLOSIVE", fn);
    }
    function update(dt) {
        if (state.idle || state.finished)
            return;
        const wind = explosives[currentCheck];
        if (utils_1.isInsideBox(wind.position, wind.scale, ballBody.position)) {
            if (!inWind) {
                gameEvents.trigger({ type: "EXPLOSIVE", data: {} });
                inWind = true;
                const [r_x, r_y, r_z, r_w] = wind.rotation;
                const q = new CANNON.Quaternion(r_x, r_y, r_z, r_w);
                const vector = q.vmult(new CANNON.Vec3(0, 0, 1));
                const force = 0;
                ballBody.applyImpulse(new CANNON.Vec3(vector.x * force, vector.y * force, vector.z * force), ballBody.position);
            }
        }
        else {
            inWind = false;
        }
        currentCheck++;
        if (currentCheck === explosives.length) {
            currentCheck = 0;
        }
    }
};
