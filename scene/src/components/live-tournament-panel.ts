import {createImageButton} from "./imageButton";
import * as ui from '@dcl/ui-scene-utils';
import {ButtonStyles} from '@dcl/ui-scene-utils';
import {USE_REMOTE_SERVER} from "../../../common/constants";
import {getGLTFShape} from "../../golfplay/services/resource-repo";
import MESSAGE from "../../../server/rooms/mesages";
import {globalStore} from "../services/globalStore/globalStore";
import {sleep} from "../../../common/utils";
import {fadeInOverlay} from "./ui/overlay";
import {createLiveTournamentGameplay} from "./live-tournament-gameplay";
import {showMessage} from "./server-notification";

const emissiveColor = new Color3(1,1,0);
const TOURNAMENT_URL = USE_REMOTE_SERVER?`https://golfcraftgame.com`:`http://localhost:2569`;



export const createLiveTournamentPanel = async (parent, {position, rotation, colyseus, onStart, onFinish, title}) => {
    const messageBus = new MessageBus();
    const state = {
        useOwnMaps:true,
        numberOfMaps:4,
        stage:0,
        addedHostKeyboardListener:false,
        isHost:false,
        maxDifficulty:5
    };
    const callbacks = {
        onStart:onStart,
        onFinish:onFinish
    }
    const liveLobbyRoom = await colyseus.joinOrCreate("LiveTournamentLobbyRoom");

    await waitForInitialisedState(liveLobbyRoom);

    console.log("LiveTournamentLobbyRoom state initialized");
    globalStore.game.onChange(renderState, "serverPings");
    let servers = globalStore.game.getState().servers;
    globalStore.game.onChange(()=>{
        servers = globalStore.game.getState().servers;
        renderState();
    }, "servers");


    console.log("servers",servers);
    liveLobbyRoom.onStateChange((state)=>{
        console.log("LiveTournamentLobbyRoom state.toJSON", state.toJSON());
        renderState();
    });

    const entity = new Entity();
    entity.setParent(parent);
    entity.addComponent(new Transform({
        position,
        rotation
    }));
    const board = new Entity();
    board.addComponent(new Transform({}));
    board.setParent(entity);
    const boardShape = getGLTFShape(`models/board.glb`);
    board.addComponent(boardShape);
    const titleEntity = new Entity();
    titleEntity.setParent(entity);
    titleEntity.addComponent(new Transform({
        position:new Vector3(0,3.4,0),
        scale:new Vector3(-2,-0.5,-1)
    }));
    const titleTexture = new Texture(`images/live_tournament.png`);
    const titleMaterial = new Material();
    titleMaterial.albedoTexture = titleTexture;
    titleMaterial.emissiveTexture = titleTexture;
    titleMaterial.alphaTexture = titleTexture;
    titleMaterial.emissiveIntensity = 3;
    titleMaterial.emissiveColor = emissiveColor;
    titleMaterial.albedoTexture = titleTexture;
    titleEntity.addComponent(new PlaneShape());
    titleEntity.addComponent(titleMaterial);
    const panelTextEntity = new Entity();
    panelTextEntity.setParent(entity);
    const panelText = new TextShape();
    panelText.hTextAlign = "center";
    panelText.vTextAlign = "top";
    panelText.fontSize = 1;
    panelTextEntity.addComponent(panelText);
    panelTextEntity.addComponent(new Transform({
        position:new Vector3(0,3,0),
    }))

    const createButton = createImageButton(entity, {
        rotation:Quaternion.Zero(),
        position:new Vector3(0, 1.45,0),
        scale:new Vector3(-1,-0.4,-1),
        imageSrc:`${TOURNAMENT_URL}/api/text-image?text=Create%20Tourney&font=Teko-SemiBold&imageWidth=440&imageHeight=80&textWidth=400&x=20&y=10&background=0xffffffff`,
        alphaSrc:`${TOURNAMENT_URL}/api/text-image?text=Create%20Tourney&font=Teko-SemiBold&imageWidth=440&imageHeight=80&textWidth=400&x=20&y=10`,
        hoverText:`Create a Live tournament`
    });
    const joinButton =  createImageButton(entity, {
        rotation:Quaternion.Zero(),
        position:new Vector3(1, 1.45,0),
        scale:new Vector3(-1,-0.4,-1),
        imageSrc:`images/join.png`,
        alphaSrc:`images/join.png`,
        hoverText:`Join this Live tournament`
    });
    const leaveButton = createImageButton(entity, {
        rotation:Quaternion.Zero(),
        position:new Vector3(-1, 1.45,0),
        scale:new Vector3(-1,-0.4,-1),
        imageSrc:`images/leave.png`,
        alphaSrc:`images/leave.png`,
        hoverText:`Leave this Live tournament`
    });
    const playButton = createImageButton(entity, {
        rotation:Quaternion.Zero(),
        position:new Vector3(1, 1.45,0),
        scale:new Vector3(-1,-0.4,-1),
        imageSrc:`images/button-play.png`,
        alphaSrc:`images/button-play.png`,
        hoverText:`Start playing`
    });
    messageBus.on(`LIVE_TOURNAMENT_CREATE`, ({text})=>{
        if(!globalStore.game.getState().playing){
            showMessage({timeout:8000, message:text});
        }
    });
    createButton.onClick(() => {
        const {address, PlayFabId, realm, displayName} = globalStore.userData.getState();
        mapsPrompt.show();
        //TODO show p2p message
        messageBus.emit("LIVE_TOURNAMENT_CREATE", {text:`${displayName} is creating a Live Tournament`});
    });
    joinButton.onClick(()=>{
        const {address, PlayFabId, realm, displayName} = globalStore.userData.getState();
        liveLobbyRoom.send(MESSAGE.JOIN_LIVE_ROOM, {
            address, PlayFabId, realm, displayName,
            numberOfMaps:state.numberOfMaps,
            useOwnMaps:state.useOwnMaps,
            roomIndex:0
        });
    });
    leaveButton.onClick(()=>{
        const {address, PlayFabId, realm, displayName} = globalStore.userData.getState();
        liveLobbyRoom.send(MESSAGE.LEAVE_LIVE_ROOM, {
            address, PlayFabId, realm, displayName,
            numberOfMaps:state.numberOfMaps,
            useOwnMaps:state.useOwnMaps,
            roomIndex:0
        });
    });
    let liveGameRoom;
    playButton.onClick(async ()=>{
        hide();
        const {address, PlayFabId, realm, displayName} = globalStore.userData.getState();
        await fadeInOverlay(0.5);
        const BASE_URL = USE_REMOTE_SERVER?`https://golfcraftgame.com`:`http://localhost:2569`;
        //TODO generate random list of maps
        const body = JSON.stringify({
            useOwnMaps:state.useOwnMaps,
            numberOfMaps:state.numberOfMaps,
            maxDifficulty:state.maxDifficulty,
            collectionId:globalStore.userData.getState().config.liveTournamentMapCollection,
            address,
            "where":{"collectionId":5, "OR":null}//TODO we can remove this once cocobay maps are launched, that is, when these have isSeason set to 1
        });

        console.log("get-random-courses", body);

        const courseIds = await fetch(`${BASE_URL}/api/get-random-courses`, {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body
        }).then(r=>r.json()).then(m=>{
            console.log("courses", m);

            return m.map(i=>i.alias);
        });

        console.log("courseIds",courseIds);
        liveGameRoom = await colyseus.joinOrCreate("live-tournament", {
            instanceId:Date.now(),
            roomIndex:0,
            address,
            PlayFabId,
            realm,
            displayName,
            courseIds,
            numberOfMaps:state.numberOfMaps,
            useOwnMaps:state.useOwnMaps,
            numberOfPlayers:liveLobbyRoom.state.rooms[0].players.length
        });
        liveLobbyRoom.send(MESSAGE.START_LIVE_ROOM, {
            address, PlayFabId, realm, displayName,
            numberOfMaps:state.numberOfMaps,
            useOwnMaps:state.useOwnMaps,
            courseIds,
            roomIndex:0
        });
    });

    liveLobbyRoom.onMessage(MESSAGE.START_LIVE_ROOM, async ({roomIndex, courseIds, instanceId}) => {
        console.log("START_LIVE_ROOM", {roomIndex, courseIds});
        removeHostKeyboardListener();
        const {address, PlayFabId, realm, displayName} = globalStore.userData.getState();
        const gameState = {
            currentGame:0,
            countdown:0
        };
        await fadeInOverlay(0.5);
        callbacks.onStart();
        if(!liveGameRoom) liveGameRoom = await colyseus.join("live-tournament", {instanceId, roomIndex:0, address, PlayFabId,
            realm, displayName, courseIds});

        createLiveTournamentGameplay(parent, {
            room:liveGameRoom,
            instanceId,
            colyseus,
            courseIds,
            numberOfMaps:state.numberOfMaps,
            onFinish:()=>{
                liveGameRoom = null;
                callbacks.onFinish()
            }
        });
    });

    let mapsPrompt = new ui.CustomPrompt(ui.PromptStyles.LIGHT, undefined, undefined, true)

    let numText = mapsPrompt.addText(`Number of maps: ${state.numberOfMaps}`, -120, 150);
    let moreButton = mapsPrompt.addButton("+", -120,100, () => {
        state.numberOfMaps++;
        numText.text.value =`Number of maps: ${state.numberOfMaps}`;
    });
    let lessButton = mapsPrompt.addButton("-", -120,70, () => {
        state.numberOfMaps--;
        state.numberOfMaps = Math.max(1, state.numberOfMaps);
        numText.text.value =`Number of maps: ${state.numberOfMaps}`;
    });

    let useOwnMaps = mapsPrompt.addSwitch(
        "Use own maps?", -100, 0,
        ()=>state.useOwnMaps = true,
        ()=>state.useOwnMaps = false
    );

    mapsPrompt.addButton("CREATE", 0, -40, ()=>{
        //TODO here we should have the room to colyseus already connected
        const {address, PlayFabId, realm, displayName} = globalStore.userData.getState();
        liveLobbyRoom.send(MESSAGE.CREATE_LIVE_ROOM, {
            address, PlayFabId, realm, displayName,
            numberOfMaps:state.numberOfMaps,
            useOwnMaps:state.useOwnMaps,
            maxDifficulty:state.maxDifficulty,
            roomIndex:0
        });
        mapsPrompt.hide();
        addHostKeyboardListener();
        //TODO listen any keyboard iteraction and send message to liveLobbyRoom HOST_ACTIVITY_PROBE with roomIndex as data
        //REMOVE listeners when necessary: START or resetRoom

    }, ButtonStyles.RED);

    const maxDifficultyText = mapsPrompt.addText(`Max difficulty: ${state.maxDifficulty}`, 50, 150);
    let moreButtonDifficulty = mapsPrompt.addButton("+", 60,100, () => {
        state.maxDifficulty++;
        state.maxDifficulty = Math.min(9, state.maxDifficulty);
        maxDifficultyText.text.value =`Max difficulty: ${state.maxDifficulty}`;
    });
    let lessButtonDifficulty = mapsPrompt.addButton("-", 60,70, () => {
        state.maxDifficulty--;
        state.maxDifficulty = Math.max(1, state.maxDifficulty);
        maxDifficultyText.text.value =`Max difficulty: ${state.maxDifficulty}`;
    });

    function hostSendProbe(){

        liveLobbyRoom.send(MESSAGE.HOST_ACTIVITY_PROBE, {roomIndex:0});
    }
    function addHostKeyboardListener(){

        state.addedHostKeyboardListener = true;
        Input.instance.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false,  hostSendProbe)
        Input.instance.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false,  hostSendProbe)
        Input.instance.subscribe("BUTTON_DOWN", ActionButton.FORWARD, false,  hostSendProbe)
        Input.instance.subscribe("BUTTON_DOWN", ActionButton.JUMP, false,  hostSendProbe)

        Input.instance.subscribe("BUTTON_DOWN", ActionButton.POINTER, false,  hostSendProbe)
        Input.instance.subscribe("BUTTON_DOWN", ActionButton.BACKWARD, false,  hostSendProbe)
        Input.instance.subscribe("BUTTON_DOWN", ActionButton.WALK, false,  hostSendProbe)
        Input.instance.subscribe("BUTTON_DOWN", ActionButton.LEFT, false,  hostSendProbe)
        Input.instance.subscribe("BUTTON_DOWN", ActionButton.RIGHT, false,  hostSendProbe)

    }
    function removeHostKeyboardListener(){

        Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.PRIMARY,   hostSendProbe)
        Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.SECONDARY,   hostSendProbe)
        Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.FORWARD,   hostSendProbe)
        Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.JUMP,   hostSendProbe)
        Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.POINTER,   hostSendProbe)
        Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.BACKWARD,   hostSendProbe)
        Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.WALK,   hostSendProbe)
        Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.LEFT,   hostSendProbe)
        Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.RIGHT,   hostSendProbe)
        state.addedHostKeyboardListener = false;
    }


    const disposeOnPlaying = globalStore.game.onChange(({newValue, oldValue, prop})=>{
        console.log("onChange.playing", oldValue, newValue  ,prop);

        if(newValue){
            hide();
            if(state.addedHostKeyboardListener) removeHostKeyboardListener();
        }else{
            show();
        }
    }, "playing");

    renderState();



    return {
        show, hide
    }

    function hide(){
        entity.setParent(null);
        engine.removeEntity(entity);
    }
    function show(){
        entity.setParent(parent)
    }

    function renderState(){
        const {address, PlayFabId, realm, displayName} = globalStore.userData.getState();
        const players = liveLobbyRoom?.state?.rooms[0]?.players ||[];
        const numberOfMaps = liveLobbyRoom?.state?.rooms[0]?.numberOfMaps;
        const maxDifficulty = liveLobbyRoom?.state?.rooms[0]?.maxDifficulty;

        let text = `${title}\n`;

        if(servers){
            text += `Ping: ${globalStore.game.getState().serverPings[servers.find(s=>s.client === colyseus).code]}\n\n`;
        }


        if(liveLobbyRoom?.state?.rooms[0]?.open){
            createButton.hide();

            text += `Nº of maps: ${numberOfMaps}\n`;
            text += `Maps max difficulty: ${maxDifficulty}\n\n`;
            text += `Players: ${players.length}\n`;

            text += `${
                chunkIntoN(players.map(p=>p.displayName),4)
                    .map(i=>i.join(", ")).join("\n")
            }`
            if(players.find(p=>p.address === address)){
                joinButton.hide();
                leaveButton.show();

            }else{
                joinButton.show();
                leaveButton.hide();
            }

        }else{
            if(liveLobbyRoom?.state?.rooms[0]?.playing){
                text += `People is playing\nplease wait to join the next game.\n`;
                createButton.hide();
            } else {
                if(1 || globalStore.userData.getState().hasEditorWearables){
                    if(state.stage === 0){
                        createButton.show();
                    }else{
                        createButton.hide();
                    }
                    if(state.stage === 1){
                        //TODO here we show maps selection etc.
                    }


                } else {
                    text += `To create a live tournament you need certain wearables`;//TODO review to give more info
                    createButton.hide();
                }
            }
            leaveButton.hide();
            joinButton.hide();
        }


        panelText.value = text;

        if(players[0]?.address === address && players.length > 0    ){
            playButton.show()
        }else{
            playButton.hide();
        }
    }
}
function waitForInitialisedState(room){
    return new Promise(async (resolve, reject)=>{
        while(!(room.state)){
            await sleep(100);
        }
        resolve();
    })
}
const chunkIntoN = (arr, n) => {
    const size = Math.ceil(arr.length / n);
    return Array.from({ length: n }, (v, i) =>
        arr.slice(i * size, i * size + size)
    );
}
