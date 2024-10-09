
export function createHandlerFrom (entity, state, callback, options?) {
    const handler = new Entity();
    handler.addComponent(new Transform({
        scale:new Vector3(1,1,0.25),
        position:new Vector3(0,0,0.1)
    }))
    const mat = new Material();
    mat.albedoColor = new Color4(0,1,1,0.4);
    handler.addComponent(mat);
    const shape = new BoxShape();
    handler.addComponent(shape);
    handler.addComponent(new OnPointerDown(()=>{
        console.log("handler click", JSON.stringify(state));
        if(state.loading) return
        callback()
    },options));
    handler.setParent(entity);
    //TODO proxy const sourceShape = entity.getComponent(PlaneShape);

    return {
        enable:(value)=>{
            shape.visible = shape.isPointerBlocker = !!value;
        }
    }
}