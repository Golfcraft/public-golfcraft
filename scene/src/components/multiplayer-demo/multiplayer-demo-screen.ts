import {createImageButton} from "../imageButton";
import {getGLTFShape} from "../../../golfplay/services/resource-repo";

export const createMultiplayerDemoScreenUX = (parent, {position, rotation, currentUserAddress}) => {
    const callbacks = {
        onJoin:null,
        onStart:null,
        onLeave:null
    }
    const entity =  new Entity();
    entity.setParent(parent);
    entity.addComponent(new Transform({position, rotation}))
    const screen = new Entity();

    const shape = getGLTFShape(`models/board.glb`);
    screen.setParent(entity);
    screen.addComponent(shape);
    const playerListEntity = new Entity();
    playerListEntity.setParent(entity);
    playerListEntity.addComponent(new Transform({
        position:new Vector3(-1.9,3,0)
    }))
    const playerList = new TextShape();
    playerList.hTextAlign = "left";
    playerList.vTextAlign = "top";
    playerList.fontSize = 2;
    playerListEntity.addComponent(playerList);

    const joinButton = createImageButton(entity, {
        position: new Vector3(-1.1, 1.2, 0),
        rotation: Quaternion.Zero(),
        scale: new Vector3(-1.5, -0.5, -1),
        imageSrc: `images/join.png`,
        alphaSrc: ``,
        hoverText: `Join game`
    });

    const leaveButton = createImageButton(entity, {
        position: new Vector3(-1.1, 1.2, 0),
        rotation: Quaternion.Zero(),
        scale: new Vector3(-1.5, -0.5, -1),
        imageSrc: `images/leave.png`,
        alphaSrc: ``,
        hoverText: `leave game`
    });
    leaveButton.hide();
    const startButton = createImageButton(entity, {
        position: new Vector3(1.1, 1.2, 0),
        rotation: Quaternion.Zero(),
        scale: new Vector3(-1.5, -0.5, -1),
        imageSrc: `images/start.png`,
        alphaSrc: ``,
        hoverText: `Start game`
    });
    startButton.hide();
    playerList.value = `- Empty -`;
    joinButton.onClick(() => callbacks.onJoin && callbacks.onJoin());
    leaveButton.onClick(() => callbacks.onLeave && callbacks.onLeave());
    startButton.onClick(() => callbacks.onStart && callbacks.onStart());

    return {
        setPlayers:(players)=>{
            playerList.value = players?.length ? `${players.map(p=>p.displayName).join("\n")}`:`- Empty -`;
            if(currentUserAddress === players[0]?.address && players.length > 0){
                startButton.show();
            }else{
                startButton.hide();
            }
            //TODO if currentPlayerAddress is in players, hide join button and show leave button
            if(players.map(p=>p.address).indexOf(currentUserAddress) >= 0){
                joinButton.hide();
                leaveButton.show();
            }else{
                joinButton.show();
                leaveButton.hide();
            }
        },
        onStart:(fn)=>{
            callbacks.onStart = fn;
        },
        onJoin:(fn)=>{
            callbacks.onJoin = fn;
        },
        onLeave:(fn)=>{
            callbacks.onLeave = fn;
        }
    }

    function applyState(){

    }
}