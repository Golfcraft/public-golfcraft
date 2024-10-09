import {getTexture} from "../../golfplay/services/resource-repo";

const TRANSPARENT_COLOR = new Color4(0,0,0,0);

const createImageButton = (parent, {emissiveColor =  new Color3(1,1,0),position, rotation, scale, imageSrc, alphaSrc = undefined, hoverText, withEmissive = true, uvs = undefined, emissiveIntensity = 3, hasAlpha = false}) => {
    const callbacks = {
        onClick:null
    }
    const state = { //TODO quite logic, review to refactor creating store and state->view function on changes
        visible:true, 
        enabled:true
    };
    const entity = new Entity();
    entity.setParent(parent);

    const material = new Material();

    if(imageSrc){
        material.albedoTexture = getTexture(imageSrc, {hasAlpha});
        material.alphaTexture = alphaSrc && getTexture(alphaSrc) || undefined;
    }else{

        material.albedoColor = TRANSPARENT_COLOR;
    }

    if(withEmissive){
        material.emissiveIntensity = emissiveIntensity;
        material.emissiveColor = emissiveColor;
        material.emissiveTexture = getTexture(imageSrc);
    }

    const shape = new PlaneShape();
        entity.addComponent(shape);
        entity.addComponent(material);
        entity.addComponent(new Transform({ position, rotation, scale }));
        entity.addComponent(new  OnPointerDown(()=>{
            if(!state.enabled) return;
            callbacks.onClick && callbacks.onClick();
        },{hoverText}));
    if(uvs) shape.uvs = uvs;
    const show = () => {
        //TODO only if parent is not containing the entity already
        entity.setParent(parent);
    };
    const hide = () => {
        entity.setParent(null);
        engine.removeEntity(entity);
    };
    const onClick = (fn) => {
        callbacks.onClick = fn;
        return () => callbacks.onClick = null;
    };
    const disable = () => {
        state.enabled = false;
    };
    const enable = () => {
        state.enabled = true;
    };
    const dispose = () => {
        entity.setParent(null);
        engine.removeEntity(entity);
        callbacks.onClick = null;
    }

    return {
        show,
        hide,
        enable,
        disable,
        dispose,
        onClick,
        setTexture:(src)=>material.albedoTexture = material.alphaTexture = getTexture(src),
        setPosition:(x,y,z)=>entity.getComponent(Transform).position.set(x,y,z),
        setEmissive:(enabled)=>{
            if(enabled){
                material.emissiveIntensity = 3;
                material.emissiveColor = emissiveColor;
            }else{
                material.emissiveIntensity = 0;
                material.emissiveColor = Color3.Black();
                material.alphaTexture = undefined;
            }
        },
        getShape:()=>shape
    }
};

export {
    createImageButton
}