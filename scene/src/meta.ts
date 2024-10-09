import {decorateRemotePhysicParts} from "../golfplay/physics/course-element-loader";

(<any>engine)["__COURSE_MODELS_BASE__"] = "golfplay/";

import { connectPlayer, destructureDataValues } from "./services/connect/connectPlayfab";
import { getClientInfo } from "./services/clientInfo";
import CANNON from "../../lib/dcl-cannon-js/_cannon";

globalThis.CANNON = CANNON.default;//TODO REVIEW: workaround for now to have golfplay separated, although bundle size is too big
import { createLobby, createPreConnectScenario } from "./components/lobby/lobby";
import { addStore, createStateDebugUI, globalStore } from "./services/globalStore/globalStore";
import { createTopBar } from "./components/ui/topbar";
import { getLobbyRoom, setLobbyRoom } from "./services/lobbyRoom";
import { createPopup, getCenterPopup } from "./components/ui/centerpanel";
import {getServerHttpURL, selectServer} from "./services/connect/server-selection";
import { showMessage } from "./components/server-notification";
import MESSAGE from "../../server/rooms/mesages";
import { refreshUserData } from "./services/userData";
import { sleep } from "../../common/utils";
import { courseDefinitionsRepo } from "../../common/course-definitions/course-definition-repository";
import {createArrowMarker} from "./components/arrow-marker";
import {hasAllowedWearables} from "../../web/common/wearables";
import {bridgeURL} from "./components/bridge/bridge-url";
import {tryFetch} from "./services/tryFetch";
import {hideAvatarsHandler} from "./services/hide-avatars";
import {createTextColorRotate} from "./components/text-color-rotate";
import {createConfessionPanel} from "./components/lobby/confession-panel";
import {handleAttachedGolfclubs, handleAttachments} from "./components/attached-golfclub";
import {createPendingChecker} from "./services/pending-queue";
import {getNFTGolfClubs} from "./services/golfclubs";
import {getMaterialBalance} from "./services/material-balance";
import {fadeInOverlay, fadeOutOverlay} from "./components/ui/overlay";
import {getCanvas} from "../golfplay/services/canvas";
import { registerSound } from "./services/avatar-sound";
import {getParcel} from "@decentraland/ParcelIdentity";
import {createDclAwardsMiniGame} from "./components/dcl-awards/dcl-awards-minigame";
import {signedFetch} from "@decentraland/SignedFetch";
import { PANELS } from "./components/lobby/building";

//import {createDclAwardsMiniGame} from "./components/dcl-awards/dcl-awards-minigame";

/* import { getRandomGolfClub} from "./services/golfclub-repo"; */

registerSound("ui_servererror"); // General error.

declare const console;
export default class GolfcraftGame implements ISystem {
    private callbacks:any = {
        onEvent:null
    }


    constructor(api, landData){
        getParcel().then(parcel => {
            console.log("PARCEL", parcel);
        })
        const root = new Entity("root");
        const golfPlayWrapper = new Entity("wrapper");
        golfPlayWrapper.addComponent(new Transform({
            position:new Vector3(-24,0,-24)
        }))
        golfPlayWrapper.setParent(root);
        console.log("Creating scenario")
        const scenario = createPreConnectScenario(root);
        console.log("adding game state")
        const gameStore = addStore("game", {
            connected:false,
            playing:false,
            editing:false,
            joiningGame:false,
            connecting:true,
            courseId:null,
            courseAuthor:null,
            introScreen:true
            /* golfClub:getRandomGolfClub() */
        }, true);
        console.log("adding user state");

        addStore("userData", {});
        createConfessionPanel(root, {
            position: PANELS.CONFESSIONS.position,
            rotation: PANELS.CONFESSIONS.rotation
        })

        executeTask(async () => {
            await decorateRemotePhysicParts(fetch);
            const {defaultWs, servers} = await selectServer();
            console.log("defaultWs",defaultWs)
            initializeIntroScreen();
            console.log("selected", getServerHttpURL() );

            gameStore.getState().selectedServer = getServerHttpURL();
            const {pfTitleId, user, realm, serverUrl} = await initializeMeta({root, api, landData});
            createArrowMarker(root);
            showMessage({ timeout: 99999, message:"Connecting ..."});
            const {lobbyRoom, wearablesBonus,affiliateCode, playFabLoginResult, error, colyseus, onReconnect, config} = await connectPlayer(root, {user, pfTitleId, realm, serverUrl, client:defaultWs}, ()=>{/*event*/});

            if(error) {
                showMessage({timeout:99999, message:"Error connecting to GolfCraft server.\nRefresh and select option 'Play using your wallet'.\n\nOr click on your picture on the top right corner and use the 'Connect Wallet' option."});
                return console.log("error", error)
            }

            onReconnect(({lobbyRoom})=>{
                console.log("onReconnect")
                setLobbyRoom(lobbyRoom);
                getLobbyRoom().reconnectListeners();
            });

            const {PlayFabId, TitleData} = playFabLoginResult;

            setLobbyRoom(lobbyRoom);
            getLobbyRoom().onMessage("server", ({message, timeout, inGameplay})=>{
                showMessage({message, timeout, inGameplay});
            });
            getLobbyRoom().onMessage(MESSAGE.PASSIVE_INCOME, async ()=>{
                if(!gameStore.getState().playing){
                    await sleep(10000);
                    refreshUserData({onlyResources:true});
                }
            });

            const materialsBalance = (await getMaterialBalance(user.userId))||{};
            const dailyMissionsData = await fetch(`https://golfcraftgame.com/api/get-daily-missions/${PlayFabId}`).then(r=>r.json());
    console.log("materialsBalance",materialsBalance)
            gameStore.setState({ connecting:false, connected:true, lobbySessionId:lobbyRoom.sessionId});
            globalStore.userData.setState({
                votedLastMap:false,
                lastMap:null,
                user,
                address:user.publicKey,
                realm,
                TitleData,
                config,
                wearablesBonus,
                affiliateCode,
                dailyMissionsData,
                lobbySessionId:lobbyRoom.sessionId,
                ...playFabLoginResult.UserVirtualCurrency,
                ...materialsBalance,
                PlayFabId:playFabLoginResult.PlayFabId,
                ...playFabLoginResult.PlayerStatistics,
                ...playFabLoginResult.UserReadOnlyData,
                ...mapInventoryMaterials(playFabLoginResult.UserInventory),
                chests: playFabLoginResult.UserInventory
                            .filter((item)=>item.ItemClass === "Chest")
                            .map(({ItemId, ItemInstanceId, CustomData})=>
                                ({
                                    ItemId,
                                    ItemInstanceId,
                                    groupPlayers:CustomData && JSON.parse(CustomData.groupPlayers || CustomData.group||null)||undefined,//TODO remove legacy .group
                                    groupId:CustomData && CustomData.groupId ||undefined,
                                    courseId:CustomData && CustomData.courseId || undefined,
                                })),
                userId:user.userId,
                displayName:user.displayName,
                hasEditorWearables:await hasEditorWearables(user.userId),
                golfclubs:[...filterInventoryGolfclubs(playFabLoginResult.UserInventory), ... await getNFTGolfClubs({address:user.userId})],
                trainingBoost:findInventoryTrainingBoost(playFabLoginResult.UserInventory)
            }, true);
            createDclAwardsMiniGame(root, {scenario, PlayFabId, user, realm, colyseus, lobbyRoom});
            console.log("awards mini game created")
            if(TitleData.birthday){
                createTextColorRotate(root, {
                    billboard:true,
                    value:'HAPPY BIRTHDAY\n'+TitleData.birthday,
                    position: new Vector3(37-24,7,24-24)
                });
            }


            hideAvatarsHandler();
            await updateCourseTrainingData();
            handleAttachments();
            handleAttachedGolfclubs(lobbyRoom);
            globalStore.userData.onChange(({newValue, oldValue, prop})=>{
                updateCourseTrainingData();
            },"currentTrainingCourseID");

            this.callbacks.onEvent({type:"USER_DATA_CHANGE", data:{propertyChanged:null, value:globalStore.userData.getState()}});
            createPopup();
            createTopBar({});

            const chainRequestQueue = createPendingChecker({address:user.userId});
            chainRequestQueue.onFinishedQueue(async ()=>{
                await sleep(2000);
                refreshUserData();
                showMessage({message:"Your requests have been resolved", timeout:10000})
            });
console.log("createLobby")
            const lobby = await createLobby(root, {scenario, PlayFabId, user, realm, colyseus, lobbyRoom, servers});
            console.log("createdLobby")
            globalStore.userData.onChange(({newValue, oldValue, prop})=>{
                this.callbacks.onEvent({type:"USER_DATA_CHANGE", data:{propertyChanged:prop, value:newValue}} )
            });
            globalStore.game.onChange(({newValue, oldValue, prop})=>{
                this.callbacks.onEvent({type:"GAME_STATE_CHANGE", data:{propertyChanged:prop, value:newValue}} );

                if(prop === "playing" && newValue != oldValue){
                    if(newValue == true){
                        this.callbacks.onEvent && this.callbacks.onEvent({type:"PLAY_START"})
                    }else{
                        this.callbacks.onEvent && this.callbacks.onEvent({type:"PLAY_END"})
                    }
                }
            }, "playing");
            globalStore.game.onChange(({newValue, oldValue, prop})=>{
                this.callbacks.onEvent({type:"GAME_STATE_CHANGE", data:{propertyChanged:prop, value:newValue}} );

                if(prop === "editing" && newValue != oldValue){
                    if(newValue == true){
                        this.callbacks.onEvent && this.callbacks.onEvent({type:"EDIT_START"})
                    }else{
                        this.callbacks.onEvent && this.callbacks.onEvent({type:"EDIT_END"})
                    }
                }
            }, "editing");
            console.log("statistic_paella_wearable", globalStore.userData.getState().statistic_paella_wearable);


            async function hasEditorWearables(address){
                let wearablesData;
                try{
                    wearablesData = await fetch( `https://peer.decentraland.org/lambdas/collections/wearables-by-owner/${address}`).then(r=>r.json());
                }catch(err){

                }

                return wearablesData && hasAllowedWearables(wearablesData);
            }

            async function updateCourseTrainingData () {
                const userDataState = globalStore.userData.getState();
                await sleep(1);
                if (userDataState.currentTrainingData?.courseId !== userDataState.currentTrainingCourseID){
                    let courseData;
                    if(courseDefinitionsRepo.training[userDataState.currentTrainingID][userDataState.currentTrainingCourseID]){
                        courseData = {
                            courseId:userDataState.currentTrainingCourseID,
                            metadata:courseDefinitionsRepo.training[userDataState.currentTrainingID][userDataState.currentTrainingCourseID].metadata,
                            subType:userDataState.currentTrainingID
                        }
                    }else{
                        try{
                            courseData = await fetch(`https://golfcraftgame.com/api/get-course`, {
                                method:"POST",
                                headers:{"Content-Type":"application/json"},
                                body:JSON.stringify({alias:userDataState.currentTrainingCourseID})
                            }).then(async r=> await r.json()).then(({alias, metadata, subType})=>({
                                subType,
                                courseId:alias,
                                metadata:JSON.parse(metadata)
                            }));
                        }catch(err){
                            console.error(err);
                            courseData = {
                                courseId:"training-1-1",
                                metadata:courseDefinitionsRepo.training["1"]["training-1-1"].metadata,
                                subType:"1"
                            }
                        }
                    }

                    globalStore.userData.setState({
                        currentTrainingID: courseData.subType,
                        currentTrainingCourseID: courseData.courseId,
                        currentTrainingData: courseData
                    })
                }
            }
        });

        function initializeIntroScreen(){
            fadeInOverlay(0, undefined, {opacity:0.95});
            const canvas = getCanvas();
            const image = new UIImage(canvas, new Texture("images/intro-screen.png"));
            image.sourceWidth = 1063;
            image.width = 1063/1.5;
            image.positionY = 80;
            image.sourceHeight = 815;
            image.height = 815/1.5;
            //  image.isPointerBlocker = false;
            image.onClick = new OnClick(skipIntro);


            Input.instance.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, skipIntro);

            async function skipIntro(event){
                console.log("click event", event)
                await sleep(1000);
                image.onClick = null;
                image.isPointerBlocker = false;
                fadeOutOverlay(3);
                image.visible = false;
                Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.PRIMARY, skipIntro);
                await sleep(1500);
                globalStore.game.getState().introScreen = false;
            }
        }
    }

    onEvent(fn){
        this.callbacks.onEvent = fn;
    }

    refreshUserData(){
        refreshUserData();
    }

    update(dt){

    }
}

function filterInventoryGolfclubs(UserInventory){
    return UserInventory.filter(item=>item.ItemClass==="Golfclub" && item.ItemId === "golfclub-1");
}
function findInventoryTrainingBoost(UserInventory){
    return UserInventory.find(item=>item.ItemClass==="TrainingBoost");
}
function mapInventoryMaterials(UserInventory){//TODO duplicated code, move to service and remove doubles
    return UserInventory.reduce((acc, current) => {
        if(current.ItemClass === "Material"){
            acc[`material_${current.ItemId}`] = current.RemainingUses||0;
        }
        return acc;
    }, {});
}

async function initializeMeta({root, api, landData}){
    // returns hostdata, user and realm
    const {position, rotation, scale, serverWs, pfTitleId, pfProjectId, showDebug, pfSpecificRevision, serverUrl} = JSON.parse(landData.host_data).golfcraftgame;
    const {x,y,z} = position;
    const [user, realm] = await getClientInfo(api);
    showDebug && createStateDebugUI();
    root.addComponent(new Transform({
        position:new Vector3(x,y,z)
    }));
    engine.addEntity(root);

    return {position, rotation, scale, serverWs, pfTitleId, pfProjectId, showDebug, pfSpecificRevision, user, realm, serverUrl};
}
