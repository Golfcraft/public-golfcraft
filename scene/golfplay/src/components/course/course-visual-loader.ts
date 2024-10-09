import { createVisualPart } from "./visual-part";
import { createVisualHole } from "./visual-hole";
import {createVisualMagnet} from "./visual-magnet";
import {createVisualExplosiveHandler} from "./visual-explosive-handler";
import {gfl, sleep} from "../../../../../common/utils";

const createVisualCourse = (parent:Entity, {courseDefinition}:CourseOptions) => {
    const entity = new Entity();
    entity.setParent(parent);
    let solidParts = courseDefinition.parts
        .map((part: PartOptions) => (
                ["solid", "wind", "magnet", "explosive", "image", "text", "empty"].includes(part.type)
                && part?.expressions?.runtime?.hidden !== "true"
                && part?.expressions?.runtime?.ignored !== "true")
            && createVisualPart(entity, {
                id:part.id,
                position:new Vector3(...part.position),
                rotation:part.rotation
                    ? new Quaternion(...part.rotation)
                    : undefined,
                scale:part.scale
                    ? new Vector3(...part.scale)
                    : undefined,
                subtype:part.subtype,
                type:part.type,
                animation:part.animation,
                runtime:part.expressions?.runtime,
                expressions:part.expressions,
                partDefinition:part
            })).reduce((acc, current)=>{
            acc[current.id] = current;
            return acc;
        },{});
    
    const magnets = courseDefinition.parts.filter(p=>p.type=="magnet");
    magnets.forEach((magnet)=>{
        createVisualMagnet(entity, {
            position:new Vector3(...magnet.position), 
            radius:magnet?.expressions?.physics?.radius || 2
        })
    });

    const hole = courseDefinition.parts.find(p=>p.type === "hole");
    var visualHole;
    if(hole){//TODO createVisualHole, can have animations later
        visualHole = createVisualHole(entity, {hole});
    }

    return {
        dispose:()=>{//TODO REVIEW: leaks
            entity.setParent(null);
            engine.removeEntity(entity);
        },
        applyReactiveValue:(partId, state)=>{
            if(!solidParts[partId]){
                console.log("ERROR missing part", partId, solidParts);
            }
            solidParts[partId] && solidParts[partId].react(state);
        },
        applyAllValues:(state)=>{
            console.log("applyAllValues", state)
           const partIds = courseDefinition.parts.reduce((acc, partDefinition)=>{
               if(partDefinition.expressions?.runtime){
                   acc.push(partDefinition.id)
               }
               return acc;
           },[])
            partIds.forEach((partId)=>solidParts[partId] && solidParts[partId].react(state))
        },
        getParts: ()=>solidParts,
        reproduceHoleAction: ()=>{
            if (visualHole){
                visualHole.reproduceHoleAction();
            }
        },
        reset:async ()=>{//workaround to try to fix decentraland problems when rotation is wrong, textures are missing or parts are non visible
            Object.values(solidParts).forEach(s =>{
                console.log("removing solidPart", s);
                if(s && s?.getEntity){
                    s.getEntity().setParent(null);
                    engine.removeEntity(s.getEntity());
                }
            });

            solidParts = courseDefinition.parts
                .map((part: PartOptions) => (
                        ["solid", "wind", "magnet", "explosive", "image", "text", "empty"].includes(part.type)
                        && part?.expressions?.runtime?.hidden !== "true"
                        && part?.expressions?.runtime?.ignored !== "true")
                    && createVisualPart(entity, {
                        id:part.id,
                        position:new Vector3(...part.position),
                        rotation:part.rotation
                            ? new Quaternion(...part.rotation)
                            : undefined,
                        scale:part.scale
                            ? new Vector3(...part.scale)
                            : undefined,
                        subtype:part.subtype,
                        type:part.type,
                        animation:part.animation,
                        runtime:part.expressions?.runtime,
                        expressions:part.expressions,
                        partDefinition:part
                    })).reduce((acc, current)=>{
                    acc[current.id] = current;
                    return acc;
                },{});
            entity.setParent(null);
            await sleep(100);
            entity.setParent(parent);
        }
    }
};


export {
    createVisualCourse
};

type PartOptions = {
    id: string,
    position: Array<number>,
    rotation: Array<number>,
    scale: Array<number>,
    animation:any,
    [key:string]:any
}

type CourseOptions = {
    /* spawn: {
        ball: Array<number>,
        player: Array<number>,
        camera: Array<number>
    }, */
    courseDefinition:{
        parts: Array<PartOptions>,
        [key:string]:any
    },
    [key:string]:any
}
