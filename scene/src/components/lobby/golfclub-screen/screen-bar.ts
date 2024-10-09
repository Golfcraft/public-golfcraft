export const createScreenBar = (parent:Entity, {position, scale, value}:{position:Vector3, scale:Vector3, value:number})=>{
    const entity = new Entity();
    entity.setParent(parent);
    entity.addComponent(new Transform({
        position,
        scale:scale || new Vector3(1,1,1)
    }));

    const back = new Entity();
    const backShape = new PlaneShape();
    const backTexture = new Texture(`images/golfclub-level-bar.png`);
    const backMaterial = new Material();
    backMaterial.albedoTexture = backTexture;
    backMaterial.alphaTexture = backTexture;
    backMaterial.emissiveTexture = backTexture;
    backMaterial.emissiveIntensity = 3;
    backMaterial.emissiveColor = Color3.Yellow();
    back.addComponent(backShape);
    back.addComponent(backMaterial);
    back.addComponent(new Transform({
        position:new Vector3(0.5,0,0)
    }))
    back.setParent(entity);

    const barEntity = new Entity();
    barEntity.addComponent(new Transform({
        position:new Vector3(value/2,0,0),
        scale:new Vector3(value,1,1)
    }));
    const barShape = new PlaneShape();
    barEntity.addComponent(barShape);
    barEntity.setParent(entity);

    const progress = new Entity();
    const progressText = new TextShape();
    progressText.value = `${(value*100).toFixed(2)}%`;
    progressText.fontSize = 1;
    progress.setParent(parent);
    progress.addComponent(new Transform({
        position:position.add(new Vector3(1.7,0.13,0))
    }))
    progress.addComponent(progressText)
    return {
        setValue:(value:number)=>{
            progressText.value = `${(value*100).toFixed(2)}%`;
            barEntity.getComponent(Transform).position.set(value/2, 0,0);
            barEntity.getComponent(Transform).scale.set(value, 1, 1);
        }
    }

};
