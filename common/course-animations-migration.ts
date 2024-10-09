import {deepFreeze, getRandom, pipe} from "./utils";

export function migrateCourseDefinitionAnimations(courseDefinition, transformers = []){
    const functions = [
        withFramesAsMsCourse, 
        withAnimationFramesCourse,
        withCompactCurvesCourse,        
        withCourseAnimationKinematics,
        withIdsAsString,
/*        deepFreeze,*/
        ...transformers
    ];
    return pipe(
      ...functions 
    )(courseDefinition);
}

export function withNoiseOnStartPosition (_courseDefinition){
    let courseDefinition;
    try{
        courseDefinition = JSON.parse(JSON.stringify(_courseDefinition));
    }catch(err){
        console.log("error parsing", err, _courseDefinition)
    }
    const initialPositionDefinition = courseDefinition.parts.find(p=>p.type === "initial_position");
    const noiseAmount = 2;
    const noiseX = getRandom(-noiseAmount/2,noiseAmount/2);
    const noiseZ = getRandom(-noiseAmount/2,noiseAmount/2);
    initialPositionDefinition.position[0] += noiseX;
    initialPositionDefinition.position[2] += noiseZ;

    return courseDefinition;
}

export function withFramesAsMsCourse (_courseDefinition, frameSeconds = 1/24) {
    let courseDefinition;
    try{
        courseDefinition = JSON.parse(JSON.stringify(_courseDefinition));
    }catch(err){
        console.log("error parsing", err, _courseDefinition)
    }
    
    courseDefinition.parts = courseDefinition.parts.map(part=>{
        if(part.animation){
            Object.values(part.animation||{}).forEach((animatedVector)=>{
                    Object.keys(animatedVector).forEach(curveKey=>{
                        animatedVector[curveKey] = animatedVector[curveKey].map(([frame, value]) => {
                            return [(frame-1)*frameSeconds, value];
                        })
                    });
            })
        }
        
        return part;
    });
    return courseDefinition;
}

type PropertyCurveFrame = Array<2>;
type PropertyAnimation = PropertyCurveFrame[];
type TransformAnimation = {x:PropertyAnimation, y:PropertyAnimation, z:PropertyAnimation, w?:PropertyAnimation};

function withCompactCurves(transform:TransformAnimation){
    const length = Object.values(transform)[0].length;
    const result = new Array(length).fill(null).map(i=>({}));

    Object.keys(transform).forEach((propertyName)=>{
        transform[propertyName].forEach((frame, index)=>{
            result[index][propertyName] = frame[1];
        });
    });
    
    return result;
}

function withCompactCurvesCourse(_courseDefinition){
    const courseDefinition = JSON.parse(JSON.stringify(_courseDefinition));
    courseDefinition.parts.forEach((part)=>{
        const animation = part.animation;
        if(animation){
            Object.keys(animation).forEach((transformName)=>{
                animation[transformName] = withCompactCurves(animation[transformName])
            });
        }
    });
    
    return courseDefinition;
}

export function withAnimationFramesCourse(_courseDefinition){
    const courseDefinition = JSON.parse(JSON.stringify(_courseDefinition));
    courseDefinition.parts = courseDefinition.parts.map((part)=>{
        if(part.animation){
            part.animationFrameTimes = (<any>Object.values(part.animation)[0]).x.map(i=>i[0]);
            part.animationTransitions = [];
            var i = 0;
            while(i < part.animationFrameTimes.length-1){
                part.animationTransitions.push({
                    startTime:part.animationFrameTimes[i],
                    targetTime:part.animationFrameTimes[i+1],
                    duration:part.animationFrameTimes[i+1]-part.animationFrameTimes[i]
                });
                i++;
            }
            part.partAnimationTotalTime = part.animationFrameTimes[part.animationFrameTimes.length-1]
        }
        
        return part;
    });
    return courseDefinition;
}

function withCourseAnimationKinematics(_courseDefinition){
    const courseDefinition = JSON.parse(JSON.stringify(_courseDefinition));
    courseDefinition.parts = courseDefinition.parts.map((part)=>{
        if(part.animation){
            part.animation.kinematics = getKinematicAnimation(part, part.animationFrameTimes)
        }
        return part;
    });
    return courseDefinition;
}

function getKinematicAnimation(compactedAnimationPart, frames){
    const kinematics = {};
    return frames.map((_,index)=>{
        return {
            position:compactedAnimationPart.animation.location 
                ? compactedAnimationPart.animation.location[index] 
                : getObjectVector(compactedAnimationPart.position),
            quaternion:compactedAnimationPart.animation.rotation_quaternion
                ? compactedAnimationPart.animation.rotation_quaternion[index]
                : getObjectVector(compactedAnimationPart.rotation),
            velocity:compactedAnimationPart.animation.location
                ? getVelocityVector3([
                    compactedAnimationPart.animation.location[index],
                    (index === (frames.length-1))
                        ? getAllPropertiesWithZero(compactedAnimationPart.animation.location[index])
                        : compactedAnimationPart.animation.location[getNextIndex(index, compactedAnimationPart.animation.location)]
                    ],[
                        frames[index], frames[getNextIndex(index, frames)]
                    ])  
                : {x:0,y:0,z:0},
            angularVelocity:compactedAnimationPart.animation.rotation_quaternion
                ? getAngularVelocity(
                    compactedAnimationPart.animation.rotation_quaternion[index],
                    (index === (frames.length-1))
                        ? getAllPropertiesWithZero(compactedAnimationPart.animation.rotation_quaternion[index])
                        : compactedAnimationPart.animation.rotation_quaternion[getNextIndex(index, compactedAnimationPart.animation.rotation_quaternion)]
                    ,
                        frames[getNextIndex(index, frames)]-frames[index]
                    )  
                : {x:0,y:0,z:0}        
        }
    });
}
function getAllPropertiesWithZero(obj){
    return Object.keys(obj).reduce((acc, key)=>{
        acc[key] = 0;
        return acc;
    },{})
}
function getVelocityVector3(vectors, frameTimes){
    const result = {};
    const [v1, v2] = vectors;
    const [t1, t2] = frameTimes;
    Object.keys(v1).forEach((propertyName/*x,y,z,w*/)=>{
        result[propertyName] = getVelocity(v1[propertyName],v2[propertyName], t2 - t1);
    });
    return result;
}

function getVelocity(a, b, seconds){    
    return (b - a)/seconds;
}

function getNextIndex(current, arr){
    if((current+1) === arr.length) return 0;
    return current + 1;
}

function getObjectVector(vectorArray){
    const [x, y, z, w] = vectorArray;
    const result = {x,y,z};
    if(w !== undefined) (<any>result).w = w;
    return result;
}

export function withIdsAsString(_courseDefinition){
    const courseDefinition = JSON.parse(JSON.stringify(_courseDefinition));
    courseDefinition.parts = courseDefinition.parts.map(part => ({...part, id:part.id.toString()}));
    return courseDefinition;
}

function getAngularVelocity(q1, q2, seconds){
    const [pitch1, roll1, yaw1] = toEulerianAngle(q1);
    const [pitch2, roll2, yaw2] = toEulerianAngle(q2);
    const pitchRate = (pitch2-pitch1)/seconds;
    const rollRate = (roll2-roll1)/seconds;
    const yawRate = (yaw2-yaw1)/seconds;
    const x = (rollRate + 0 - yawRate * Math.sin(pitch2));
    const y = (0 + pitchRate * Math.cos(roll2) + yawRate * Math.sin(roll2) * Math.cos(pitch2));
    const z = (0 - pitchRate * Math.sin(roll2) + yawRate * Math.cos(roll2) * Math.cos(pitch2));
    
    return {x:y,y:x,z:z};
}

function toEulerianAngle(_q){
    const q = JSON.parse(JSON.stringify(_q));
    q.y = _q.x;    
    q.x = _q.y;
    q.z = _q.z;
    const ysqr = q.y * q.y;
    const t0 = 2 * (q.w * q.x + q.y * q.z);
    const t1 = 1 - 2 * (q.x *q.x + ysqr);
    const roll = Math.atan2(t0, t1);

    let t2 = 2*(q.w * q.y - q.z*q.x);
    t2 = (t2>1)?1:t2;
    t2 = (t2<-1)?1:t2;
    let pitch = Math.asin(t2);
    let t3 = 2*(q.w*q.z+q.x*q.y);
    let t4 = 1 - 2*(ysqr + q.z * q.z);
    let yaw = Math.atan2(t3,t4);
    return [pitch, roll, yaw];
}