import {createTournamentPanel} from "../tournament-panel";
import {GolfplayClientFactory} from "./golfplay-client";
import {globalStore} from "../../services/globalStore/globalStore";
import { reproduceAvatarSound } from "../../services/avatar-sound";
import {fadeInOverlay, fadeOutOverlay} from "../ui/overlay";
import {sleep, waitFor} from "../../../../common/utils";
import {getTopBar} from "../ui/topbar";
import {LEAVE_CODE, USE_REMOTE_SERVER} from "../../../../common/constants";
import {movePlayerTo} from "@decentraland/RestrictedActions";
import {refreshLeaderboard, refreshUserData} from "../../services/userData";
import {getCenterPopup} from "../ui/centerpanel";
import MESSAGE from "../../../../server/rooms/mesages";
import {createTrainingLeaderboardPanel} from "./training/training-leaderboard-panel";
import {getMusicForCollection, reproduceMapMusic, stopMapMusic} from "../../services/map-music";
import { PANELS } from "./building";
import {createLiveTournamentPanel} from "../live-tournament-panel";

const userAgent = globalThis?.navigator?.userAgent;
const language = globalThis?.navigator?.language;
const platform = globalThis?.navigator?.platform;
const clientInfo = {userAgent, language, platform};

export const createLobbyTournament = (entity, {root, colyseus, user, realm, PlayFabId, onStart, onFinish, servers})=>{
    console.log("createLobbyTournament")
    const {createClientGolfPlay} = GolfplayClientFactory({golfplayBaseUrl:engine["__COURSE_MODELS_BASE__"]});

    createTrainingLeaderboardPanel(entity, {
        position: PANELS.TOURNAMEND_LEADERBOARD.position,
        rotation: PANELS.TOURNAMEND_LEADERBOARD.rotation,
        title:"TOURNAMENT STAR POINTS",
        StatisticName:"won:SR"
    });
    refreshLeaderboard("won:SR");
    const userDataState = globalStore.userData.getState();
    const gameState = globalStore.game.getState();
    const tournamentPanel = createTournamentPanel(entity, {
        position: PANELS.TOURNAMENT.position,
        rotation: PANELS.TOURNAMENT.rotation,
    });
    tournamentPanel.onPlay(async (tournamentData)=>{
        if(gameState.playing || gameState.starting) return;
        setTimeout(()=>{ reproduceAvatarSound("intro"); }, 1000);

        const state = {
            started:false,
            music:null
        };

        fadeInOverlay(1);
        gameState.playing = true;
        gameState.starting = true;
        console.log("STARTING");
        tournamentPanel.hide();
        await sleep(1000);
        onStart();//will hide lobby

        const topBar = getTopBar();
        const room = await colyseus.joinOrCreate(`tournament`, {
            user:{
                ...user,
                avatar:undefined
            },
            realm, userId:user.userId, PlayFabId, clientInfo,
            roomInstanceId:`${user.userId}-${Date.now()}`,
            tournamentID:tournamentData.ID,
            code:tournamentData.code
        }).then(r=>r, (err)=>{
            console.log("PROBLEM JOINING ROOM", err)
        });
        const courseId = getCurrentTournamentCourseId(userDataState.user.userId, tournamentData);
        gameState.courseId = courseId;
        let timeInterval;
        let clientGolfPlay;
        console.log("WAITING ROOM INITIALIZED", courseId);
        await waitForInitialisedState(room);
        console.log("ROOM INITIALIZED");
        room.send(MESSAGE.READY);

        room.onMessage(MESSAGE.START, ({startTime, duration, serverTime, collectionId})=>{//TODO duplicated code, abstract to service
            const localStartTime = startTime - (serverTime-Date.now());
            console.log("START", startTime, localStartTime, serverTime);
            topBar.show();
            timeInterval = setInterval(()=>{
                if(!state.started && localStartTime <= Date.now()){
                    if(!collectionId){
                        state.music = getMusicForCollection(0);
                        reproduceMapMusic(state.music);
                    }
                    state.started = true;
                    console.log("STARTED", !!clientGolfPlay);

                    executeTask(async ()=>{
                        await waitFor(()=>clientGolfPlay);
                        clientGolfPlay.start();
                        console.log("clientGolfPlay started")
                    })
                    gameState.starting = false;
                }
                if(state.started){
                    if((localStartTime + ( duration * 1000 )) < Date.now()) {
                        clearInterval(timeInterval);
                        topBar.updateTime(0);
                    } else {
                        topBar.updateTime((localStartTime + (duration * 1000)) - Date.now());
                    }
                }else{
                    topBar.updateTime(localStartTime-Date.now(), false);
                }
            },100);
        });
        const golfclubs = userDataState.golfclubs;
        const activeGolfClub = golfclubs.find(item => item.CustomData?.tokenId === userDataState.activeGolfClubTokenId) || golfclubs.find(item => item.ItemId === "golfclub-1");


        const expressionState = {};
        room.onMessage(MESSAGE.VARIABLE_INITIALIZATION, (data)=>{
            Object.assign(expressionState, data);
        });
        //TODO wait for MESSAGE.START before createClientGolfPlay?

        clientGolfPlay = await createClientGolfPlay(root, {
            gameDefinition:{
                type:"competition",
                subType: "1",
                courseId,
            },
            wip:tournamentData.code === "COCO",
            room,
            golfclub:{//TODO review to remove
                id:activeGolfClub.ItemId.replace('golfclub-',''),
                power:Number(activeGolfClub.CustomData?.attribute_power || 0),
                control:Number(activeGolfClub.CustomData?.attribute_control || 0),
                aim:Number(activeGolfClub.CustomData?.attribute_aim || 0),
            },
            colyseus,
            expressionState
        });
        clientGolfPlay.onFinish(async (leaveCode) => {   //TODO refactor, move callback to responsible domain/service
            //TODO stop music
            stopMapMusic(state.music);
            state.music = null;
            clearInterval(timeInterval);
            clientGolfPlay.dispose();
            clientGolfPlay = null;
            topBar.hide();
            executeTask(async ()=>{
                await sleep(1000);//TODO why we wait? to let server do stuff? -> this is error prone
                await tournamentPanel.refreshData();
                await sleep(1000);
                tournamentPanel.show();
            });
            onFinish(leaveCode);
        });

        clientGolfPlay.onComplete(async ({xp, GC, PT, time, shoots})=>{
            await sleep(1000);
            reproduceAvatarSound("success");
            getCenterPopup().showPlayResult({xp, PT, GC, time, shoots});
        });
    })
/*
    createLiveTournamentPanel(root, {
        colyseus:servers[0].client,
        onStart:()=>onStart(),
        onFinish:()=>onFinish(),
        ...PANELS.LIVE_TOURNAMENT_EU,
    });*/
    console.log("creatingTournamentLobby")
    createLiveTournamentPanel(root, {
        colyseus:servers[0].client,
        onStart:()=>onStart(),
        onFinish:()=>onFinish(),
        ...PANELS.LIVE_TOURNAMENT_US,
    });
        console.log("createdTournamentLobby")
if(!USE_REMOTE_SERVER){
    createLiveTournamentPanel(root, {
        colyseus:servers[1].client,
        onStart:()=>onStart(),
        onFinish:()=>onFinish(),
        ...PANELS.LIVE_TOURNAMENT_LOCAL,
    });
}

    function getCurrentTournamentCourseId(address, tournamentData){
        const participant = tournamentData.participants?.find(p=>p.address.toLowerCase() === address.toLowerCase());
        if(!participant){
            return tournamentData.courses[0];
        }else{
            if(participant.data.courseStates.length
                && participant.data.courseStates[participant.data.courseStates.length-1]?.abandoned
                && !participant.data.courseStates[participant.data.courseStates.length-1]?.finished){
                return tournamentData.courses[participant.data.courseStates.length-1];
            }else{
                return tournamentData.courses[participant.data.courseStates.length];
            }

        }
    }
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
