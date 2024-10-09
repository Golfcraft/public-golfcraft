import {createTrainingMenu} from "./training/training-menu";
import {createStatisticsPanel} from "../statistics-panel";
import {createTrainingLeaderboardPanel} from "./training/training-leaderboard-panel";
import { GOLF_CLUB_BONUSES, LEAVE_CODE, TRAINING, trainingIdNameMap } from "../../../../common/constants";
import { refreshLeaderboard, refreshUserData } from "../../services/userData";
import { globalStore } from "../../services/globalStore/globalStore";
import { GolfplayClientFactory } from "./golfplay-client";
import { GameDefinition } from "../../../../common/game-definition-type";
import { getTopBar } from "../ui/topbar";
import { getCenterPopup } from "../ui/centerpanel";
import { movePlayerTo } from "@decentraland/RestrictedActions";
import { fadeInOverlay, fadeOutOverlay } from "../ui/overlay";
import { sleep } from "../../../../common/utils";
import { reproduceAvatarSound } from "../../services/avatar-sound";
import MESSAGE from "../../../../server/rooms/mesages";
import PF from "../../../../lib/playfab/_playfab";
const { ExecuteCloudScript } = PF;
import { createGolfclubBoard } from "./golfclub-screen/golfclub-screen-ui";
import { getUserData } from "@decentraland/Identity";
import { signedFetch } from "@decentraland/SignedFetch";
import * as ui from '@dcl/ui-scene-utils';
import {createChainBridgePanel} from "../bridge/chain-bridge-panel";
import {CURRENCY} from "../../../../common/currency-codes";
import {setTimeout} from "@dcl/ecs-scene-utils";
import {showMessage} from "../server-notification";
import {createTitlePanel} from "./title-panel";
import {createLinkBoard} from "../link-board";
import {createSeasonMenu} from "./seasons/season-menu";
import { wearable } from "@dcl/crypto-scene-utils";
import {createCreatorCodeButton} from "../creator-code-button";
import { PANELS } from "./building";

const MINT_ENDPOINT = `https://golfcraftgame.com/bridge/mint-golf-club`;
const ACTION_ENDPOINT = 'https://golfcraftgame.com/bridge/action/';
//const MINT_ENDPOINT = `http://localhost:2567/mint-golf-club`;

const userAgent = globalThis?.navigator?.userAgent;
const language = globalThis?.navigator?.language;
const platform = globalThis?.navigator?.platform;
const clientInfo = {userAgent, language, platform};

declare const clearInterval;
declare const console;
const wearables_texts: Array<TextShape> = [];
let action_id;
let golfclubBoard;

const createLobbyTraining = async (entity, {root, colyseus, user, realm, PlayFabId, onStart, onFinish}) => {
    console.log("createLobbyTraining")
    const {createClientGolfPlay} = GolfplayClientFactory({golfplayBaseUrl:engine["__COURSE_MODELS_BASE__"]})
    const userDataState = globalStore.userData.getState();
    const gameState = globalStore.game.getState();
    const topBar = getTopBar();
    const seasonRanking = createTrainingLeaderboardPanel(entity, {
        StatisticName:"tier-sub-max",
        position: PANELS.SEASON_LEADERBOARD.position,
        rotation: PANELS.SEASON_LEADERBOARD.rotation,
        title:"Season ranking"
    });
    const daysConnected = createTrainingLeaderboardPanel(entity, {
        StatisticName:"connected-days",
        position: PANELS.DAYS_CONNECTED.position,
        rotation: PANELS.DAYS_CONNECTED.rotation,
        title:"Days connected"
    });
    daysConnected.refresh();
    createCreatorCodeButton(entity);
    const season_board_position = new Vector3(-11.5, 2, 21.5)
    createLinkBoard(entity, {
        position:season_board_position,
        rotation: Quaternion.Euler(0, 0, 0),
        scale: new Vector3(4 * 1, 2.7 * 1.5, 1),
        imageSrc: "images/seasons-screen.png",
        links:[],
        without3D:true,
        withAlpha:false
    });
    seasonRanking.refresh();
console.log("stock updating")
    for (let n=0; n<20;n++) {
        const wearable_info = new Entity()
        const wearable_text = new TextShape()
        wearable_text.vTextAlign = "top"
        wearable_text.hTextAlign = "left"
        wearable_text.value = ""
        wearable_text.fontSize = 1
        wearable_text.color = Color3.White()
        wearable_text.shadowBlur = 2
        wearable_text.shadowColor = Color3.Blue()
        wearable_text.shadowOffsetX = 2
        wearable_text.shadowOffsetY = 2
        wearable_info.addComponent(wearable_text)
        const collumn = n%5
        const row = Math.floor(n/5)
        wearable_info.addComponent(new Transform({
            position: season_board_position.add(new Vector3(-1.85+(collumn*0.457), 1.93-(row*0.47), -0.01)),
            scale: new Vector3(0.5, 0.5, 0.5)
        }))
        wearable_info.setParent(entity)
        wearables_texts.push(wearable_text)
    }
    engine.addSystem(new StockUpdateSystem())

    //TODO now create panel to play season
    const seasonMenu = await createSeasonMenu(entity, {
        colyseus,
        wip:true,
        root,
        position: PANELS.SEASON.position,
        rotation: PANELS.SEASON.rotation,
        onStarting:()=>{
            onStart();
        },
        onFinish:async ()=>{
            onFinish();
            await refreshUserData();

            // This line is not needed anymore
            // refreshUserData now executes seasonMenu.refresh() as a callback
            // see season-menu.ts line ~102
            //seasonMenu.refresh();
        }
    });
    seasonMenu.show();
    console.log("season menu", seasonMenu)

   /* const trainingMenu = createTrainingMenu(entity, {
        trainingID:userDataState.currentTrainingID,
        position:new Vector3(-10, 2, 21.5),
        rotation:Quaternion.Euler(0,0,0)
    });

    trainingMenu.onStart(onRequestStartTraining);
    createStatisticsPanel(entity, {
        position: new Vector3(-15, 2, 21.5),
        rotation:Quaternion.Euler(0, 0, 0),
        title:`Player statistics`,
        stateNames: {
            total:{
                label:'Trainings done',
                fnValue:({training_success, training_failed})=>training_failed+training_success
            },
            training_success: { label: 'Success' },
            training_failed: { label: 'Failed' },
            training_playedTime: { hide: true },
            trainingPlayedHours: {
                label:'Played hours',
                fnValue:({training_playedTime}) => Math.floor(training_playedTime / 1000 / 60 / 60)
            },
        }
    });
    createTrainingLeaderboardPanel(entity, {
        position: new Vector3(-5, 2, 21.5),
        rotation:Quaternion.Euler(0, 0, 0),
        title:"Training leaderboard",
        StatisticName:"training_success"
    });*/
    /* createStatisticsPanel(entity, {
        position: new Vector3(-9.5,0,-9),
        title:`Weekly statistics`,
        stateNames: {
            statistic_total:{
                label:'Trainings done',
                fnValue:({statistic_training_success, statistic_training_failed}) => statistic_training_failed + statistic_training_success
            },
            statistic_training_success: { label: 'Success' },
            statistic_training_failed: { label: 'Failed' },
            statistic_training_playedTime: { hide: true },
            statistic_trainingPlayedHours: {
                label:'Played hours',
                fnValue:({statistic_training_playedTime}) => Math.floor(statistic_training_playedTime / 1000 / 60 / 60)
            },
        }
    }); */
    golfclubBoard = createGolfclubBoard(entity, {
        PlayFabId,
        position: PANELS.GOLFCLUBS.position,
        rotation: PANELS.GOLFCLUBS.rotation,
        golfclubCollection:deserializeGolfclubs(globalStore.userData.getState().golfclubs),
        activeGolfClubTokenId:globalStore.userData.getState().activeGolfClubTokenId || null,//TODO
        playerGems:globalStore.userData.getState().material_Gem
    });
    createChainBridgePanel(entity,{
        position: PANELS.BRIDGE_DM.position,
        rotation: PANELS.BRIDGE_DM.rotation,
        VirtualCurrency:CURRENCY.DIAMOND,
        VirtualCurrencyName:"Diamonds",
        tokenId:2,
        stack:1,
        storeName:"DMChain"
    });
    createChainBridgePanel(entity,{
        position: PANELS.BRIDGE_DM100.position,
        rotation: PANELS.BRIDGE_DM100.rotation,
        VirtualCurrency:CURRENCY.DIAMOND,
        VirtualCurrencyName:"Diamonds",
        tokenId:3,
        stack:100,
        storeName:"DM100Chain"
    });
    golfclubBoard.onSelect(async ({golfclub})=>{
        const {tokenId} = golfclub;
        golfclubBoard.updateState({loading:true});
        await ExecuteCloudScript({
            FunctionName:'selectGolfClubTokenId',
            FunctionParameter:{
                tokenId
            }
        });
        await sleep(1000);
        await refreshUserData();
        golfclubBoard.updateState({loading:false});
    })
    golfclubBoard.onUpgrade(async ({attribute, ItemInstanceId})=>{
        golfclubBoard.updateState({loading:true});
        const fResult = await ExecuteCloudScript({
            FunctionName:`upgradeGolfclub`,
            FunctionParameter:{
                ItemInstanceId,
                attribute
            }
        });

        await sleep(1);
        await refreshUserData();
        golfclubBoard.updateState({loading:false});
    });
    golfclubBoard.onMint(async ()=>{
        console.log("onMint");
        if(!(globalStore.userData.getState().DM >= 120)){
            console.log("not enough diamonds")
            showMessage({timeout:5000, message:"Not enough diamonds"});
            golfclubBoard.updateState({loading:false});
            return;
        }
        if(action_id != null) {
            showMessage({timeout:5000, message:"Minting in progress. Please wait a moment."});
            return;
        }
        golfclubBoard.updateState({loading:true});
        const user = await getUserData();
        ui.displayAnnouncement("Sending...");
        await sleep(300);
        let result;
        try{
            result = await signedFetch(MINT_ENDPOINT, {
                method:'POST',
                body:JSON.stringify({
                    PlayFabId,
                    address: user.publicKey,
                    user:{
                        displayName:user.displayName
                    }
                }),
                headers:{
                    "Content-Type":"application/json"
                }
            })
        }catch(err){
            console.log("err",err);
            ui.displayAnnouncement(err && (err.error || err.data.message) || err);
            await sleep(1000);
            golfclubBoard.updateState({loading:false});
            return;
        }

        const jsonResult = result.json || result.text && JSON.parse(result.text);
        if(jsonResult && jsonResult?.error){
            showMessage({timeout:5000,message:jsonResult.error})
        }else if(result.ok){
            action_id = jsonResult.actionID;
            console.log("Action", action_id)
            console.log(jsonResult)
            showMessage({timeout:5000,message:"Request sent, wait while is completed"});

        }else{
            showMessage({timeout:5000,message:"Error"})
            console.log("Unhandled condition.", JSON.stringify(result));
        }

        /*if(result.error){
            reproduceAvatarSound("ui_servererror");
            showMessage({timeout:5000, message:"Minting failed"});
            await sleep(4000);
            golfclubBoard.updateState({loading:false});
        }else{
            action_id = result.actionID
            console.log("Action", action_id)
            console.log(result)
            showMessage({timeout:5000, message:"Minting request sent"});
        }*/

        /*if(result.ok === false){
            ui.displayAnnouncement(JSON.parse(result.text).error);
            await sleep(1000);
            golfclubBoard.updateState({loading:false});
            return;
        }*/
        //ui.displayAnnouncement("Success!");
        //await refreshUserData();
        //golfclubBoard.updateState({loading:false});
    })

    globalStore.userData.onChange(({newValue, oldValue, prop})=>{
        if(prop === "golfclubs" || prop === "material_Gem"){
            golfclubBoard.updateState({
                golfclubCollection:deserializeGolfclubs(globalStore.userData.getState().golfclubs),
                activeGolfClubTokenId:globalStore.userData.getState().activeGolfClubTokenId || null,
                playerGems:globalStore.userData.getState().material_Gem,
                upgradingAttribute:null
            });
        }
        if(prop === "statistic_current_mission" || prop === "statistic_tier-sub"){
            seasonMenu.refresh();
        }
    });

  /*  return {
        trainingMenu
    };*/

    function deserializeGolfclubs(golfclubs){
        return golfclubs.map((golfclubData)=>{
            console.log("golfclubData",golfclubData);
            if(!golfclubData.CustomData){
                golfclubData.CustomData =  {attribute_power:0, attribute_control:0, attribute_aim:0}
            }
            const golfclubId = golfclubData.ItemId.replace('golfclub-','')
            return {
                tokenId:golfclubData.CustomData?.tokenId || null,
                golfclubId,
                xp:Number(golfclubData.CustomData?.xp||0),
                DisplayName:golfclubData?.DisplayName,
                ItemInstanceId:golfclubData.ItemInstanceId,
                attributes:{
                    power:Number(golfclubData?.CustomData?.attribute_power || 0),
                    control:Number(golfclubData?.CustomData?.attribute_control || 0),
                    aim:Number(golfclubData?.CustomData?.attribute_aim || 0),
                },
                minting:Number(golfclubData.CustomData?.minting||false),
                bonus:golfclubId && GOLF_CLUB_BONUSES[golfclubId]?.xp || 0
            }
        }).concat([{
            tokenId:"999999",
            golfclubId:9,
            xp:0,
            attributes:{
                power:5, control:5, aim:5
            },
            DisplayName:"CocoBay x Golfcraft",
            minting:false,
            bonus:1
        }]);
    }
/*
    async function onRequestStartTraining(){
        if(gameState.playing || gameState.starting) return;
        setTimeout(2500,()=>{ reproduceAvatarSound("intro"); });

        fadeInOverlay(1);
        gameState.starting = true;
        gameState.playing = true;
        console.log("STARTING");
        //trainingMenu.hide();

        const {currentTrainingID} = globalStore.userData.getState();
        const state = {
            started:false
        };
        await sleep(1000);
        onStart();//will hide lobby

        const trainingKey = trainingIdNameMap[currentTrainingID];

        let clientGolfPlay;

        const gameDefinition:GameDefinition = {
            type:"training",
            subType: userDataState.currentTrainingData.subType,
            courseId: userDataState.currentTrainingData.courseId,
            /!*   subType:"3",
            courseId:"training-3-2",    *!/
        };
        gameState.courseId = userDataState.currentTrainingCourseID;
        const room = await colyseus.joinOrCreate(`training-${trainingKey}`, {
            user:{...user, avatar:undefined}, realm, userId:user.userId, roomInstanceId:`${user.userId}-${Date.now()}`, PlayFabId, gameDefinition, clientInfo
        }).then(r=>r, (err)=>{
            console.log("PROBLEM JOINING ROOM", err)
        });
        console.log("WAITING ROOM INITIALIZED", gameDefinition);
        await waitForInitialisedState(room);
        console.log("ROOM INITIALIZED");
        let timeInterval;
        let timeIntervalCount = 0;
        let stopInterval = false;
        room.onMessage(MESSAGE.START, ({startTime, duration, serverTime})=>{//TODO duplicated code, abstract to service
            const localStartTime = startTime - (serverTime-Date.now());
            console.log("START", JSON.stringify(state), Date.now(), startTime, localStartTime, serverTime);
            topBar.show();
            intervalCheck();


            function intervalCheck(){
                    if(!state.started && localStartTime <= Date.now()){
                        console.log("STARTED", clientGolfPlay.id, clientGolfPlay);
                        state.started = true;
                        clientGolfPlay.start();
                        console.log("clientGolfPlay.start() called", clientGolfPlay.id);
                        gameState.starting = false;
                    }else if(!state.started){
                        console.log("not yet", timeInterval, localStartTime, Date.now())
                    }
                    if(state.started){
                        if((localStartTime + ( duration * 1000 )) < Date.now()) {
                            console.log("started and setting clock to 0");
                           // clearInterval(timeInterval);
                            stopInterval = true;
                            topBar.updateTime(0);
                        } else {
                            const clockTime = (localStartTime + (duration * 1000)) - Date.now()
                            // console.log("started and setting clock to ",clockTime);
                            topBar.updateTime(clockTime);
                        }
                    }
                    if(!state.started && timeIntervalCount >= 10000){
                        state.started = true;
                        console.log("STARTED WITH BUG");
                        clientGolfPlay.start();
                        gameState.starting = false;

                    }
                    if(!stopInterval) setTimeout(200,intervalCheck);
            }
        });
        const golfclubs = userDataState.golfclubs;
        const activeGolfClub = golfclubs.find(item => item.CustomData?.tokenId === userDataState.activeGolfClubTokenId) || golfclubs.find(item => item.ItemId === "golfclub-1");
        const expressionState = {};
        room.onMessage(MESSAGE.VARIABLE_INITIALIZATION, (data)=>{
            Object.assign(expressionState, data);
        });
        //TODO wait for MESSAGE.START before createClientGolfPlay?
        clientGolfPlay = await createClientGolfPlay(root, {
            gameType:"training",
            room,
            gameDefinition,
            golfclub:{
                id:activeGolfClub.ItemId.replace('golfclub-',''),
                power:Number(activeGolfClub.CustomData?.attribute_power || 0),
                control:Number(activeGolfClub.CustomData?.attribute_control || 0),
                aim:Number(activeGolfClub.CustomData?.attribute_aim || 0),
            },
            colyseus,
            expressionState
        });
        console.log("created clientGolfPlay", clientGolfPlay.id);
        clientGolfPlay.onFinish(async (leaveCode) => {   //TODO refactor, move callback to responsible domain/service
            console.log("onFinish", leaveCode)
            //clearInterval(timeInterval);
            stopInterval = true;
            clientGolfPlay.dispose();
            clientGolfPlay = null;
            topBar.updateTime(0);
            topBar.hide();
            onFinish(leaveCode);
            //TODO last commit bellow didn't fix anything and makes worse experience d0021e62a1e01b2d5328ca59951a41f9f190a27e
            await sleep(4000);
            await refreshUserData();
            //trainingMenu.show();
        });

        clientGolfPlay.onComplete(async ({xp, GC, PT, time, shoots, materialDrops})=>{
            await sleep(1000);
            reproduceAvatarSound("success");
            getCenterPopup().showPlayResult({xp, PT, GC, time, shoots, materialDrops});
        });
    }*/
}

export {createLobbyTraining}

function waitForInitialisedState(room){
    return new Promise(async (resolve, reject)=>{
        while(!room){
            await sleep(100);
        }
        room.onStateChange.once(()=>{
            resolve();
        });
    })
}

export class StockUpdateSystem implements ISystem {
    refresh_time = 9999.0
    update(dt: number) {
        this.refresh_time += dt
        if (this.refresh_time < 60) return
        this.refresh_time = 0.0

        executeTask(async () => {
            try {
                let response = await fetch("https://golfcraftgame.com/bridge/season-rewards");
                const result = await response.json()
                log("season-rewards result", result.result)
                const wearables = result.result.wearables
                for (let n=0; n<wearables.length;n++) {
                    const name = wearables[n].name
                    const stock = wearables[n].maxStock - wearables[n].claimed
                    const ft = wearables[n].fashionTickets
                    if (stock > 0) {
                        wearables_texts[n].value = `\n${stock} left`
                    } else {
                        wearables_texts[n].value = `\n${stock} left (${ft} FT)`
                    }
                }
            } catch {
                log("failed to reach URL");
            }
        })
    }
}

class GolfClubStatusSystem implements ISystem {
    time = 0.0
    update(dt: number) {
        this.time += dt
        if (this.time < 15) return
        this.time = 0.0
        if (action_id == null) return

        log("Checking golfclub mint action", action_id)
        executeTask(async () => {
            try {
                let response = await fetch(ACTION_ENDPOINT+action_id);
                const result = await response.json()
                log("result", result.result)
                if (result.result.state == 1) {
                    log("Action pending")
                    return
                }
                action_id = null
                if (result.result.state == 2) {
                    refreshUserData()
                    showMessage({timeout:5000, message:"Golf club minted successfully!"});
                    golfclubBoard.updateState({loading:false});
                    log("Part craft action success", action_id)
                } else if (result.result.state == 0) {
                    showMessage({timeout:5000, message:"Error crafting golf club. Try again later."});
                    golfclubBoard.updateState({loading:false});
                    log("Part craft action error", action_id)
                }
            } catch {
                log("failed to reach URL");
            }
        })
    }
  }

engine.addSystem(new GolfClubStatusSystem());