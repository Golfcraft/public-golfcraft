import { BALL_ANGULAR_DAMPING, BALL_FRICTION, BALL_LINEAR_DAMPING, BALL_MASS } from "../../../common/physics-config";
import { getMaterials } from "./world";

const createPhysicBall = (world:any, {id, position, onlyKinematic}:{id?, position:number[], onlyKinematic?:boolean}) => {
    const {ballPhysicsMaterial} = getMaterials();
    const callbacks = {
        onCollide:null
    };
    const _id = id;
    const body = new CANNON.Body({
        mass:onlyKinematic?0:BALL_MASS,
        position:new CANNON.Vec3(...position),
        shape: new CANNON.Sphere(0.1),
        type:onlyKinematic?CANNON.Body.KINEMATIC:undefined,
    });
    body.material = ballPhysicsMaterial;//TODO REVIEW: ball physics linearDamping, angularDamping, etc.
    body.material.friction = BALL_FRICTION;    
    body.linearDamping = BALL_LINEAR_DAMPING; //TODO // Round will keep translating even with friction so you need linearDamping
    body.angularDamping = BALL_ANGULAR_DAMPING; // Round bodies will keep rotating even with friction so you need angularDamping
    body.updateMassProperties();
    body.addEventListener("collide", collide);
    body.collisionFilterGroup = 2;
    body.collisionFilterMask = 1;

    world.addBody(body);

    function collide(e) {
        callbacks.onCollide && callbacks.onCollide(e);
    }

    //TODO dispose? const dispose = () => { world.removeBody(body); }
    return {
        id,
        getId:()=>_id,
        body,
        applyImpulse:(impulse, point)=>{
            body.applyImpulse(impulse, point)
        },
        sleep:()=>{
            body.sleep();

        },
        wakeUp:()=>body.wakeUp(),
        dispose:()=>{
            body.removeEventListener("collide", collide);
            callbacks.onCollide = null;
        },
        onCollide:(fn)=>{
            callbacks.onCollide = fn;

            return () => callbacks.onCollide = null;
        }
    };
}

export {
    createPhysicBall
};