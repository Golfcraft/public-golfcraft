import { createLinkBoard } from "../link-board";

export const createTitlePanel = (parent, {position, rotation, version}) => {
    const entity = new Entity();

    entity.addComponent(new Transform({
        position, rotation
    }));

    entity.setParent(parent);

    const label = new Entity();
    const text = new TextShape(version);
    text.vTextAlign = text.hTextAlign = "center";
    text.fontSize = 3;
    label.addComponent(text);
    label.addComponent(new Transform({
        position:new Vector3(0,2.5,-0.1)
    }));
    label.setParent(entity);

    createLinkBoard(entity, {
        position:Vector3.Zero(),
        rotation:Quaternion.Zero(),
        links:[],
        imageSrc:`images/title.png`
    });
}