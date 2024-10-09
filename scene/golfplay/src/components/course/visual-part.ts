import ExpressionStorage from "../../../../../lib/expression-storage/_expression-storage";
import {getTexture, getAudioClip, getGLTFShape} from "../../../services/resource-repo";
const {getVariablesFromExpression, evaluateExpression} = ExpressionStorage;
import {defaultEmissive} from "../../emissive-image";
type PartID = "part1"|"part2"|"cylinder1d"|"corner1"|"L1"|"end1";

export type PartOptions = {
    id:PartID|string,
    position:Vector3,
    rotation?:Quaternion|undefined,
    scale?:Vector3|undefined,
    type:string,
    subtype:string,
    animation:any,
    runtime:{
        storage?:string,
        read?:string,
    },
    expressions:any,
    partDefinition:any
};
const ShapeTypeMap = {
    "image":PlaneShape,
    "text":TextShape
}

const ANIMATION = {
    IDLE:"0. Idle",
    ACTION:"1. Explosion"
}
@Component("MovingPartComponent")
export class MovingPartComponent {

}

const reactiveSwitch = (entity,partDefinition) => {
    console.log("reactiveSwitch",partDefinition)
    let animator = new Animator()
    entity.addComponent(animator);
    const animations = {
        "0. switch_false":"0. switch_false",
        "1. switch_true":"1. switch_true"
    };

    const animationStates = {}

    const baseUrl:string = (<any>engine)["__COURSE_MODELS_BASE__"]||"";
    const switchOffClip = new AudioClip(baseUrl+"sounds/lvl_switch_off.mp3");
    const switchOffSound = new AudioSource(switchOffClip);
    const switchOnClip = new AudioClip(baseUrl+"sounds/lvl_switch_off.mp3");
    const switchOnSound = new AudioSource(switchOnClip);

    let soundEntity = new Entity();
    soundEntity.setParent(entity);

    Object.keys(animations).forEach(valueKey => {
        animationStates[valueKey] = new AnimationState(animations[valueKey], {looping:false})
        animator.addClip(animationStates[valueKey]);
        animationStates[valueKey].stop();
    });

    Object.values(animationStates).forEach((clip)=>clip.stop());
    animationStates["0. switch_false"].play();

    return (state) => {
        const value = !!state[partDefinition.expressions.runtime.storage];
        console.log("interactive-control react", partDefinition.id, partDefinition.expressions?.storage, value)
        Object.values(animationStates).forEach((clip)=>clip.stop());

        const animationName = value ? "1. switch_true":"0. switch_false";
        console.log("playing animation", animationName);
        animationStates[animationName].play();

        var currentSound = value ? switchOnSound : switchOffSound;
        soundEntity.addComponentOrReplace(currentSound);
        currentSound.playOnce();
    }
}
@Component("TextPart")
export class TextPart {}
@Component("ImagePart")
export class ImagePart {}


const createVisualPart = (parent:Entity, {id, animation, type, subtype, position, rotation = Quaternion.Zero(), scale = Vector3.One(), partDefinition, expressions}:PartOptions)=>{//TODO refactor params to just partDefinition
    const baseUrl:string = (<any>engine)["__COURSE_MODELS_BASE__"]||"";
    const entity = new Entity(id);
    console.log("createVisualPart", subtype,`${baseUrl}models/${subtype || type}.gltf`);
    if(animation){
        entity.addComponent(new MovingPartComponent());
    }


    const shape = (!ShapeTypeMap[type])
        ? getGLTFShape(`${baseUrl}models/${subtype || type}.gltf`)
        : new ShapeTypeMap[type]();//TODO review to use shape repo

    if(type === "image") {
        //TODO image should have a wrapper entity to add size
        shape.withCollisions = false;
        const material = new Material();
        const imagePart = new Entity();
        imagePart.addComponent(shape);
        const texture = getTexture(`${expressions?.image?.url}`);
        material.albedoTexture = texture;
        material.emissiveTexture = texture;
        Object.assign(material, defaultEmissive);
        const imageWidth = expressions?.image?.width !== undefined ? expressions?.image?.width : 4;
        const imageHeight = expressions?.image?.height !== undefined ? expressions?.image?.height : 3;
        imagePart.addComponent(new Transform({scale: new Vector3(-imageWidth, -imageHeight, -1)}))
        imagePart.addComponent(material);
        imagePart.addComponent(texture);
        imagePart.setParent(entity);
    }else if(type === "text"){
        const textPart = new Entity();
        textPart.addComponent(shape);
        shape.value = expressions?.text?.value || "";
        textPart.setParent(entity);
    }else{
        entity.addComponent(shape);
    }
    const listeningVariables = [];//TODO string could be low performance, maybe we will need an object model for variables
    entity.addComponent(new Transform({
        position,
        rotation,
        scale
    }));
    entity.setParent(parent);

    if(partDefinition.expressions?.runtime?.ignored || partDefinition.expressions?.runtime?.hidden){
        decorateVariableCollectionFromExpression(partDefinition.expressions.runtime.ignored || partDefinition.expressions.runtime.hidden);
    }
    const specificReactives = []
    if(~subtype.indexOf("control_switch")){
        specificReactives.push(reactiveSwitch(entity, partDefinition));
    }
    const ownAnimator = new Animator();
    if(partDefinition.type ==="explosive" || partDefinition.subtype === "explosive_mine"){
        entity.addComponent(ownAnimator);
        ownAnimator.addClip(new AnimationState(ANIMATION.IDLE));
        ownAnimator.addClip(new AnimationState(ANIMATION.ACTION));
        ownAnimator.getClip(ANIMATION.IDLE).looping = true;
        ownAnimator.getClip(ANIMATION.IDLE).play();
        ownAnimator.getClip(ANIMATION.ACTION).stop();

        const audio = getAudioClip(`${baseUrl}sounds/lvl_mine_explode.mp3`);
        entity.addComponent(new AudioSource(audio));
    }

    const reactive = (state)=>{
        if(Array.from(Object.keys(state)).some(p=>listeningVariables.indexOf(p) !== -1)){
            const hiddenEvaluation = evaluateExpression(partDefinition.expressions.runtime.ignored || partDefinition.expressions.runtime.hidden, state);
            if(hiddenEvaluation){
                entity.setParent(null);
                engine.removeEntity(entity);
            }else{
                entity.setParent(parent);
            }
        }

        specificReactives.forEach(r=>r(state));
    }
    return {
        id,
        react:reactive,
        reproduceAction:(id)=>{
            ownAnimator.getClip(ANIMATION.IDLE).stop();
            ownAnimator.getClip(ANIMATION.ACTION).looping = false;
            ownAnimator.getClip(ANIMATION.ACTION).play(true);
            entity.getComponentOrNull(AudioSource)?.playOnce();
            setTimeout(()=>{//TODO check time
                entity.setParent(null);
                engine.removeEntity(entity);
            },1000)
        },
        hide:()=>{

        },
        getEntity:()=>entity
    };

    function decorateVariableCollectionFromExpression(expression){
        if(!expression) return;
        const variableNames = getVariablesFromExpression(expression)||[];
        variableNames.forEach(variableName => {
            if(listeningVariables.indexOf(variableName) === -1){
                listeningVariables.push(variableName);
            }
        });
    }
};

export {
    createVisualPart
};
