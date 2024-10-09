import {createLobby} from "./lobby"; 

const root = new Entity();

root.addComponent(new Transform({
    position:new Vector3(24,0,32)
}));
engine.addEntity(root);
const lobby = createLobby(root);   
