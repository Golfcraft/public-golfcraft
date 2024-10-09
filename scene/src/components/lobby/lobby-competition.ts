import {createCompetitionMenu} from "./competition/competition-menu";
import {createCompetitionListPanel} from "./competition/competition-group-list-panel";
import {createRewardsPanel} from "./competition/competition-rewards-panel";
import { globalStore } from "../../services/globalStore/globalStore";
import {  LEAVE_CODE, PRICE_COMPETITION_GROUP } from "../../../../common/constants";
import { getLobbyRoom } from "../../services/lobbyRoom";
import { refreshCompetitionGroupList, refreshLeaderboard, refreshUserData } from "../../services/userData";
import { getTopBar } from "../ui/topbar";
import { getCenterPopup } from "../ui/centerpanel";
import { movePlayerTo } from "@decentraland/RestrictedActions";
import { fadeInOverlay, fadeOutOverlay } from "../ui/overlay";
import {formatTime, sleep} from "../../../../common/utils";
import { reproduceAvatarSound } from "../../services/avatar-sound";
import MESSAGES from "../../../../server/rooms/mesages";
import { createTrainingLeaderboardPanel } from "./training/training-leaderboard-panel";
import {tryFetch} from "../../services/tryFetch";
import * as ui from '@dcl/ui-scene-utils';
import {GolfplayClientFactory} from "./golfplay-client";
import {getServerHttpURL} from "../../services/connect/server-selection";
import {createNinjaMenu} from "./competition/ninja-menu";
import {createRemoteGamePlay2} from "../../../golfplay/src/golfplay-test-remote2";
declare const clearInterval;
declare const setInterval;
declare const setTimeout;

const userAgent = globalThis?.navigator?.userAgent;
const language = globalThis?.navigator?.language;
const platform = globalThis?.navigator?.platform;
const clientInfo = {userAgent, language, platform};

const createLobbyCompetition = (entity, {user, PlayFabId, realm, colyseus, root, onStart, onFinish}) => {
    const {createClientGolfPlay} = GolfplayClientFactory({golfplayBaseUrl:engine["__COURSE_MODELS_BASE__"]})
    const reconnectableLobbyRoom = getLobbyRoom();
    const gameState = globalStore.game.getState();
    const topBar = getTopBar();

/*
    const competitionGroupList = createCompetitionListPanel(entity, {
        position:new Vector3(8, 8, 16),
        rotation:Quaternion.Euler(0, 80, 0),
    });
    const competitionMenu = createCompetitionMenu(entity, {
        position:new Vector3(8, 8, 10),
        rotation:Quaternion.Euler(0, 90, 0),
    });
    const rewards = createRewardsPanel(entity, {
        position:new Vector3(7, 8, 4),
        rotation:Quaternion.Euler(0, 110, 0),
    });*/

    if(Date.now() >= new Date("2022-11-22T17:43:00.000Z").getTime() && Date.now() <= new Date("2022-11-22T20:00:00.000Z").getTime()){
        initNinjaMenu();
    }

    /*
    createTrainingLeaderboardPanel(entity, {
        position:new Vector3(-21, 9, 17.7),
        rotation:Quaternion.Euler(0, -65, 0),
        title:"Global Competition leaderboard",
        StatisticName:"competition_points"
    });
*/

    //TODO admin: allow to set variable and check that variable to show or not the event leaderboard
/*    createTrainingLeaderboardPanel(entity, {
        position:new Vector3(17.5, 3.5, -23.5),
        rotation:Quaternion.Euler(0, 180, 0),
        title:"Event Competition leaderboard",
        StatisticName:"competition_points_event"
    });*/
/*
    createTrainingLeaderboardPanel(entity, {
        position:new Vector3(3.5, 8, 17.7),
        rotation:Quaternion.Euler(0, 20, 0),
        title:"Each hour - Top10:10FT - Top3:Diamonds",
        StatisticName:"competition_points_event_hour"
    });

    if(globalStore.userData.getState().GC < PRICE_COMPETITION_GROUP){
        competitionMenu.disable();
    }

    globalStore.userData.onChange(({newValue, oldValue, prop}) => {
        if(newValue < PRICE_COMPETITION_GROUP){
            competitionMenu.disable();
        } else {
            competitionMenu.enable();
        }
    }, "GC");

    competitionMenu.onStart(onRequestStartCompetition);

    return {competitionMenu, competitionGroupList};*/

    function initNinjaMenu(){
        const ninjaMenu = createNinjaMenu(entity, {
            position:new Vector3(8-24, 11.5, 37-24),
            rotation:Quaternion.Euler(0, -65, 0),
        });
        ninjaMenu.onPlay(async ()=>{
            if(gameState.playing || gameState.starting) return;
            ninjaMenu.hide();
            setTimeout(()=>{ reproduceAvatarSound("intro"); }, 2500);
            await fadeInOverlay(1);
            gameState.playing = true;
            gameState.starting = true;
            onStart();


            const gamePlay = await createRemoteGamePlay2(colyseus, {  type:"training",
                subType: "4",
                courseId:"ninja2",}, root, PlayFabId );
            gamePlay.onFinish(async ()=>{
                onFinish();
                await sleep(3000);
                ninjaMenu.show();
                await sleep(3000);
                refreshLeaderboard("Ninja");
            });
            fadeOutOverlay(1);

            gameState.starting = false;

        });
        createTrainingLeaderboardPanel(entity, {
            position:new Vector3(11-24, 9, 41-24),
            rotation:Quaternion.Euler(0, -65, 0),
            title:"Event: Fastest Ninja",
            StatisticName:"Ninja",
            formatValueFn:(value)=>formatTime(999999999-value, true)
        }).refresh();
    }

    async function onRequestStartCompetition(){
        if(gameState.playing || gameState.starting) return;
        if(globalStore.userData.getState().chests.length >= 10){
            ui.displayAnnouncement("Too many chests to be open");
            return;
        }
        setTimeout(()=>{ reproduceAvatarSound("intro"); }, 2500);
        fadeInOverlay(1);

        gameState.playing = true;
        gameState.starting = true;
       // competitionMenu.hide();
        await sleep(1000);

        const group = await fetch(`${getServerHttpURL()}/request-competition-group-room`, {
            method:'POST',
            body:JSON.stringify({
                PlayFabId,
                userId:user.userId,
                displayName:user.displayName,
                competition_points:globalStore.userData.getState()[`statistic_competition_points`]
            }),
            headers:{
                "Content-Type":"application/json"
            }
        }).then(r=>r.json(), (err)=>{
            ui.displayAnnouncement("Error: " + err.error)
            return;
        });

        if(!group?.id) {
            resetFromError();
            return;
        }

        globalStore.game.getState().competitionGroup = group.id;
        const state = {
            started:false
        };
        const gameDefinition = {
            type:"competition",
            subType:"1",
            courseId:group.courseId
        };
        gameState.courseId = group.courseId;
        const room = await colyseus.joinOrCreate(`competition-group`, {
            realm,
            groupId:group.id,
            user:{
                ...user,
                avatar:undefined
            },
            userId:user.userId,
            roomInstanceId:`${user.userId}-${Date.now()}`,
            PlayFabId, lobbySessionId:reconnectableLobbyRoom.sessionId, clientInfo,
            gameDefinition
        });
        await waitForInitialisedState(room);

        let timeInterval;

        room.onMessage(MESSAGES.START, ({startTime, duration, serverTime})=>{ //TODO adjust unsync clock with server offset: ;
            const localStartTime = startTime - (serverTime-Date.now());
            //TODO duplicated code, abstract to service

            topBar.show();
            topBar.updateTime(0);
            timeInterval = setInterval(()=>{
                if(!clientGolfPlay) return;
                if(!state.started && localStartTime <= Date.now()){
                    state.started = true;
                    clientGolfPlay.start();
                    gameState.starting = false;
                }
                if(state.started){
                    if((localStartTime + (duration*1000)) < Date.now()) {
                        clearInterval(timeInterval);
                        topBar.updateTime(0);
                    }else{
                        topBar.updateTime((localStartTime + (duration * 1000)) - Date.now());
                    }
                }
            }, 300);
        });

        const userDataState = globalStore.userData?.getState();
        userDataState.GC = userDataState.GC-20;
        onStart();
        //let competition = createCompetitionGroupScene(root, {room});
        const golfclubs = userDataState.golfclubs;
        const activeGolfClub = golfclubs.find(item => item.CustomData?.tokenId === userDataState.activeGolfClubTokenId) || golfclubs.find(item => item.ItemId === "golfclub-1");

        let clientGolfPlay = await createClientGolfPlay(root,
            {
                gameType:"competition",
                gameDefinition,
                room,
                golfclub:{
                    id:activeGolfClub.ItemId.replace('golfclub-',''),
                    power:Number(activeGolfClub.CustomData?.attribute_power || 0),
                    control:Number(activeGolfClub.CustomData?.attribute_control || 0),
                    aim:Number(activeGolfClub.CustomData?.attribute_aim || 0),
                },
                colyseus
            });
        clientGolfPlay.onFinish(async (leaveCode) => {
            clearInterval(timeInterval);
            clientGolfPlay.dispose();
            clientGolfPlay = null;
          //  competitionMenu.show();
            topBar.hide();//TODO use globalState.game.playing?
            onFinish(leaveCode);
        });

        clientGolfPlay.onComplete(async ({xp, GC, time, shoots})=>{
            await sleep(1000);
            reproduceAvatarSound("success");
            getCenterPopup().showPlayResult({xp, GC, time, shoots});
        });
    }

    async function resetFromError(){
        await sleep(5000);
        fadeOutOverlay(1);
        gameState.playing = false;
        gameState.starting = false;
      //  competitionMenu.show();
    }
};

export {
    createLobbyCompetition
};


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
