"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPhysicBall = void 0;
const physics_config_1 = require("../../../common/physics-config");
const world_1 = require("./world");
const createPhysicBall = (world, { position, onlyKinematic }) => {
    const { ballPhysicsMaterial } = world_1.getMaterials();
    const callbacks = {
        onCollide: null
    };
    const body = new CANNON.Body({
        mass: onlyKinematic ? 0 : physics_config_1.BALL_MASS,
        position: new CANNON.Vec3(...position),
        shape: new CANNON.Sphere(0.1),
        type: onlyKinematic ? CANNON.Body.KINEMATIC : undefined,
    });
    body.material = ballPhysicsMaterial; //TODO REVIEW: ball physics linearDamping, angularDamping, etc.
    body.material.friction = physics_config_1.BALL_FRICTION;
    body.linearDamping = physics_config_1.BALL_LINEAR_DAMPING; //TODO // Round will keep translating even with friction so you need linearDamping
    body.angularDamping = physics_config_1.BALL_ANGULAR_DAMPING; // Round bodies will keep rotating even with friction so you need angularDamping
    body.updateMassProperties();
    body.addEventListener("collide", collide);
    world.addBody(body);
    function collide(e) {
        callbacks.onCollide && callbacks.onCollide(e);
    }
    //TODO dispose? const dispose = () => { world.removeBody(body); }
    return {
        body,
        applyImpulse: (impulse, point) => {
            body.applyImpulse(impulse, point);
        },
        sleep: () => body.sleep(),
        wakeUp: () => body.wakeUp(),
        dispose: () => {
            body.removeEventListener("collide", collide);
            callbacks.onCollide = null;
        },
        onCollide: (fn) => {
            callbacks.onCollide = fn;
            return () => callbacks.onCollide = null;
        }
    };
};
exports.createPhysicBall = createPhysicBall;
