import {getGLTFShape} from "../../services/resource-repo";

type CheckpointOptions = {
    position:Vector3,
    visible:boolean,
    initialState?:any
};
const CheckpointFactory = ({baseResourceUrl})=>{//__COURSE_MODELS_BASE__
    const shape = getGLTFShape(baseResourceUrl + "models/checkpoint_b.gltf");

    const createCheckpoint = (parent, {position, visible}:CheckpointOptions) => {
        const entity = new Entity();
        if(visible){
            entity.setParent(parent);
        }
        entity.addComponent(new Transform({
            scale: new Vector3(0.5,0.5,0.5),
            position
        }));
    
        const animated = new Entity();
        animated.setParent(entity);

        const animator = new Animator();
        const idle = new AnimationState("Armature.001Action");
        idle.play();
        entity.addComponent(animator);
        shape.isPointerBlocker = false;
        animated.addComponent(shape);
    
        return {
            show:()=>{
                entity.setParent(parent);
            },
            hide:()=>{
                entity.setParent(null);
                engine.removeEntity(entity);
            },
            moveTo:(position:Vector3)=>{
                entity.getComponent(Transform).position.copyFrom(position);
            },
            dispose:()=>{
                entity.setParent(null);
                engine.removeEntity(entity);
            }
        };
    };
    return {createCheckpoint};
}


export {
    CheckpointFactory
};
