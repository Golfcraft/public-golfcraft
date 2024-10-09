export const createVisualMagnet = (parent, {position, radius}) => {
    const entity = new Entity();
    const mat = new Material();
    entity.setParent(parent);
    entity.addComponent(new Transform({
        position,
        scale:new Vector3(radius,radius,radius)
    }));

    const center = new Entity();
    center.setParent(entity);
    center.addComponent(new Transform({
        scale:new Vector3(0.1,0.1,0.1)
    }))
    const mat2 = new Material();
    mat2.albedoColor = Color4.Red();
    center.addComponent(mat2);
    center.addComponent(new BoxShape());
    
    mat.albedoColor = new Color4(1,1,1,0.1);
    const sphereShape = new SphereShape();
    sphereShape.withCollisions = false;
    sphereShape.isPointerBlocker = false;
    entity.addComponent(sphereShape);
    entity.addComponent(mat);

    return {
        dispose:()=>{
            entity.setParent(null);
            engine.removeEntity(entity);
        }
    }
}