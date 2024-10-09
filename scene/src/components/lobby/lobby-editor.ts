import {createEditorPanel} from "../../../golfplay/src/editor/editor-panel";
import {createEditor} from "../../../golfplay/src/editor/editor";
import {USE_REMOTE_SERVER} from "../../../../common/constants";
import {reproduceAvatarSound} from "../../services/avatar-sound";
import {fadeInOverlay} from "../ui/overlay";
import {globalStore} from "../../services/globalStore/globalStore";
import {sleep} from "../../../../common/utils";
import {getTopBar} from "../ui/topbar";
import MESSAGE from "../../../../server/rooms/mesages";
import {GolfplayClientFactory} from "./golfplay-client";
import {getCenterPopup} from "../ui/centerpanel";
import {getGLTFShape} from "../../../golfplay/services/resource-repo";
import {getTexture} from "../ui/ui-texture";
import {getCanvas} from "../../../golfplay/services/canvas";
import {createPublicationMenu} from "../../../publish-menu/src/editor-publication-menu";
import {getUserData} from "@decentraland/Identity";
import {getPartsData, loadParts} from "../../../golfplay/src/editor/parts-repository";
import {hideMessage, showMessage} from "../server-notification";
import {preparePublish} from "../../../publish-menu/src/prepare-publish";
import { PANELS } from "./building";
import * as ui from "@dcl/ui-scene-utils";

export const createLobbyEditor = async (scene, {user, PlayFabId, realm, colyseus, root, onStart, onFinish})=>{
    const {createClientGolfPlay} = GolfplayClientFactory({golfplayBaseUrl:engine["__COURSE_MODELS_BASE__"]})
    const gameState = globalStore.game.getState();
    const entity = root;
    const exitTestButton = new UIImage(getCanvas(), getTexture("images/cancel.png"));
    exitTestButton.vAlign = "top";
    exitTestButton.positionX = 200;
    exitTestButton.sourceHeight = 128;
    exitTestButton.sourceWidth = 400;
    exitTestButton.width = 100;
    exitTestButton.height = 32;
    exitTestButton.visible = false;
    let room = null;
    exitTestButton.onClick = new OnClick(()=>{
        room?.leave();
    })
    globalStore.game.onChange(({newValue, oldValue, prop})=>{
        if(!newValue){
            exitTestButton.visible = false;
        }
    },"playing")
    const publicationMenu = await createPublicationMenu({PlayFabId, playerDisplayName:user.displayName});
    publicationMenu.onClose(()=>editorPanel.show())
    let promptOpen: boolean = false;
    const editorPanel = await createEditorPanel(scene, {
        position: PANELS.PUBLICATION_MENU.position,
        rotation: PANELS.PUBLICATION_MENU.rotation,
        fontColor:Color4.White(),
        shape:getGLTFShape(`models/board.glb`),
        onCreate:async ()=>{
            if (promptOpen) return;
            promptOpen = true;
            createCollectionPrompt({
                onSubmit: async (collectionId)=>{
                    promptOpen = false;
                    if(gameState.editing) return;
                    gameState.editing = true;
                    onStart();

                    if(editorPanel) editorPanel.hide();

                    const editor = await createEditor(entity,{
                        collectionId
                    });
                    editor.onExit(async ()=>{
                        onFinish();
                        await editorPanel.loadCoursesData();
                        editor.dispose();
                        editorPanel.show();
                        gameState.editing = false;
                    })
                },
                onReject: ()=>{promptOpen = false;},
                title: "Select collection",
                force_all: user.userId == "0xcf10cd8b5dc2323b1eb6de6164647756bad4de4d" || user.userId == "0x62c05caa528eed7f57f6f4857e8e4df4b0bff434" || user.userId == "0x6eb7de10448e5eb74fd96861c63879d447feb0bc" // Eibriel || Satori || Carlos
            });
        },
        onLoad:async (course)=>{
            if(gameState.editing) return;
            gameState.editing = true;
            onStart();

            const baseURLAPI = USE_REMOTE_SERVER?`https://golfcraftgame.com`:`http://localhost:2569`;
            const courseWipData = await fetch(`${baseURLAPI}/api/get-course-wip`, {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({
                    ID:course.ID
                }),
            }).then(async(r)=>await r.json()).then((data)=>{
                return ({
                    ...data,
                    definition:JSON.parse(data.definition),//TODO it should come already parsed from server
                    metadata:JSON.parse(data.metadata)
                });
            });
            editorPanel.hide();

            const editor = await createEditor(entity,{
                courseName:courseWipData.displayName || courseWipData.alias,
                courseID:courseWipData.ID,
                metadata:courseWipData.metadata,
                definition:courseWipData.definition,
                collectionId:courseWipData.collectionId
            });
            editor.onExit(async ()=>{
                onFinish();
                await editorPanel.loadCoursesData();
                editor.dispose();
                editorPanel.show();
                gameState.editing = false;
            })
        },
        onTest:async (course)=>{
            console.log("onTest");
            if(gameState.playing || gameState.starting) return;
            gameState.playing = true;
            gameState.starting = true;
            //TODO prompt ask test or validate?
            const zeroGolfclub = {
                    id:"0",
                    power:0,
                    control:0,
                    aim:0,
                };
            const maxGolfclub = {
                id:"0",
                power:5,
                control:5,
                aim:5,
            };
            const isTest = await askTestOrValidate();


            editorPanel.hide();
            setTimeout(()=>{ reproduceAvatarSound("intro"); }, 1000);
            const state = {
                started:false
            };
            fadeInOverlay(1);

            await sleep(1000);
            const topBar = getTopBar();
            console.log("isTest", isTest);
            room = await colyseus.joinOrCreate(`validate-room`, {
                user:{...user, avatar:undefined}, realm, userId:user.userId, PlayFabId, clientInfo:{},
                gameDefinition:{
                    type:"competition",
                    subType: "1",
                    courseId:course.alias
                },
                golfclub:isTest?maxGolfclub:zeroGolfclub,
                roomInstanceId:`${(isTest?"test-":"")}${user.userId}`
            });
            gameState.courseId = course.alias;
            gameState.courseName = course.displayName || course.alias;
            gameState.courseIsSeason = course.isSeason;

            let timeInterval;
            let clientGolfPlay;
            const expressionState = {};
            room.onMessage(MESSAGE.VARIABLE_INITIALIZATION, (data)=>{
                Object.assign(expressionState, data);
            });
            await waitForInitialisedState(room);

            room.onMessage(MESSAGE.START, ({startTime, duration, serverTime, expressionState})=>{//TODO duplicated code, abstract to service
                const localStartTime = startTime - (serverTime-Date.now());

                topBar.show();
                timeInterval = setInterval(()=>{
                    if(!state.started && localStartTime <= Date.now()){
                        state.started = true;

                        clientGolfPlay.start();
                        gameState.starting = false;
                    }
                    if(state.started){
                        if((localStartTime + ( duration * 1000 )) < Date.now()) {
                            clearInterval(timeInterval);
                            topBar.updateTime(0);
                        } else {
                            topBar.updateTime((localStartTime + (duration * 1000)) - Date.now());
                        }
                    }
                },100);
            });
            const userDataState = globalStore.userData?.getState();
            //let competition = createCompetitionGroupScene(root, {room});
            const golfclubs = userDataState.golfclubs;
            const activeGolfClub = golfclubs.find(item => item.CustomData?.tokenId === userDataState.activeGolfClubTokenId) || golfclubs.find(item => item.ItemId === "golfclub-1");
            clientGolfPlay = await createClientGolfPlay(root, {
                gameDefinition:{
                    type:"competition",
                    subType: "1",
                    courseId:course.alias,
                },
                room,
                golfclub:isTest ? maxGolfclub : zeroGolfclub,
                wip:true,
                colyseus,
                expressionState
            });

            exitTestButton.visible = true;
            clientGolfPlay.onFinish(async (leaveCode) => {   //TODO refactor, move callback to responsible domain/service
                clearInterval(timeInterval);
                clientGolfPlay.dispose();
                clientGolfPlay = null;
                topBar.hide();
                executeTask(async ()=>{
                    editorPanel.show();
                });
                onFinish(leaveCode);
            });
            clientGolfPlay.onComplete(async ({xp, GC, PT, time, shoots})=>{
                await sleep(1000);
                reproduceAvatarSound("success");
                getCenterPopup().showPlayResult({xp, PT, GC, time, shoots});
                //TODO update editorStore with validated
                editorPanel.loadCoursesData();
            });
            onStart();

        },
        onPublish:async (selectedCourse)=>{
            editorPanel.hide();
            const user:any = await getUserData();
            showMessage({message:"Preparing publication ..."});
            const publishData:any = await preparePublish(selectedCourse, user.userId, await loadParts(false, true));
            if(!publishData){
                editorPanel.show();
            }else{
                hideMessage();
                publicationMenu.open(publishData);
                publicationMenu.onClose(async ({cancel, ok, error})=>{
                    if(ok){
                        showMessage({message:"Your request has been sent"});
                    }else if(error){
                        showMessage({message:"An error happened"});
                    }
                    await sleep(2000);
                    editorPanel.show();
                });
            }

        }
    });
}

function waitForInitialisedState(room){
    return new Promise((resolve, reject)=>{
        room.onStateChange.once(()=>{
            resolve();
        });
    })
}
function askTestOrValidate(){
    return new Promise((resolve, reject)=>{
        const prompt = new ui.OptionPrompt(
            'Test or Validate',
            'What will you choose?',
            () => {
                resolve(false);
            },
            () => {
                resolve(true);
            },
            'Validate',
            'Test'
        );
        prompt.closeIcon.visible = false;
    })
}

export const createCollectionPrompt = ({onSubmit, onReject, title, sounds = null, force_all = false}:any)=>{
    const prompt = new ui.CustomPrompt(ui.PromptStyles.LIGHT);
    const state = {
        value:0 
    };
    const callbacks = {onSubmit, onReject};
    const upToCollection = 4;
    prompt.addButton(
        'Egypt',
        -90,
        50,
        () => {
            //sounds ? reproduceSound(sounds[0]):null;
            state.value = 0;
            applyState();
        },
        ui.ButtonStyles.ROUNDWHITE
    )
    if (upToCollection>=1) {
        prompt.addButton(
            'Space',
            90,
            50,
            () => {
                //sounds ? reproduceSound(sounds[1]):null;
                state.value = 1;
                applyState();
            },
            ui.ButtonStyles.ROUNDWHITE
        )
    }
    if (upToCollection>=2) {
        prompt.addButton(
            'Urban',
            -90,
            0,
            () => {
                //sounds ? reproduceSound(sounds[1]):null;
                state.value = 2;
                applyState();
            },
            ui.ButtonStyles.ROUNDWHITE
        )
    }
    if (upToCollection>=3 || force_all) {
        prompt.addButton(
            'Jungle',
            90,
            0,
            () => {
                //sounds ? reproduceSound(sounds[1]):null;
                state.value = 3;
                applyState();
            },
            ui.ButtonStyles.ROUNDWHITE
        )
    }
    if (upToCollection>=4 || force_all) {
        prompt.addButton(
            'Mountain',
            -90,
            -50,
            () => {
                //sounds ? reproduceSound(sounds[1]):null;
                state.value = 4;
                applyState();
            },
            ui.ButtonStyles.ROUNDWHITE
        )
    }
    if (upToCollection>=5 || force_all) {
        prompt.addButton(
            'Cocobay',
            90,
            -50,
            () => {
                //sounds ? reproduceSound(sounds[1]):null;
                state.value = 5;
                applyState();
            },
            ui.ButtonStyles.ROUNDWHITE
        )
    }
    prompt.addText(
        title,
        0,
        120,
        Color4.Black(),
        30
    )
    prompt.closeIcon.onClick = new OnPointerDown((e)=>{
        prompt.hide();
        callbacks.onReject();
    });
    //prompt.hide();
    function applyState(){
        callbacks.onSubmit(state.value);
        prompt.hide();
        //valueText.text.value = state.value.toString();
    }

    return {
        show:()=>prompt.show(),
        hide:()=>prompt.hide(),
    };
}