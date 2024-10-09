import { getGLTFShape } from "../../../services/resource-repo";

const createGolfClub = (parent, {id}) => {
    const baseUrl = (<any>engine)["__COURSE_MODELS_BASE__"]||"";
    const entity = new Entity();
    const animator = new Animator();
    const model = getGLTFShape(`${baseUrl}models/golfClub${id}.glb`);//TODO review to use shape repo service
    const transform = new Transform({
        rotation:Quaternion.Euler(0,180,0)
    });
    const idle = new AnimationState("idle");
    const shoot1 = new AnimationState("shoot1");
    shoot1.stop();
    idle.play();
    animator.addClip(idle);
    animator.addClip(shoot1);

    entity.setParent(parent);

    entity.addComponent(animator);
    entity.addComponent(model);
    entity.addComponent(transform);
    return {
        setPosition:(position:Vector3) => {
            transform.position.copyFrom(position);
        },
        hide:()=>{
            entity.setParent(null);
            engine.removeEntity(entity);
        },
        show:()=>{
            entity.setParent(parent);
        },
        reproduceAnimation:(name)=>{
            animator.stop();
            idle.stop();
            shoot1.stop();
            if(name === "idle"){
                idle.looping = true;
                idle.play();
            }else if(name === "shoot1"){
                shoot1.looping = false;
                shoot1.play();
            }
        },
        dispose:()=>{
            entity.setParent(null);
            engine.removeEntity(entity);
        }
    }
}

export {
    createGolfClub
}
