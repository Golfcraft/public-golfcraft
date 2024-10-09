import {globalStore} from "../../../services/globalStore/globalStore";
import {getTopBar} from "../../ui/topbar";
import {reproduceAvatarSound} from "../../../services/avatar-sound";
import {fadeInOverlay} from "../../ui/overlay";
import {sleep} from "../../../../../common/utils";
import {GameDefinition} from "../../../../../common/game-definition-type";
import MESSAGE from "../../../../../server/rooms/mesages";
import {setTimeout} from "@dcl/ecs-scene-utils";
import {GolfplayClientFactory} from "../golfplay-client";
import {refreshUserData} from "../../../services/userData";
import {getCenterPopup} from "../../ui/centerpanel";

//TODO REVIEW: NOT USED IN PRODUCTION
export const createNpcTest = (parent, {root, position, colyseus, clientInfo, PlayFabId, user, realm,onStart, onFinish}) => {
    const {createClientGolfPlay} = GolfplayClientFactory({golfplayBaseUrl:engine["__COURSE_MODELS_BASE__"]})
    const gameState = globalStore.game.getState();
    const userDataState = globalStore.userData.getState();
    if(gameState.playing || gameState.starting) return;
    const topBar = getTopBar();
    const entity = new Entity();
    entity.addComponent(new BoxShape());
    entity.addComponent(new Transform({position}));
    entity.addComponent(new OnPointerDown(requestStartTraining,{
        hoverText:"Start mission"
    }));
    entity.setParent(parent);
    //TODO create npc on this entity and remove the BoxShape

    return {
        show,
        hide
    }

    async function requestStartTraining(){
        const state = {
            started:false
        };

        setTimeout(2500,()=>{ reproduceAvatarSound("intro"); });
        fadeInOverlay(1);
        gameState.starting = true;
        gameState.playing = true;

        const {currentMission} = globalStore.userData.getState();
        await sleep(1000);
        onStart();//will hide lobby
        let clientGolfPlay;

        const gameDefinition:GameDefinition = {
            type:"competition",
            subType: "1",
            courseId: `mission-${currentMission||1}`,
        };
        gameState.courseId = null;
        const room = await colyseus.joinOrCreate(`mission-room`, {
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
        clientGolfPlay.onFinish(async (leaveCode) => {
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
            await sleep(1000);
            reproduceAvatarSound("success");
            getCenterPopup().showPlayResult({xp, PT, GC, time, shoots, materialDrops});
        });
    }

    function show(){
        //TODO activate npc if necessary
        entity.setParent(parent)
    }
    function hide(){
        //TODO deactivate npc if necessary
        entity.setParent(null);
        engine.removeEntity(entity);
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
