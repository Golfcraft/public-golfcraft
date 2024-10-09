import { NPC, Dialog } from '@dcl/npc-scene-utils'
import {globalStore} from "../../../services/globalStore/globalStore";
import {getTopBar} from "../../ui/topbar";
import {reproduceAvatarSound} from "../../../services/avatar-sound";
import {fadeInOverlay} from "../../ui/overlay";
import {sleep, waitFor} from "../../../../../common/utils";
import {GameDefinition} from "../../../../../common/game-definition-type";
import MESSAGE from "../../../../../server/rooms/mesages";
import {refreshUserData} from "../../../services/userData";
import {getCenterPopup} from "../../ui/centerpanel";
import { signedFetch } from '@decentraland/SignedFetch';
import {getMusicForCollection, reproduceMapMusic, stopMapMusic} from "../../../services/map-music";
import {GolfplayClientFactory} from "../golfplay-client";
import {atlasAnalytics} from "../../../atlas-analytics-service";
import {LEAVE_CODE, USE_REMOTE_SERVER} from "../../../../../common/constants";
declare const setInterval;
declare const clearInterval;
declare const setTimeout;
var current_map = 0;
var shift_pressed: boolean = false

export const createDebugMode = (parent, {root, position, colyseus, clientInfo, PlayFabId, user, realm,onStart, onFinish}) => {
    const {createClientGolfPlay} = GolfplayClientFactory({golfplayBaseUrl:engine["__COURSE_MODELS_BASE__"]})
    const gameState = globalStore.game.getState();
    const userDataState = globalStore.userData.getState();
    if(gameState.playing || gameState.starting) return;
    const topBar = getTopBar();
    var room

    /*const {statistic_current_mission} = globalStore.userData.getState();
    var current_mission = statistic_current_mission || 1;
    console.log("current_mission: ", current_mission);

    globalStore.userData.onChange(({newValue})=>{
        current_mission = newValue;
        set_container();
    }, "statistic_current_mission")*/

    const input = Input.instance

    // Pressing 1
    input.subscribe("BUTTON_DOWN", ActionButton.ACTION_3, false, (e) => {
        if (!shift_pressed) return;
        if (!gameState.playing && !gameState.editing) {
            requestStartMission();
        }
    })

    // Pressing 2
    input.subscribe("BUTTON_DOWN", ActionButton.ACTION_4, false, (e) => {
        if (!shift_pressed) return;
        room?.leave();
        //topBar.hide();
        //clientGolfPlay.dispose();
        //onFinish(LEAVE_CODE.TIMEOUT);
    })

    // Pressing Shift
    input.subscribe("BUTTON_DOWN", ActionButton.WALK, false, (e) => {
        shift_pressed = true;
    })

    // Releasing shift
    input.subscribe("BUTTON_UP", ActionButton.WALK, false, (e) => {
        shift_pressed = false;
    })

    return {
        show,
        hide
    }

    async function requestStartMission(){
        const state = {
            started:false
        };
        atlasAnalytics.submitGenericEvent(`gbc-stating-debug-mission`);
        //const music = getMusicForCollection(0);
        //reproduceMapMusic(music);
        //adeInOverlay(1);
        gameState.starting = true;
        gameState.playing = true;

        await sleep(1000);
        onStart();//will hide lobby
        let clientGolfPlay;

        const maps = [
            "mission-1",
            "mission-2",
            "mission-3",
            "mission-4",
            "mission-5",
            "Camino 4.4",
            "Recta 27",
            "Camino 46",
            "Aim 3",
            "Camino 2.1",
            "Camino 1.4",
            "Camino 1.3",
            "Camino 1.1",
        ] 

        const gameDefinition:GameDefinition = {
            type:"competition",
            subType: "1",
            courseId: maps[current_map], 
        };

        current_map += 1;
        if (current_map >= maps.length){
            current_map = 0;
        }

        log("DEBUGMODE: map ", current_map)

        gameState.courseId = null;
        //const room = await colyseus.joinOrCreate(`mission-room`, {
        room = await colyseus.joinOrCreate(`test-room`, {
            user:{...user, avatar:undefined},
            realm,
            userId:user.userId,
            roomInstanceId:`${user.userId}-${Date.now()}`,
            PlayFabId, gameDefinition, clientInfo
        }).then(r=>r, (err)=>{
            console.log("PROBLEM JOINING ROOM", err)
        });
        await waitForInitialisedState(room);
        console.log("ROOM INITIALIZED");
        let timeInterval;
        let timeIntervalCount = 0;
        let stopInterval = false;

        room.onMessage(MESSAGE.START, ({startTime, duration, serverTime})=>{
            const localStartTime = startTime - (serverTime-Date.now());
            console.log("localStartTime",  localStartTime - Date.now())
            console.log("START", JSON.stringify(state), Date.now(), startTime, localStartTime, serverTime);
            topBar.show();
            intervalCheck();

            async function intervalCheck(){
                //console.log("intervalCheck", localStartTime <= Date.now());
                if(!state.started && localStartTime <= Date.now()){
                    state.started = true;
                    await waitFor(() => clientGolfPlay?.start, 200, ()=>{
                        //console.log("clientGolfPlay not initialized", clientGolfPlay)
                    });
                    clientGolfPlay.start();
                    gameState.starting = false;
                }else if(!state.started){
                    topBar.updateTime(localStartTime - Date.now());
                    //console.log("not yet", timeInterval, localStartTime, Date.now())
                }

                if(state.started){
                    if((localStartTime + ( duration * 1000 )) < Date.now()) {
                        // clearInterval(timeInterval);
                        stopInterval = true;
                        topBar.updateTime(0);
                    } else {
                        const clockTime = (localStartTime + (duration * 1000)) - Date.now();
                        //console.log("clockTime", localStartTime, duration)
                        // console.log("started and setting clock to ",clockTime);
                        topBar.updateTime(clockTime);
                    }
                }

                if(!stopInterval) setTimeout(intervalCheck, 200);
            }
        });

        const golfclubs = userDataState.golfclubs;
        const activeGolfClub = golfclubs.find(item => item.CustomData?.tokenId === userDataState.activeGolfClubTokenId) || golfclubs.find(item => item.ItemId === "golfclub-1");
        const expressionState = {};
        room.onMessage(MESSAGE.VARIABLE_INITIALIZATION, (data)=>{
            Object.assign(expressionState, data);
        });
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
            wip:true,
            colyseus,
            expressionState
        });
        console.log("clientGolfPlay created");
        clientGolfPlay.onFinish(async (leaveCode) => {
            //stopMapMusic(music);
            console.log("onFinish", leaveCode)
            //clearInterval(timeInterval);
            stopInterval = true;
            clientGolfPlay.dispose();
            clientGolfPlay = null;
            topBar.updateTime(0);
            topBar.hide();
            onFinish(leaveCode);
            await sleep(4000);
            await refreshUserData();
        });

        clientGolfPlay.onComplete(async ({xp, GC, PT, time, shoots, materialDrops})=>{
            //completed_mission = true;
            await sleep(1000);
            reproduceAvatarSound("success");
            getCenterPopup().showPlayResult({xp, PT, GC, time, shoots, materialDrops});
        });

        room.send(MESSAGE.READY);
    }

    function show(){
        //NPC_scientist.setParent(parent);
        //container_sound.setParent(parent);
        //set_container();
    }
    function hide(){
        //source_teleport.playing = false; // Preventing playing teleport sound on show
        //engine.removeEntity(NPC_scientist);
        //engine.removeEntity(container1);
        //engine.removeEntity(container2);
        //engine.removeEntity(container_sound);
    }
}


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


