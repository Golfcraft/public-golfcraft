const createVisualHole = (parent, {hole}) => {
    const baseUrl:string = (<any>engine)["__COURSE_MODELS_BASE__"]||"";

    const entity = new Entity();
    const shape = new BoxShape();
    const material = new Material();
    
    material.emissiveColor = Color3.Purple();
    material.emissiveIntensity = 10;
    
    const [x,y,z] = hole.position;
    const transform = new Transform({
        position: new Vector3(x,y+5,z),
        scale:new Vector3(0.01,10,0.01)
    });
    entity.addComponent(material)
    entity.addComponent(shape);
    entity.addComponent(transform);
    entity.setParent(parent);

    const entity_gltf = new Entity();
    const shape_gltf = new GLTFShape(`${baseUrl}models/hole_indicator.gltf`);
    const transform_gltf = new Transform({
        position: new Vector3(x,y,z)
    });
    entity_gltf.addComponent(shape_gltf);
    entity_gltf.addComponent(transform_gltf);
    entity_gltf.setParent(parent);


   /* const holeLoopClip = new AudioClip(baseUrl+"sounds/lvl_hole.mp3");
    const holeLoopSound = new AudioSource(holeLoopClip);
    entity.addComponent(holeLoopSound);
    holeLoopSound.loop = true;
    holeLoopSound.playing = true;*/


    const win_entity = new Entity();
    win_entity.addComponent(new GLTFShape(`${baseUrl}models/hole_win_basic.gltf`));
    win_entity.addComponent(new Transform({
        position: transform.position.add(new Vector3(0, -4.45, 0))
    }))
    win_entity.setParent(parent);
    const ownAnimator = new Animator();
    win_entity.addComponent(ownAnimator);
    ownAnimator.addClip(new AnimationState("Animation"));
    ownAnimator.getClip("Animation").looping = false;
    ownAnimator.getClip("Animation").stop();
    win_entity.getComponent(GLTFShape).visible = false;

    return {
        reproduceHoleAction: ()=>{
            win_entity.getComponent(GLTFShape).visible = true;
            ownAnimator.getClip("Animation").play(true);
        }
    }
};

export {
    createVisualHole
}