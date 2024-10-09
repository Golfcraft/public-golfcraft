import {getTexture} from "../../../../golfplay/services/resource-repo";
import {defaultEmissive} from "../../../../golfplay/src/emissive-image";

export const createNinjaMenu = (parent, {rotation = Quaternion.Zero(), position}) => {
    const entity = new Entity();
    const callbacks = {
        onPlay:null
    };
    const state = {
        enabled:true
    };

    entity.setParent(parent);
    entity.addComponent(new Transform({
        position,
        rotation,
        scale:new Vector3(-4,-3,-1)
    }));

    const shape = new PlaneShape();
    const material = new Material();
    material.albedoTexture = getTexture(`images/ninja-panel.png`);
    material.emissiveTexture = getTexture(`images/ninja-panel.png`);
    Object.assign(material, defaultEmissive);
    entity.addComponent(shape);
    entity.addComponent(material);

    entity.addComponent(new OnPointerDown(()=>{
        if(!state.enabled) return;
        callbacks.onPlay && callbacks.onPlay();
    },{
        hoverText:"Play"
    }));

    return {
        hide:()=>{
            entity.setParent(null);
            engine.removeEntity(entity);
        },
        show:()=>{
            entity.setParent(parent);
        },
        enable:(value) => state.enabled = value,
        onPlay:(fn)=>{
            callbacks.onPlay = fn;
        }
    }
}