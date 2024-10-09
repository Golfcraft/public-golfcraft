import {getTimeColorHex, getColorNameFromDate} from "@ohmyverse/time-color";
import {createMultiplayerDemoScreen} from "../multiplayer-demo/multiplayer-demo-controller";

export const createLobbyMisc = (parent, {lobbyRoom, root, onStartGame, colyseus})=>{
    const entity = new Entity();
    entity.setParent(parent)
    createUTCColorClock(entity, {
        position:new Vector3(25-24,26,27-24),
        rotation:Quaternion.Euler(0,180,0)
    });

    const demoScreen = createMultiplayerDemoScreen(entity, {
        position:new Vector3(42-24,0.5,42-24),
        rotation:Quaternion.Euler(0,0,0),
        lobbyRoom,
        colyseus,
        root
    });
    demoScreen.hide();

    demoScreen.onStartGame(()=>{
        onStartGame();
    });

    return {
        hide:()=>{
            entity.setParent(null);
            engine.removeEntity(entity);
            demoScreen.hide();
        },
        show:()=>{
            entity.setParent(parent)
            demoScreen.show();
        }
    }
}

function createUTCColorClock (parent, {position, rotation}){
    const textEntity = new Entity();
    const textShape = new TextShape();
    textEntity.setParent(parent);
    textEntity.addComponent(new Transform({
        position,
        rotation
    }));
    textEntity.addComponent(textShape);
    textShape.fontSize = 3;

    refresh();
    const handler = new Entity();
    handler.addComponent(new BoxShape());
    handler.setParent(textEntity);
    const material = new Material();
    material.albedoColor = new Color4(0,0,0,0);
    handler.addComponent(new Transform({
        scale:new Vector3(2,1,1)
    }))
    handler.addComponent(material);
    handler.addComponent(new OnPointerDown(()=>{
        openExternalURL("https://twitter.com/helpimstreaming/status/1593234027427008513");
    },{hoverText:"UTC Time color"}))
    setInterval(()=>{
        refresh();
    },5000)

    function refresh(){
        const d = new Date();
        textShape.value = `${getColorNameFromDate(d)}<br><b>${d.getUTCHours().toString().padStart(2,"0")}:${d.getUTCMinutes().toString().padStart(2,"0")} UTC</b>`;
        textShape.color = Color3.FromHexString(`#${getTimeColorHex(d)}`);
    }
}