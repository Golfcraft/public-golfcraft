import {getGLTFShape} from "../../golfplay/services/resource-repo";

const createBoard = (parent, {position, rotation}) => {
    const entity = new Entity();
    entity.addComponent(getGLTFShape(`models/board.glb`));
    entity.addComponent(new Transform({position, rotation}));
    return entity;
};

export {
    createBoard
};