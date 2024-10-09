import { Schema, ArraySchema, MapSchema, type } from "@colyseus/schema";
import {serializeRecipe, defaultChestRewardChances} from "../../common/utils";
import weightedRandom from "../../pet-store-service/weightedRandom";

class Vector3 extends Schema {
    @type('float32')
    x = 0;
    @type('float32')
    y = 0;
    @type('float32')
    z = 0;

    constructor(x:number, y:number, z:number){
        super();
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
class Quaternion extends Schema {
    @type('float32')
    x = 0;
    @type('float32')
    y = 0;
    @type('float32')
    z = 0;
    @type('float32')
    w = 0;
    constructor(x:number, y:number, z:number, w:number){
        super();
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}

class Event extends Schema {
    @type('uint8')
    type;

    @type(Vector3)
    position = new Vector3(0,0,0);

    constructor({position}){
        super();
        this.position = position;
    }
}

class BallFrameSchema extends Schema {
    @type("uint16") //TODO review max number of users entering a room
    id:number;

    @type(Vector3)
    position:Vector3;

    @type(Quaternion)
    quaternion:Quaternion;

    constructor(frameBall) {
        super();
        this.id = Number(frameBall.id);
        this.position = new Vector3(frameBall.position.x, frameBall.position.y, frameBall.position.z);
        this.quaternion = new Quaternion(frameBall.quaternion.x, frameBall.quaternion.y, frameBall.quaternion.z, frameBall.quaternion.w);
    }
}

class FrameSchema extends Schema {
    @type("uint64")
    t:number;

    @type([BallFrameSchema])
    balls:ArraySchema<BallFrameSchema>

    constructor(frame) {
        super();
        this.t = frame.t;
        this.balls = new ArraySchema<BallFrameSchema>(...frame.balls.map(frameBall => new BallFrameSchema(frameBall)));
    }
}
export class FrameBufferSchema extends Schema {
    @type("uint64")
    t:number;

    @type([FrameSchema])
    frames:ArraySchema<FrameSchema>

    constructor(startTime, frames) {
        super();
        this.t = startTime;
        this.frames = new ArraySchema<FrameSchema>(...frames.map(frame => new FrameSchema(frame)));

    }
}

class Frame extends Schema {
    @type(Vector3)
    position:Vector3;

    @type(Vector3)
    velocity:Vector3;

    @type([Event])
    events:ArraySchema<Event>;
}
export class BallSchema extends Schema {
    @type(Vector3)
    velocity = new Vector3(0,0,0);

    @type(Vector3)
    position = new Vector3(0,0,0);

    //TODO remove angularVelocity & quaternion to optimize networking ?
    @type(Vector3)
    angularVelocity = new Vector3(0,0,0);

    @type(Quaternion)
    quaternion = new Quaternion(0,0,0,1);

    @type("string")
    id;

    @type("string")
    displayName;

    @type("string")
    userId;

    @type("uint16")
    ping;

    sessionId;

    constructor(id, displayName, userId, sessionId){
        super();
        this.id = id.toString();
        this.displayName = displayName;
        this.userId = userId;
        this.sessionId = sessionId;
    }

    updateFromCANNON({ velocity, position, quaternion, angularVelocity }:any){//TODO review if we should avoid calling so many times for performance reasons
        velocity && assignVector(this.velocity, velocity);
        position && assignVector(this.position, position);
        quaternion && assignVector(this.quaternion, quaternion);
        angularVelocity && assignVector(this.angularVelocity, angularVelocity)

        function assignVector(target, source){
            Object.assign(target, source);
            if(source.w !== undefined) target.w = source.w;
            return source
        }
    }
}
export class KinematicSchema extends Schema {
    @type(Vector3)
    velocity = new Vector3(0,0,0);

    @type(Vector3)
    position = new Vector3(0,0,0);

    //TODO remove angularVelocity & quaternion to optimize networking ? 
    @type(Vector3)
    angularVelocity = new Vector3(0,0,0);

    @type(Quaternion)
    quaternion = new Quaternion(0,0,0,1);

    @type("string")
    partId;

    constructor(partId?){
        super();
        if(partId){
            this.partId = partId;
        }
    }

    updateFromCANNON({ velocity, position, quaternion }:any){//TODO review if we should avoid calling so many times for performance reasons
        velocity && assignVector(this.velocity, velocity);
        position && assignVector(this.position, position);
        quaternion && assignVector(this.quaternion, quaternion);

        function assignVector(target, source){
            Object.assign(target, source);
            if(source.w !== undefined) target.w = source.w;
        }
    }
}


function calculatePercentageFromWeight(ChestRewardChances){
    const _ChestRewardChances = JSON.parse(JSON.stringify(ChestRewardChances));
    const totalWeight = Object.values(ChestRewardChances).reduce((acc,current:any)=>acc+current.weight,0) as number;
    Object.values(_ChestRewardChances).forEach((item:any)=>{
        item.p = item.weight/totalWeight * 100;
    });
    return _ChestRewardChances;
}

export class ChestSchema extends Schema {
    @type("number")
    x:number;

    @type("number")
    y:number;

    @type("number")
    z:number;

    @type("string")
    reward:string;

    @type("boolean")
    used:boolean;

    constructor({x,y,z, wearablesAlready, chestRewardChances}) {
        super();
        const _chestRewardChances =  chestRewardChances || defaultChestRewardChances;
        const wearableAdaptedWeight = Math.max(1, _chestRewardChances.find(i=>i.wearable).weight - wearablesAlready*15);
        const _ChestRewardChances = JSON.parse(JSON.stringify(_chestRewardChances));
        _ChestRewardChances.find(i=>i.wearable).weight = wearableAdaptedWeight;
        this.x = x;
        this.y = y;
        this.z = z;
        const rewarded = weightedRandom(_ChestRewardChances, _ChestRewardChances.map(i=>i.weight)).item;
        this.reward = serializeRecipe({...rewarded, weight:undefined});
        this.used = false;
    }
}

class Gameplay extends Schema {
    @type([ChestSchema])
    chests = new ArraySchema<ChestSchema>();

    @type("string")
    chestModel;

    @type("uint64")
    startTime;

    endTime;

    @type("uint8")
    duration;//seconds, max 255

    @type("uint8")
    shoots = 0;

    @type("uint64")
    lastShootTime = 0;

    started;
    finished;
    
    @type(Vector3)
    positionBeforeShoot = new Vector3(0,0,0);

    @type(KinematicSchema)
    ball = new KinematicSchema();

    @type([KinematicSchema])
    movingParts = new ArraySchema<KinematicSchema>();

    @type([Frame])
    shootFrames;

    @type('boolean')
    reproducingShootFrames = false;

    @type("boolean")
    idle = true;
    
    constructor(courseDefinition, addMovingParts = true){
        super();
        console.log("courseDefinition",!!courseDefinition);
        if(addMovingParts){
            const initialPosDef =  courseDefinition.parts.find(p=>p.type === "initial_position")
            const [x,y,z] = initialPosDef.position;
            const [qx,qy,qz,qw] =  initialPosDef.rotation;
            courseDefinition.parts.filter(p=>p.animation).forEach((part)=>{
                const movingPart = new KinematicSchema(part.id);
                const {position, velocity, quaternion} = part.animation.kinematics[0];
                movingPart.updateFromCANNON({
                    velocity:new Vector3(velocity.x,velocity.y,velocity.z),
                    position:new Vector3(position.x,position.y,position.z),
                    quaternion:new Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w)
                });
                this.movingParts.push(movingPart)
            })
            this.ball.updateFromCANNON({
                position:new Vector3(x,y,z),
                quaternion:new Quaternion(qx,qy,qz,qw)
            }); 
        }
    }
}

export {
    Gameplay,
    Quaternion,
    Vector3
}