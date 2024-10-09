export
function createButtonList(parent, { activeIndex = 0, buttonDefinitions = [], buttonShape, position, rotation = Quaternion.Zero()}){
    const entity = new Entity();
    console.log("buttonDefinitions",buttonDefinitions)
    const buttons = buttonDefinitions.map((b,index) => createButton(entity, {
        position:new Vector3(0,-index*0.8,0),
        label:b.label,
        action:b.action,
        disabled:index === activeIndex,
        hoverText:b.hoverText || b.label
    }));
    entity.setParent(parent);
    entity.addComponent(new Transform({position, rotation}));

    function createButton(parent, {disabled, position, label, action, hoverText}){
        const entity = new Entity();
        const labelEntity = new Entity();
        const labelShape = new TextShape(label);

        const handler = new Entity();
        handler.setParent(entity);
        handler.addComponent(new BoxShape());
        handler.addComponent(new Transform({
            scale:new Vector3(2.2,0.8,0.22)
        }));
        const handlerMaterial = new Material();
        handlerMaterial.albedoColor = new Color4(1,0,0,0);
        handler.addComponent(handlerMaterial);

        entity.setParent(parent);
        entity.addComponent(buttonShape);
        entity.addComponent(new Transform({position}));

        if(!disabled){
            handler.addComponent(new OnPointerDown(action, {hoverText}))
        }
        labelEntity.addComponent(new Transform({
            scale:new Vector3(0.5,0.5,0.5)
        }))
        labelEntity.setParent(entity);
        labelEntity.addComponent(labelShape);
        labelShape.color = disabled?Color3.Yellow():Color3.White();
        labelShape.fontSize = 5;
        if(~label.indexOf("<br>") || ~label.indexOf("\n")){
            labelShape.fontSize = 4;
        }
    }
}