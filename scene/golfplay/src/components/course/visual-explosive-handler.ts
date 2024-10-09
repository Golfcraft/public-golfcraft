export const createVisualExplosiveHandler = (parent, {position, scale}) => {
    const entity = new Entity();
    const mat = new Material();

    entity.setParent(parent);
    entity.addComponent(new Transform({
        position,
        scale:new Vector3(scale.x,scale.x,scale.x)
    }));

    const center = new Entity();
    center.setParent(entity);
    center.addComponent(new Transform({
        scale:new Vector3(0.1,0.1,0.1)
    }))
    
    mat.albedoColor = new Color4(1,1,1,0.3);
    const sphereShape = new BoxShape();
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
};