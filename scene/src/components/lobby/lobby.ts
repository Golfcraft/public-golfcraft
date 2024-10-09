import { addStore, globalStore } from "../../services/globalStore/globalStore";
import {createLobbyTraining} from "./lobby-training";
import {createLobbyCompetition} from "./lobby-competition";
import {refreshCompetitionGroupList, refreshLeaderboard, refreshUserData} from "../../services/userData";
import "./register-sounds";
import { createLinkBoard } from "../link-board";
import { movePlayerTo } from "@decentraland/RestrictedActions";
import {createTitlePanel} from "./title-panel";
import {createBuilding, destroyBuilding} from "./building";
import {LEAVE_CODE} from "../../../../common/constants";
import {fadeInOverlay, fadeOutOverlay} from "../ui/overlay";
import {sleep} from "../../../../common/utils";
import {reproduceAvatarSound} from "../../services/avatar-sound";
import {getCenterPopup} from "../ui/centerpanel";
import { GolfplayClientFactory } from "./golfplay-client";
import {createLobbyTournament} from "./lobby-tournament";
import {createLobbyEditor} from "./lobby-editor";
import PF from "../../../../lib/playfab/_playfab";
import {createChainBridgePanel} from "../bridge/chain-bridge-panel";
import {createVoteLastMap} from "../vote-last-map";
import {createLobbyCrafting} from "./lobby-crafting";
import {getTexture} from "../../../golfplay/services/resource-repo";
import {defaultEmissive} from "../../../golfplay/src/emissive-image";
import {createLobbyUiController} from "../ui/lobby-ui/lobby-ui-controller";
import {createGameUi} from "../ui/game-ui/game-ui";
import {createLobbyMisc} from "./lobby-misc";
import {createNpcTest} from "./npc-storymode/npc-storymode";
import {createDebugMode} from "./debug-mode/debug-mode";
import {createStreamScreens} from "./stream-screens/stream-screens";
import {getMusicForCollection} from "../../services/map-music";
import {GAME_SPAWN, Spawn} from "../spawns";
import {atlasAnalytics} from "../../atlas-analytics-service";
import {initializeSammich} from "../../../metas/sammich";
import { PANELS } from "./building";

// Adding this line results on error Error: executeTask: FAILED TypeError: Cannot read properties of null (reading 'createLobbyEditor')
//import {setTimeout} from '@dcl/ecs-scene-utils'

//import { PortalComponent } from "../../portal/components/portalUnityComponent"

const {GetTitleData} = PF;

export const createPreConnectScenario = (parent) => {
    //const scenario = new Entity();
    //const shape = new GLTFShape(`models/scenario1.glb`);

    //scenario.addComponent(shape);
    //scenario.setParent(parent);
    createBuilding(parent);

    const show = () => createBuilding(parent);
    const hide = () => destroyBuilding();

    return {
        show,
        hide
    }
}
const userAgent = globalThis?.navigator?.userAgent;
const language = globalThis?.navigator?.language;
const platform = globalThis?.navigator?.platform;
const clientInfo = {userAgent, language, platform};

const createLobby = async (parent, {scenario, PlayFabId, user, realm, colyseus, lobbyRoom, servers}) => {
    const entity = new Entity("lobby");
    const userDataState = globalStore.userData.getState();
    const {config} = userDataState;
    const gameState = globalStore.game.getState();
    const callbacks:any = {
        onHide:null,
        onShow:null
    }
    const npc = createNpcTest(entity, {
        position:new Vector3(28-24,1,31-24)
        , clientInfo, PlayFabId, user, realm, colyseus, root:parent,
        onStart:()=>hide(),
        onFinish:async (leaveCode)=>{
            await handleLeavePlay(leaveCode, GAME_SPAWN.MISSION);
        }
    });

    const debug_mode = createDebugMode(entity, {
        position:new Vector3(28-24,1,31-24)
        , clientInfo, PlayFabId, user, realm, colyseus, root:parent,
        onStart:()=>hide(),
        onFinish:async (leaveCode)=>{
            await handleLeavePlay(leaveCode, GAME_SPAWN.MISSION);
        }
    });

    // Polygonal Mind Pride Portal
    /*const portal_1 = new Entity()
    portal_1.addComponent(new Transform({
    position: new Vector3(6.5, 1.4, 41.5),
    rotation: Quaternion.Euler(0, -45, 0)
    }))
    portal_1.addComponent(new PortalComponent(portal_1, "Pride Portal", user, PlayFabId))
    engine.addEntity(portal_1)*/

    /*const {createClientGolfPlay} = GolfplayClientFactory({golfplayBaseUrl:engine["__COURSE_MODELS_BASE__"]})*/
    //entity.addComponentOrReplace(new Transform({rotation:Quaternion.Zero()}));

    entity.setParent(parent);

    addStore("leaderboards", {
        training_success:[],
        competition_points:[],
        competition_points_event:[],
        competition_points_event_hour:[]
    });

    refreshLeaderboard();//promise

    //createNPC(parent);

   /*  createLinkBoard(entity, {
        position:new Vector3(0,0,-10),
        rotation:Quaternion.Zero(),
        imageSrc:`images/help.png`,
        links:[{
            hoverText:"Help golfcraft by voting yes",
            url:"https://governance.decentraland.org/proposal/?id=f7459b10-46e2-11ec-be0c-afec86cba5e5",
            position: new Vector3(0,2.4,-0.1),
            scale:new Vector3(4,3,1)
        }]
    }) */
    createLinkBoard(entity, {
        position:PANELS.MEDIA_LINKS.position,
        rotation:PANELS.MEDIA_LINKS.rotation,
        imageSrc:`images/social.png`,
        withAlpha:undefined,
        links:[
            {
                hoverText:"Discord chat",
                url:"https://discord.gg/2tshKm6UzJ",
                position:new Vector3(-0.96, 1.3, -0.05),
                scale:new Vector3(1,1,1)
            },
            {
                hoverText:"Twitter GolfcraftGame",
                url:"https://twitter.com/GolfcraftGame",
                position:new Vector3(0, 1.3, -0.05),
                scale:new Vector3(1,1,1)
            },
            {
                hoverText:"TikTok",
                url:"https://www.tiktok.com/@golfcraftgame",
                position:new Vector3(0.96, 1.3, -0.05),
                scale:new Vector3(1,1,1)
            }

        ]
    });
    const introScreen = new Entity();
    introScreen.setParent(entity);
    introScreen.addComponent(new Transform({
        position:new Vector3(0, 5, -20),
        rotation:Quaternion.Euler(0, 190, 0),
        scale:new Vector3(-4*1.5,-3*1.5,-1)
    }));
    const introScreenPlane = new PlaneShape();
    const introScreenMaterial = new Material();
    introScreenMaterial.albedoTexture = getTexture(`images/intro-screen2.png`, {samplingMode:1, hasAlpha:true});
    introScreenMaterial.emissiveTexture = getTexture(`images/intro-screen2.png`);
    Object.assign(introScreenMaterial, defaultEmissive);
    introScreen.addComponent(introScreenPlane);
    introScreen.addComponent(introScreenMaterial);

    const showSammich = globalStore.userData.getState().TitleData.showSammich && JSON.parse(globalStore.userData.getState().TitleData.showSammich);
    console.log("showSammich",showSammich);

    if(showSammich?.show){
        try{
            initializeSammich(showSammich);
        }catch(error){
            console.log("SAMMICH INIT ERROR", error);
        }
    }

    const streamURL = globalStore.userData.getState().TitleData.streamURL;

    createStreamScreens(streamURL);

    /*createLinkBoard(entity, {
        position:new Vector3(0,1.5,-4.5),
        rotation:Quaternion.Zero(),
        imageSrc:`images/instructions.png`,
        links:[]
    });*/
    /*createLinkBoard(entity, {
        position:new Vector3(4, 2, -20),
        rotation:Quaternion.Euler(0, 190, 0),
        imageSrc:`images/nft-0.png`,
        links:[{
            hoverText:`Visit opensea and make an offer`,
            url:"https://opensea.io/assets/matic/0xf044647af5d795a9459b7bc0bd47625d4764a222/0",
            position: new Vector3(0,2.4,-0.1),
            scale:new Vector3(4,3,1)
        }]
    });*/
   /* createLinkBoard(entity, {
        position:new Vector3(0, 1.5, 4.5),
        rotation:Quaternion.Euler(0, 180, 0),
        imageSrc:`images/farm-coins.png`,
        links:[]
    });*/
    /*const missionScreen = new Entity();
    missionScreen.setParent(entity);
    missionScreen.addComponent(new Transform({
        position:new Vector3(0, 4.25, 4.5),
        rotation:Quaternion.Euler(0, 180, 0),
        scale:new Vector3(-5,-6,-1)
    }));
    const missionScreenPlane = new PlaneShape();
    const missionScreenMaterial = new Material();
    missionScreenMaterial.albedoTexture = getTexture(`images/cover-egypt.jpeg`, {samplingMode:1, hasAlpha:true});
    missionScreenMaterial.emissiveTexture = getTexture(`images/cover-egypt.jpeg`);
    Object.assign(missionScreenMaterial, defaultEmissive);

    missionScreen.addComponent(missionScreenPlane);
    missionScreen.addComponent(missionScreenMaterial);*/
/*
    createTitlePanel(entity, {
        position:new Vector3(12, 2+3.5, -21.5),
        rotation:Quaternion.Euler(0, 180, 0),
        version:"Version: beta-0.1.1"
    });
    createLinkBoard(entity, {
        position:new Vector3(12, 2, -21.5),
        rotation:Quaternion.Euler(0, 180, 0),
        imageSrc:`images/instructions.png`,
        links:[]
    });*/
    Object.keys(config).filter(configKey => configKey.indexOf("panel_") === 0).forEach((configKey)=>{
        console.log("createLinkBoard", configKey, config[configKey]);
        const {position, rotationEuler, scale, imageSrc, without3D, withAlpha}:any = config[configKey];
        const [rx,ry,rz] = rotationEuler;
        createLinkBoard(entity, {
            position:position && new Vector3(...position) || undefined,
            rotation:rotationEuler && Quaternion.Euler(rx,ry,rz) || undefined,
            scale:scale && new Vector3(...scale) || undefined,
            imageSrc,
            withAlpha,
            without3D,
            links:config[configKey].links.map(({hoverText, url, position, scale}) => ({
                hoverText,
                url,
                position: position && new Vector3(...position) || undefined,
                scale:scale && new Vector3(...scale) || undefined,
            }))
        });
    })

/*
    createLinkBoard(entity, {
        //position:new Vector3(10,3.5,0),
        //rotation:Quaternion.Zero(),
        position:new Vector3(0,1.5,-4.5),
        rotation:Quaternion.Zero(),
        imageSrc:`images/tobikvideo.png`,
        links:[{
            hoverText:"How to play Golfcraft",
            url:"https://www.youtube.com/watch?v=vFUkAYZfSOk",
            position: new Vector3(0,2.4,0),
            scale:new Vector3(4,3,1)
        }]
    });*/

     /* createManaPaymentBoard(entity, {
        position:new Vector3(5,0,0),
        rotation:Quaternion.Zero()
    })  */


    createLobbyCrafting(parent,{PlayFabId, user, realm, colyseus, root:parent} );
    createLobbyTournament(entity, {PlayFabId, user, realm, colyseus, root:parent,
        servers,
        onStart:()=>{
            hide();
            globalStore.game.getState().playing = true;
        },
        onFinish:async (leaveCode)=>{
            await handleLeavePlay(leaveCode, GAME_SPAWN.TOURNAMENT);
        }
    });
    createLobbyTraining(entity, {PlayFabId, user, realm, colyseus, root:parent,
        onStart:()=>hide(),
        onFinish:async (leaveCode)=>{
            await handleLeavePlay(leaveCode, GAME_SPAWN.TRAINING);
        }
    });

    createLobbyCompetition(entity, {PlayFabId, user, realm, colyseus, root:parent,
        onStart:()=>hide(),
        onFinish:async (leaveCode)=>{
            await handleLeavePlay(leaveCode, GAME_SPAWN.COMPETITION);
            globalStore.game.getState().competitionGroup = undefined;
            refreshCompetitionGroupList({ userId: user.userId });
        }
    });

    createLobbyMisc(entity, {lobbyRoom, root:parent, colyseus, onStartGame:()=>hide()});
    const rootChild = new Entity();
    engine.addEntity(rootChild);

    createLobbyEditor(entity, {PlayFabId, user, realm, colyseus, root:parent,
            onStart:()=>{
                hide();
            },
            onFinish:async (leaveCode)=>{
                await handleLeavePlay(leaveCode, GAME_SPAWN.EDITOR);
            }
        })
    createChainBridgePanel(rootChild,{
            position: PANELS.BRIDGE_FT.position,
            rotation: PANELS.BRIDGE_FT.rotation,
            tokenId:0,
            storeName:"FTChain",
            hideMoveToChain:true,
        });
    createChainBridgePanel(rootChild,{
            position: PANELS.BRIDGE_FT500.position,
            rotation: PANELS.BRIDGE_FT500.rotation,
            tokenId:1,
            storeName:"FT500Chain",
            stack:500,
            hideMoveToChain: true,
        });
    createLobbyUiController();
    createGameUi();
    createVoteLastMap();


    npc.show();

    return {
        show,
        hide,
        dispose,
        onHide:(fn)=>{
            callbacks.onHide = fn;
        },
        onShow:(fn)=>{
            callbacks.onShow = fn;
        }
    };

    async function handleLeavePlay(leaveCode, moveToAndLookAt:Spawn){
        await fadeInOverlay(1);
        show();
        gameState.playing = false;
        gameState.votedLastMap = false;
        gameState.lastMap = gameState.courseId;
        gameState.courseId = null;
        refreshUserData();
        if(leaveCode === LEAVE_CODE.TIMEOUT){
            reproduceAvatarSound("failed");
            getCenterPopup().showPlayResult({ timeout:true });
        }else if(leaveCode === LEAVE_CODE.FAILED){
            reproduceAvatarSound("failed");
            getCenterPopup().showPlayResult({ failed:true });
        }
        await sleep(500);
        movePlayerTo(...moveToAndLookAt);
        await fadeOutOverlay(1);
    }

    function show () {
        entity.setParent(parent);
        scenario.show();
        npc?.show();
        callbacks && callbacks.onShow && callbacks.onShow();
    }

    function hide() {
        entity.setParent(null);
        engine.removeEntity(entity);
        scenario.hide();
        npc?.hide();
        callbacks && callbacks.onHide && callbacks.onHide();
    }

    function dispose () {
        //TODO dispose subcomponents traininMenu, competitionMenu, compoetitionList, competitionRewards? -> if some day we want to replace whole game with other game instance
    }
    function getCurrentTournamentCourseId(address, tournamentData){
        const participant = tournamentData.participants?.find(p=>p.address.toLowerCase() === address.toLowerCase());
        if(!participant){
            return tournamentData.courses[0];
        }else{
            return tournamentData.courses[participant.data.courseStates.length];
        }
    }
    function waitForInitialisedState(room){
        return new Promise((resolve, reject)=>{
            room.onStateChange.once(()=>{
                resolve();
            });
        })
    }
}

export {
    createLobby
};
