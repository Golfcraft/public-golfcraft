import {getTexture} from "../../../../golfplay/services/resource-repo";

export const createScreenIconWithValue = (parent:Entity, {position, src, value}:any) => {
    const entity = new Entity();
    entity.setParent(parent);
    entity.addComponent(new Transform({
        position
    }));
    const icon = new Entity();
    icon.addComponent(new Transform({
        scale:new Vector3(-0.3,-0.3,-1)
    }))
    const plane = new PlaneShape();
    const texture = getTexture(src);
    const material = new Material();
    material.albedoTexture = texture;
    material.emissiveTexture = texture;
    material.alphaTexture = texture;
    material.emissiveIntensity = 3;
    material.emissiveColor = Color3.Yellow();

    icon.addComponent(plane);
    icon.addComponent(material);
    icon.setParent(entity);

    const description = new Entity();
    const text = new TextShape();
    text.value = value;
    text.fontSize = 2;
    text.paddingLeft = 0.3;
    text.paddingTop = 0;
    text.hTextAlign = "left";
    text.vTextAlign = "top";
    text.color = new Color3(1,1,0.7);
    text.font = new Font(Fonts.SanFrancisco_Semibold);
    description.addComponent(new Transform({
        position: new Vector3(0.3,0.125,0)
    }))
    description.addComponent(text);
    description.setParent(entity);

    const show = () => {
        plane.visible = true;
        text.visible = true;
    };
    const hide = () => {
        plane.visible = false;
        text.visible = false;
    };

    return {
        updateValue:(value:number|string)=>{
            text.value = value.toString();
        },
        show,
        hide,
        setIcon:(src)=>{
            material.albedoTexture = getTexture(src);
            material.emissiveTexture = getTexture(src);
            material.alphaTexture = getTexture(src);
        }
    }
};