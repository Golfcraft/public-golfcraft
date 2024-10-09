
type VisualZoneOptions = {
    position:Vector3,
    scale:Vector3
};

const VisualZoneFactory = ({baseResourceUrl}) => {//__COURSE_MODELS_BASE__
    const shape = new GLTFShape(baseResourceUrl + "models/zone.gltf");

    const createVisualZone = (parent, {position, scale}:VisualZoneOptions) => {
        const entity = new Entity();
        entity.setParent(parent);
        shape.isPointerBlocker = false;
        entity.addComponent(shape);
        entity.addComponent(new Transform({
            scale,
            position
        }));
    
        return {
            show:()=>{
                shape.visible = true;//TODO if not so efficient visually, use opacity or position?
            },
            hide:()=>{
                shape.visible = false;
            },
            moveTo:(position:Vector3)=>{
                entity.getComponent(Transform).position.copyFrom(position);
            },
            dispose:()=>{
                entity.setParent(null);
                engine.removeEntity(entity);
            }
        };
    }
    return {createVisualZone}
}


export {
    VisualZoneFactory
};
