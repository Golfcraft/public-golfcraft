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
import {USE_REMOTE_SERVER} from "../../../../../common/constants";
declare const setInterval;
declare const clearInterval;
declare const setTimeout;

var NPC_scientist;
var container1:Entity;
var container2:Entity;
var container_sound:Entity;
// TODO change text on new session
var first_time:boolean = true;
var completed_mission:boolean = false;
const portraits = {
    "smailing": { path: 'images/NPC/expresion1.png' },
    "concerned": { path: 'images/NPC/expresion2.png' },
    "happy": { path: 'images/NPC/expresion3.png' },
    "disappointed": { path: 'images/NPC/expresion4.png' },
    "shame": { path: 'images/NPC/expresion5.png' },
}
const animations = {
    "talking": "0_Hablando_Normal",
    "upset": "1_Angustiado",
    "wins": "2_Jugador_Gana_Partida",
    "fails": "3_Jugador_Pierde_Partida",
    "container1": "4_Mirando_Contenedor_01",
    "container2": "5_Mirando_Contenedor_02",
    "danger": "6_Escapan_Esferas"
}

export const createNpcTest = (parent, {root, position, colyseus, clientInfo, PlayFabId, user, realm,onStart, onFinish}) => {
    const {createClientGolfPlay} = GolfplayClientFactory({golfplayBaseUrl:engine["__COURSE_MODELS_BASE__"]})
    const gameState = globalStore.game.getState();
    const userDataState = globalStore.userData.getState();
    if(gameState.playing || gameState.starting) return;
    const topBar = getTopBar();

    const {statistic_current_mission, statistic_paella_wearable} = globalStore.userData.getState();
    var current_mission = statistic_current_mission || 1;
    var paellaWearable = statistic_paella_wearable || 0;

    console.log("current_mission: ", current_mission);

    globalStore.userData.onChange(({newValue})=>{
        current_mission = newValue;
        set_container();
    }, "statistic_current_mission")

    const clip_teleport = new AudioClip("sound/sphere_teleporter.mp3");
    const source_teleport = new AudioSource(clip_teleport);
    source_teleport.playing = false;
    source_teleport.loop = false;
    source_teleport.volume = 1;
    container_sound = new Entity();
    container_sound.addComponent(source_teleport);
    container_sound.addComponent(new Transform({
        position: new Vector3(0.5, 1.1, 8)
    }));

    const clip_electricity = new AudioClip("sound/electricity.mp3");
    const source_electricity = new AudioSource(clip_electricity);
    //source_electricity.playing = true;
    source_electricity.loop = true;
    source_electricity.volume = 0.01;
    var container_idle;
    var container_scape;
    var container_spheres = [];
    container1 = new Entity();
    container1.addComponent(new GLTFShape("models/NPC_Container_01.glb"));
    container1.addComponent(source_electricity);
    container1.addComponent(new Transform({
        position: new Vector3(0.5, 1.1, 8),
        rotation: Quaternion.Euler(0, -90, 0)
    }));
    container1.addComponent(new Animator());
    container_idle = new AnimationState("0. Idle");
    container_scape = new AnimationState("1. Escape");
    container_scape.looping = false;
    container1.getComponent(Animator).addClip(container_idle);
    container1.getComponent(Animator).addClip(container_scape);
    container_idle.play(); 

    container2 = new Entity();
    container2.addComponent(new GLTFShape("models/NPC_Container_02.glb"));
    container2.addComponent(source_electricity);
    container2.addComponent(new Transform({
        position: new Vector3(0.5, 1.1, 8)
    }));
    container2.addComponent(new Animator());
    container_spheres.push(new AnimationState("0_Spheres"));
    container_spheres.push(new AnimationState("1_Spheres"));
    container_spheres.push(new AnimationState("2_Spheres"));
    container_spheres.push(new AnimationState("3_Spheres"));
    container_spheres.push(new AnimationState("4_Spheres"));
    container_spheres.push(new AnimationState("5_Spheres"));
    container2.getComponent(Animator).addClip(container_spheres[0]);
    container2.getComponent(Animator).addClip(container_spheres[1]);
    container2.getComponent(Animator).addClip(container_spheres[2]);
    container2.getComponent(Animator).addClip(container_spheres[3]);
    container2.getComponent(Animator).addClip(container_spheres[4]);
    container2.getComponent(Animator).addClip(container_spheres[5]);
    container_spheres[0].play();

    NPC_scientist = new NPC(
        {
            position: new Vector3(2, 1.1, 8)
        },
        'models/NPC.glb',
        onActivateExecuteDialog,
        {
            faceUser: false,
            portrait: portraits["smailing"],
            idleAnim: current_mission <= 1 ? animations["container1"] : animations["container2"],
            reactDistance: 5,
            onlyClickTrigger: current_mission >= 7,
            hoverText: "Start mission",
            coolDownDuration: 1,
            continueOnWalkAway: false,
            onWalkAway: () => {
                if (current_mission <= 1) {
                    NPC_scientist.changeIdleAnim(animations["container1"], true);
                } else {
                    NPC_scientist.changeIdleAnim(animations["container2"], true);
                }
            }
            //onlyClickTrigger: true,
            //onlyETrigger: false
        }
    );

    return {
        show,
        hide
    }


    function set_container() {
        // Show old container
        // If mission == 1
        // If mission == 2 but is not first time and mission was completed
        console.log("set_container", current_mission, first_time, completed_mission);
        if (current_mission < 2 || (current_mission == 2 && !first_time && completed_mission)) {
            container1.setParent(parent);
            engine.removeEntity(container2);
        } else {
            container2.setParent(parent);
            engine.removeEntity(container1);
            if (first_time || !completed_mission) {
                set_spheres(current_mission-2);
            } else {
                set_spheres(current_mission-3);
            }
        }
    }

    function set_spheres(amount_spheres:number) {
        try{
            if (amount_spheres < 0) {
                amount_spheres = 0;
            }
            if (amount_spheres == 0) {
                source_electricity.volume = 0;
            } else {
                source_electricity.volume = 0.05;
            }
            container_spheres[0].stop();
            container_spheres[1].stop();
            container_spheres[2].stop();
            container_spheres[3].stop();
            container_spheres[4].stop();
            container_spheres[5].stop();
            container_spheres[Math.min(amount_spheres,5)].play();
        }catch(err){
            console.error(err)
        }
    }

    async function requestStartMission(){
        const state = {
            started:false
        };
        atlasAnalytics.submitGenericEvent(`gbc-stating-npc-mission`);
        const music = getMusicForCollection(0);
        reproduceMapMusic(music);
        fadeInOverlay(1);
        gameState.starting = true;
        gameState.playing = true;
        first_time = false;

        await sleep(1000);
        onStart();//will hide lobby
        let clientGolfPlay;

        const gameDefinition:GameDefinition = {
            type:"competition",
            subType: "1",
            courseId: `mission-${current_mission||1}`,
        };
        completed_mission = false;

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
        room.onMessage(MESSAGE.VARIABLE_INITIALIZATION, (data)=>{
            Object.assign(expressionState, data);
        });
        room.onMessage(MESSAGE.START, ({startTime, duration, serverTime})=>{
            const localStartTime = startTime - (serverTime-Date.now());
            console.log("localStartTime",  localStartTime - Date.now())
            console.log("START", JSON.stringify(state), Date.now(), startTime, localStartTime, serverTime);
            topBar.show();
            intervalCheck();

            async function intervalCheck(){
                console.log("intervalCheck", localStartTime <= Date.now());
                if(!state.started && localStartTime <= Date.now()){
                    state.started = true;
                    await waitFor(() => clientGolfPlay?.start, 200, ()=>{
                        console.log("clientGolfPlay not initialized", clientGolfPlay)
                    });
                    clientGolfPlay.start();
                    gameState.starting = false;
                }else if(!state.started){
                    topBar.updateTime(localStartTime - Date.now());
                    console.log("not yet", timeInterval, localStartTime, Date.now())
                }

                if(state.started){
                    if((localStartTime + ( duration * 1000 )) < Date.now()) {
                        // clearInterval(timeInterval);
                        stopInterval = true;
                        topBar.updateTime(0);
                    } else {
                        const clockTime = (localStartTime + (duration * 1000)) - Date.now();
                        console.log("clockTime", localStartTime, duration)
                        // console.log("started and setting clock to ",clockTime);
                        topBar.updateTime(clockTime);
                    }
                }

                if(!stopInterval) setTimeout(intervalCheck, 200);
            }
        });
        await waitForInitialisedState(room);
        console.log("ROOM INITIALIZED");
        let timeInterval;
        let timeIntervalCount = 0;
        let stopInterval = false;



        const golfclubs = userDataState.golfclubs;
        const activeGolfClub = golfclubs.find(item => item.CustomData?.tokenId === userDataState.activeGolfClubTokenId) || golfclubs.find(item => item.ItemId === "golfclub-1");
        const expressionState = {};

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
        console.log("clientGolfPlay created");
        clientGolfPlay.onFinish(async (leaveCode) => {
            stopMapMusic(music);
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
            completed_mission = true;
            await sleep(1000);
            reproduceAvatarSound("success");
            getCenterPopup().showPlayResult({xp, PT, GC, time, shoots, materialDrops});
        });

        room.send(MESSAGE.READY);
    }

    function show(){
        NPC_scientist.setParent(parent);
        container_sound.setParent(parent);
        set_container();
    }
    function hide(){
        source_teleport.playing = false; // Preventing playing teleport sound on show
        engine.removeEntity(NPC_scientist);
        engine.removeEntity(container1);
        engine.removeEntity(container2);
        engine.removeEntity(container_sound);
    }
let locading = false;
    async function onActivateExecuteDialog() {
        if(locading) return;
        NPC_scientist.talk([{text:"Hi..."}]);
        locading = true;
        let NPCDialog: Dialog[] = [];
        if(current_mission >= 7){
            const baseURLAPI = USE_REMOTE_SERVER?`https://golfcraftgame.com`:`http://localhost:2569`;
            const checkedMission =await fetch(`${baseURLAPI}/api/check-npc-mission`, {
                method:"POST", headers:{"Content-Type":"application/json"},
                body:JSON.stringify({
                    PlayFabId
                })
            }).then(r=>r.json()).then(j=>j.current_mission);
            console.log("checkedMission",checkedMission, "current_mission",current_mission);

            if(checkedMission != current_mission){
                globalStore.userData.getState().statistics_current_misison = current_mission = checkedMission;
            }
        }
        if (current_mission <= 1) {
            if (first_time || completed_mission) {
                NPC_scientist.changeIdleAnim(animations["talking"], true);
                NPCDialog = [
                    {
                        text: "Welcome! You are the new intern, right?\n\nYou've arrived at the perfect time ...",
                        portrait: portraits["smailing"],
                        audio: getSound()
                    },
                    {
                        text: "I need one additional energy sphere from ancient Egypt,\n\nbut I'ld rader keep an eye here\nin case this became unstable ...",
                        portrait: portraits["concerned"],
                        audio: getSound()
                    },
                    {
                        text: "Help me catch one energy sphere and you will get a secret emote\n\nJust push it to the hole ...",
                        portrait: portraits["smailing"],
                        audio: getSound(),
                    },
                    {
                        text: "Don't get sunburned, and come here when you are done!",
                        portrait: portraits["smailing"],
                        triggeredByNext: () => {
                            requestStartMission();
                        },
                        isEndOfDialog: true,
                        audio: getSound()
                    },
                ]
            } else {
                NPC_scientist.changeIdleAnim(animations["fails"], true);
                NPCDialog = getTryAgainDialogue();
            }
        } else if (current_mission == 2) {
            if (first_time || completed_mission) {
                if (completed_mission) {
                    NPC_scientist.changeIdleAnim(animations["wins"], true);
                    NPCDialog = [
                        {
                            text: "Wow!\nCan't believe you managed to catch it! ...",
                            portrait: portraits["happy"],
                            triggeredByNext: () => {
                                NPC_scientist.changeIdleAnim(animations["talking"], true);
                            },
                            audio: getSound()
                        },
                        {
                            text: "I mean ... Of course you are fine ...\nno risk at all on working with unlimited sources of energy ...",
                            portrait: portraits["shame"],
                            triggeredByNext: () => {
                                NPC_scientist.changeIdleAnim(animations["container1"], true);
                            },
                            audio: getSound()
                        },
                        {
                            text: "Just let me store this one, and ...",
                            portrait: portraits["smailing"],
                            triggeredByNext: () => {
                                container_scape.play();
                                source_teleport.playOnce();
                            },
                            audio: getSound()
                        },
                        {
                            text: "Oh no! ...", 
                            portrait: portraits["disappointed"],
                            triggeredByNext: () => {
                                NPC_scientist.changeIdleAnim(animations["danger"], true);
                            },
                            audio: getSound()
                        },
                        {
                            text: "No no no! ...", 
                            portrait: portraits["disappointed"],
                            audio: getSound()
                        },
                        {
                            text: "Four spheres scaped back to ancient Egypt ...",
                            portrait: portraits["concerned"],
                            triggeredByNext: () => {
                                NPC_scientist.changeIdleAnim(animations["upset"], true);
                                source_electricity.volume = 0;
                            },
                            audio: getSound()
                        },
                        {
                            text: "Luckily I've you now. Go and catch them all ...",
                            portrait: portraits["shame"],
                            audio: getSound(),
                        },
                        {
                            text: "Find me when you are done.",
                            portrait: portraits["smailing"],
                            triggeredByNext: () => {
                                requestStartMission();
                            },
                            isEndOfDialog: true,
                            audio: getSound()
                        },
                    ]
                } else {
                    NPC_scientist.changeIdleAnim(animations["talking"], true);
                    NPCDialog = [
                        {
                            text: "Finally!\nYou are back! ...",
                            portrait: portraits["happy"],
                            audio: getSound()
                        },
                        {
                            text: "Do you like my new container? ...",
                            portrait: portraits["happy"],
                            audio: getSound()
                        },
                        {
                            text: "Remember, four spheres scaped to ancient Egypt ...",
                            portrait: portraits["concerned"],
                            triggeredByNext: () => {
                                NPC_scientist.changeIdleAnim(animations["upset"], true);
                            },
                            audio: getSound()
                        },
                        {
                            text: "Go and catch them all ...",
                            portrait: portraits["shame"],
                            triggeredByNext: () => {
                                NPC_scientist.changeIdleAnim(animations["talking"], true);
                            },
                            audio: getSound(),
                        },
                        {
                            text: "I've some work to do here.",
                            portrait: portraits["smailing"],
                            triggeredByNext: () => {
                                NPC_scientist.changeIdleAnim(animations["upset"], true);
                                requestStartMission();
                            },
                            isEndOfDialog: true,
                            audio: getSound()
                        },
                    ]
                }
            } else {
                NPC_scientist.changeIdleAnim(animations["fails"], true);
                NPCDialog = getTryAgainDialogue();
            }
        } else if (current_mission == 3) {
            if (first_time || completed_mission) {
                if (completed_mission) {
                    NPC_scientist.changeIdleAnim(animations["wins"], true);
                    NPCDialog = [
                        {
                            text: "Nice work catching the first sphere!\nReady to get the next one? ...",
                            portrait: portraits["happy"],
                            triggeredByNext: () => {
                                set_spheres(1);
                            },
                            audio: getSound(),
                        },
                        {
                            text: "Don't take too long! Three spheres to go!",
                            portrait: portraits["smailing"],
                            triggeredByNext: () => {
                                requestStartMission();
                            },
                            isEndOfDialog: true,
                            audio: getSound()
                        },
                    ]
                } else {
                    NPC_scientist.changeIdleAnim(animations["talking"], true);
                    NPCDialog = [
                        {
                            text: "Hi again!\nTime to get the second sphere ...",
                            portrait: portraits["smailing"],
                            audio: getSound(),
                        },
                        {
                            text: "Let me know when you have it! Only three left!",
                            portrait: portraits["smailing"],
                            triggeredByNext: () => {
                                requestStartMission();
                            },
                            isEndOfDialog: true,
                            audio: getSound()
                        },
                    ]
                }
            }else {
                NPC_scientist.changeIdleAnim(animations["fails"], true);
                NPCDialog = getTryAgainDialogue();
            }
        } else if (current_mission == 4) {
            if (first_time || completed_mission) {
                NPC_scientist.changeIdleAnim(animations["wins"], true);
                if (completed_mission) {
                    NPCDialog = [
                        {
                            text: "Two spheres! You are getting good at this!\n\nGoin to retrieve one more? ...",
                            portrait: portraits["happy"],
                            triggeredByNext: () => {
                                set_spheres(2);
                            },
                            audio: getSound(),
                        },
                        {
                            text: "Take some pics! Two more and we are done!",
                            portrait: portraits["smailing"],
                            triggeredByNext: () => {
                                requestStartMission();
                            },
                            isEndOfDialog: true,
                            audio: getSound()
                        },
                    ]
                } else {
                    NPC_scientist.changeIdleAnim(animations["talking"], true);
                    NPCDialog = [
                        {
                            text: "Hello there!\n\nCan't wait to have the next sphere! ...",
                            portrait: portraits["smailing"],
                            audio: getSound(),
                        },
                        {
                            text: "We are half way there!",
                            portrait: portraits["smailing"],
                            triggeredByNext: () => {
                                requestStartMission();
                            },
                            isEndOfDialog: true,
                            audio: getSound()
                        },
                    ]
                }
            }else {
                NPC_scientist.changeIdleAnim(animations["fails"], true);
                NPCDialog = getTryAgainDialogue();
            }
        } else if (current_mission == 5) {
            if (first_time || completed_mission) {
                if (completed_mission) {
                    NPC_scientist.changeIdleAnim(animations["wins"], true);
                    NPCDialog = [
                        {
                            text: "Three spheres! The golfclub and you are becoming one!\n\nYou should name it ...",
                            portrait: portraits["happy"],
                            triggeredByNext: () => {
                                NPC_scientist.changeIdleAnim(animations["talking"], true);
                                set_spheres(3);
                            },
                            audio: getSound()
                        },
                        {
                            text: "Ready to get the last sphere? ...",
                            portrait: portraits["happy"],
                            audio: getSound(),
                        },
                        {
                            text: "See you on the other side!",
                            portrait: portraits["smailing"],
                            triggeredByNext: () => {
                                requestStartMission();
                            },
                            isEndOfDialog: true,
                            audio: getSound()
                        },
                    ]
                } else {
                    NPC_scientist.changeIdleAnim(animations["talking"], true);
                    NPCDialog = [
                        {
                            text: "Oh you are back!\n\nThis one is the last one! ...",
                            portrait: portraits["smailing"],
                            audio: getSound(),
                        },
                        {
                            text: "I will've something for you when you're back!",
                            portrait: portraits["smailing"],
                            triggeredByNext: () => {
                                requestStartMission();
                            },
                            isEndOfDialog: true,
                            audio: getSound()
                        },
                    ]
                }
            }else {
                NPC_scientist.changeIdleAnim(animations["fails"], true);
                NPCDialog = getTryAgainDialogue();
            }
        } else if (current_mission === 6) {
            NPC_scientist.changeIdleAnim(animations["wins"], true);
            NPCDialog = [
                {
                    text: "You are amazing!\n\nYou did it! ...",
                    portrait: portraits["happy"],
                    triggeredByNext: () => {
                        NPC_scientist.changeIdleAnim(animations["talking"], true);
                        set_spheres(4);
                    },
                    audio: getSound()
                },
                {
                    text: "I'll be sending you an Emote with the secret Golfcraft greeting.\n\nYou earned it!",
                    portrait: portraits["smailing"],
                    isEndOfDialog: true,
                    triggeredByNext:()=>{
                        var data = JSON.stringify({
                            address: user.publicKey,
                            PlayFabId,
                            itemId: 0,
                            displayName:user.displayName
                        });
                        signedFetch("https://golfcraftgame.com/bridge/claim-emote",{
                            method:"post",
                            body:data,
                            headers:{
                                "Content-Type":"application/json"
                            }
                        });
                        current_mission = 7
                    },
                    audio: getSound()
                },
            ]
        } else if(current_mission == 7){//have received emote and must upgrade golfclub aim
            NPC_scientist.changeIdleAnim(animations.talking, true);
            NPCDialog = [
                //TODO here we need to tell next mission: give 10 wood to the player to improve the golfclub
                //TODO explain the use of "aim"
                {
                    text: "Yohoo! you have received your <color=#ff00ff>golf emote (NFT) </color>!",
                    portrait: portraits["happy"],
                    audio: getSound()
                },
                {
                    text: "Do you want to win more <color=#ff00ff>NFT</color> prizes.\n Let's continue!",
                    portrait: portraits["smailing"],
                    audio: getSound()
                },
                {
                    text: "You can improve the <color=#0000ff>aim</color> of your golf club. Before shooting, a line will appear to help you aim, as bigger number you have on \"aim\", the longer the line will be",
                    portrait: portraits["concerned"],
                    audio: getSound()
                },
                {
                    text: "You will need <color=#D86319>10 wood</color> to improve <color=#0000ff>aim</color>\nback, there is a screen where you can improve your golfclub.\n\nI wait you here",
                    portrait: portraits["concerned"],
                    audio: getSound()
                },
            ];
            await refreshUserData();
        } else if(current_mission == 8){//should reach Stone rank
            NPC_scientist.changeIdleAnim(animations.wins, true);
            NPCDialog = [{
                text: "Great! You have improved you golf club.\n Now you are ready to compete.\n Lets win an <color=#ff00ff>NFT wearable</color>",
                portrait: portraits.happy,
                audio: getSound()
            },{
                text:`In that wall you can see some screens to play\n<color=#D86319>multiplayer "Season" game mode.</color>\n Go play and reach <color=#0000ff>STONE</color> rank\nYou will receive <color=#ff00ff>NFT wearable</color> then.`,
                portrait: portraits.happy,
                audio: getSound()
            }];
        } else if(current_mission === 9){
            NPC_scientist.changeIdleAnim(animations.wins, true);
            NPCDialog = [{
                text: "Congrats for reaching <color=#0000ff>STONE</color> rank!.\n You will receive a <color=#ff00ff>NFT wearable</color>",
                portrait: portraits.happy,
                audio: getSound()
            }];
        }

        NPCDialog[NPCDialog.length-1].isEndOfDialog = true;
        NPC_scientist.talk(NPCDialog, 0);
        locading = false;
     }
    
    
     function getSound(_sound_id?): string {
        var sound_id = _sound_id || Math.floor(Math.random() * 3) + 1
        return "sounds/NPC/npc_"+sound_id+".mp3" 
     }

     function getTryAgainDialogue() {
        var tips = [
            "Check the controls on the right bottom corner of the screen ...",
            "Use the ramps to jump across long distances ...",
            "Try hitting the interactive parts (switches and areas) ...",
            "Use the environment at your advantage ...",
            "You almost have it! You need to be faster and you will have your reward...",
            "You almost have it! You need to be faster and you will have your reward...",
        ]
        const selected_tip = tips[current_mission-1];
        return [
            {
                text: "Lets try again\n\nWe have "+current_mission+" spheres out of four.",
                portrait: portraits["disappointed"],
                triggeredByNext: () => {
                    NPC_scientist.changeIdleAnim(animations["talking"], true);
                },
                audio: getSound(),
            },
            {
                text: selected_tip,
                portrait: portraits["disappointed"],
                audio: getSound(),
            },
            {
                text: "I'll be right here!",
                portrait: portraits["smailing"],
                triggeredByNext: () => {
                    requestStartMission();
                },
                isEndOfDialog: true,
                audio: getSound()
            }
        ]
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


