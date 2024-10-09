import {getAudioClip, getGLTFShape} from "../../../golfplay/services/resource-repo";
import {getRandomInt} from "../../../../common/utils";
// TODO fires an exception:
//import {atlasAnalytics} from "../../atlas-analytics-service";



export const createVisualChest = (parent:Entity, {chest, onClick, offsetX = -24, offsetZ = -24, button = ActionButton.PRIMARY, model}:any)=>{
    const entity = new Entity();
    const modelSrc = model || "models/building/event_xmas_gift.glb" // TODO this model does not exists
    const shapes = {[modelSrc]:new GLTFShape(modelSrc)};
    //const shape = shapes[modelSrc];
    //let currentModel = modelSrc;
    if(!model){
        const mockChest = new Entity();
        mockChest.setParent(entity);
        mockChest.addComponent(new BoxShape())
        const material = new Material();
        material.albedoColor = new Color4(0,0,0,0)
        mockChest.addComponent(material);

        mockChest.addComponent(new OnPointerDown((event)=>{
            if (!isActive()) return;
            setInactive();
            callbacks.onClick();
            clipIdle.reset();
            clipIdle.stop();
            clipCatch.reset();
            clipCatch.play(true);
            source.playOnce();
            //atlasAnalytics.submitGenericEvent(`gbc-collect-gift`);
        }, {button, hoverText: "Claim"}))
    }

    entity.addComponent(shapes[modelSrc]);
    const {x,y,z} = chest;
    console.log("chest",chest);
    entity.addComponent(new Transform({
        position:new Vector3(x+offsetX,y,z+offsetZ),
        rotation:Quaternion.Euler(0,getRandomInt(0,359),0)
    }));
    let animator = new Animator()
    entity.addComponent(animator)
    const clipIdle = new AnimationState("0. idle");
    const clipCatch = new AnimationState("1. catch");
    clipIdle.looping = true;
    clipCatch.looping = false;
    animator.addClip(clipCatch);
    animator.addClip(clipIdle);
    clipIdle.playing = true;

    const clip = getAudioClip("sounds/Catch_Coin.mp3")
    const source = new AudioSource(clip);
    entity.addComponent(source);
    source.loop = false;
    source.playing = false;

    entity.addComponent(new OnPointerDown((event)=>{
        if (!isActive()) return;
        setInactive();
        callbacks.onClick();
        clipIdle.reset();
        clipIdle.stop();
        clipCatch.reset();
        clipCatch.play(true);
        source.playOnce();
        //atlasAnalytics.submitGenericEvent(`gbc-collect-gift`);
    }, {button, hoverText: "Claim"}));
    entity.setParent(parent);
    console.log("created chest");
    const callbacks = {
        onClick
    };

    var active = true;
    function setActive() {
        active = true;
        entity.getComponent(OnPointerDown).hoverText = "Claim";
    }
    function setInactive() {
        active = false;
        entity.getComponent(OnPointerDown).hoverText = "Claimed...";
    }
    function isActive() {
        return active;
    }

    function getShape(): GLTFShape {
        return entity.getComponent(GLTFShape)
    }

    return {
        dispose:()=>{
            try {
                callbacks.onClick = null;
                entity.setParent(null);
                engine.removeEntity(entity);
            }catch(error){  }
        },
        hide:()=>{
            setInactive();
            getShape().visible = false;
            getShape().withCollisions = false;
        },
        show:(model=null, currency=null)=>{
            console.log("createVisualChest show", model)
            if(model){
                shapes[model] = shapes[model] || new GLTFShape(model);
                entity.removeComponent(GLTFShape)
                setTimeout(()=>{
                    entity.addComponentOrReplace(shapes[model]);
                    entity.addComponentOrReplace(animator);
                    setActive();
                    getShape().visible = true;
                    clipCatch.stop();
                    clipIdle.play(true);
                    getShape().withCollisions = true;
                },400);
            } else {
                setActive();
                getShape().visible = true;
                clipCatch.stop();
                clipIdle.play(true);
                getShape().withCollisions = true;
            }
        }
    }
}
