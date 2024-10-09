import {createEditorPanel} from "./editor/editor-panel";

declare const console:any;
const _log = console.log;
console.log = (...args) => {
    _log("GFC", ...args);
}


(<any>engine)["__COURSE_MODELS_BASE__"] = "";
import {initializeMaterials } from "../physics/world";
import {createTestGolfPlay} from "./golfplay-test";
import {registerSound} from "../mana-fever-utils/lib/sound/avatar-sound";
import {createRemoteGamePlay} from "./golfplay-test-remote";
import {createEditor} from './editor/editor';
import {USE_REMOTE_SERVER} from "../../../common/constants";
import {getUvsFromSprite, sleep} from "../../../common/utils";
import {fadeInOverlay} from "../../src/components/ui/overlay";
import {createTopBar, getTopBar} from "../../src/components/ui/topbar";
import {getCenterPopup} from "../../src/components/ui/centerpanel";
import Colyseus = require('colyseus.js');
import {GolfplayClientFactory} from "../../src/components/lobby/golfplay-client";
import MESSAGE from "../../../server/rooms/mesages";
import {decorateRemotePhysicParts, cannonParts} from "../physics/course-element-loader";
import {createRemoteGamePlay2} from "./golfplay-test-remote2";
import {
    courseDefinitionsRepo,
    getCourseDefinition
} from "../../../common/course-definitions/course-definition-repository";
import {migrateCourseDefinitionAnimations} from "../../../common/course-animations-migration";
import {createSeasonDemo} from "./season-demo";
import {createImageButton} from "../../src/components/imageButton";
import {seasonTierDefinitions} from "../../../common/season-tier-definitions";

registerSound("checkpoint");
registerSound("carpet");
registerSound("wood");
registerSound("hole");
registerSound("sand");
registerSound("wind");
registerSound("shoot1");
registerSound("shoot2");
registerSound("voxter");



const root = new Entity();
root.addComponent(new Transform({
    position: new Vector3(24, 0, 24)
}))
engine.addEntity(root);

initializeMaterials();

/* const wrapper = new Entity();
wrapper.setParent(root);
wrapper.addComponent(new Transform({
    position:new Vector3(-24,0,-24)
}))
const parent = wrapper; */
const parent = root;
//const remote = `wss://ws2.golfcraftgame.com`;//EU
//const remote = `wss://ws3.golfcraftgame.com`;//US
//const remote = "ws://localhost:2567";
const remote = null;

const remoteGameDefinition = {
    type:"competition",
    subType: "1",
    courseId:"Amplio30_urban"
};


const useEditorOrSeasons = true;
const editCourse = true;

executeTask(async () => {
    await decorateRemotePhysicParts(fetch, true)
    const {createClientGolfPlay} = GolfplayClientFactory({golfplayBaseUrl:engine["__COURSE_MODELS_BASE__"]});

    if(useEditorOrSeasons){
        initEditor(editCourse);
    }else{
        if(remote){
            createRemoteGamePlay(remote, remoteGameDefinition, parent, {golfclub:{
                    power:0,
                    control:0,
                    aim:0,
                    id:"2"
                }});
        }else{
            const play = await createTestGolfPlay(parent, {
                gameDefinition:remoteGameDefinition,
            });

            play.onFinish(()=>{
                play.dispose();
            });
        }
    }
    const state = {
        editing:false,
        playing:false,
        starting:false,
        started:false
    };

    async function initEditor(editCourse){
        console.log("initEditor",editCourse)
        const topBar = createTopBar({});
        const scene = new Entity();
        scene.addComponent(new Transform({
            position:new Vector3(24, 0, 24)
        }));

        engine.addEntity(scene);
        if(editCourse){
            edit(remoteGameDefinition.courseId);
        }else{
            colyseus = getColyseus();
            console.log("creating season demo");
            const [x,y,w,h]=seasonTierDefinitions[seasonTierDefinitions.length-3].sprite;
            const seasonButton = createImageButton(scene, {
                position:new Vector3(2,1,2), imageSrc:"images/season-ranks.png", rotation:Quaternion.Zero(),
                scale:new Vector3(-2,-2,-2), withEmissive:false, hoverText:"play season", alphaSrc:undefined,
                uvs:getUvsFromSprite(2950,2360,x,y,w,h)
            });

            seasonButton.onClick(()=>seasonDemo.startGame());

            const seasonDemo = await createSeasonDemo(root, {wip:true, colyseus, userDataState:{}, onStarting:() => {
                    editorPanel?.hide();
                    seasonButton.hide();
            }, onFinish: () => {
                    editorPanel?.show();
                    seasonButton.show();
            }, onStarted: () => {

            }});

            const editorPanel = await createEditorPanel(scene, {
                position:new Vector3(0,0,0),
                rotation:Quaternion.Zero(),
                fontColor:Color4.White(),
                shape:undefined,
                onCreate:async ()=>{
                    if(state.editing) return;
                    state.editing = true;
                    await sleep(800);
                    editorPanel.hide();
                    const editor = await createEditor(scene,
                        {wipParts:true, collectionId:1});
                    editor.onExit(async ()=>{
                        await editorPanel.loadCoursesData();
                        editor.dispose();
                        editorPanel.show();
                        state.editing = false;
                    })
                },
                onLoad:async (course)=>{
                    console.log("onLoad", course);
                    if(state.editing) return;
                    state.editing = true;
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
                    console.log("creating editor", JSON.stringify(courseWipData));
                    const editor = await createEditor(scene,{
                        courseName:courseWipData.alias,
                        courseID:courseWipData.ID,
                        metadata:courseWipData.metadata,
                        definition:courseWipData.definition,
                        wipParts:true,
                        collectionId:courseWipData.collectionId
                    });
                    editor.onExit(async ()=>{
                        await editorPanel.loadCoursesData();
                        editor.dispose();
                        editorPanel.show();
                        state.editing = false;
                    })
                    //TODO const editor = await createEditor(scene,{});
                },
                onTest:async (course)=>{
                    const baseURLAPI = USE_REMOTE_SERVER?`https://golfcraftgame.com`:`http://localhost:2569`;
                    const courseDefinition = await fetch(`${baseURLAPI}/api/get-course-wip`, {
                        method:"POST",
                        headers:{"Content-Type":"application/json"},
                        body:JSON.stringify({
                            ID:course.ID
                        }),
                    }).then(async(r)=>await r.json()).then((data)=>{
                        if(data.error){
                            return {
                                ...courseDefinitionsRepo[remoteGameDefinition.type][remoteGameDefinition.subType][remoteGameDefinition.courseId]
                            };
                        }
                        return ({
                            ...data,
                            ...JSON.parse(data.definition),//TODO it should come already parsed from server
                            metadata:JSON.parse(data.metadata)
                        });
                    });

                    console.log("courseDefinition",courseDefinition);
                    if(state.playing || state.starting || state.editing) return;
                    state.playing = true;
                    state.starting = true;
                    state.editing = true;
                    editorPanel.hide();

                    // setTimeout(()=>{ reproduceAvatarSound("intro"); }, 1000);

                    fadeInOverlay(1);
                    await sleep(1000);
                    const topBar = getTopBar();
                    const colyseus = getColyseus();
                    console.log("cannonParts", Object.keys(cannonParts))
                    const room = await colyseus.joinOrCreate(`validate-room`, {
                        user:{}, realm:"localhost", userId:`admin-editor`, PlayFabId:undefined, clientInfo:{},
                        gameDefinition:{
                            type:"competition",
                            subType: "1",
                            courseId:course.alias
                        },
                        courseDefinition,
                        cannonParts,
                        roomInstanceId:Date.now()
                    });


                    let timeInterval;
                    let clientGolfPlay;

                    await waitForInitialisedState(room);
                    room.onMessage(MESSAGE.START, ({startTime, duration, serverTime})=>{//TODO duplicated code, abstract to service
                        const localStartTime = startTime - (serverTime-Date.now());

                        //topBar.show();
                        timeInterval = setInterval(()=>{
                            if(!state.started && localStartTime <= Date.now()){
                                state.started = true;

                                clientGolfPlay.start();
                                state.starting = false;
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

                    clientGolfPlay = await createClientGolfPlay(root, {
                        gameDefinition:{
                            type:"competition",
                            subType: "1",
                            courseId:course.alias,
                        },
                        room,
                        golfclub:{//TODO review to remove
                            id:"0",
                            power:0,
                            control:0,
                            aim:0,
                        },
                        wip:true,
                        colyseus
                    });
                    clientGolfPlay.onFinish(async (leaveCode) => {   //TODO refactor, move callback to responsible domain/service
                        clearInterval(timeInterval);
                        clientGolfPlay.dispose();
                        clientGolfPlay = null;
                        topBar.hide();
                        executeTask(async ()=>{
                            editorPanel.show();
                        });
                        state.editing = state.playing = state.started = false;
                    });
                    clientGolfPlay.onComplete(async ({xp, GC, PT, time, shoots})=>{
                        await sleep(1000);
                        //reproduceAvatarSound("success");
                        //getCenterPopup().showPlayResult({xp, PT, GC, time, shoots});
                    });
                },
                onPublish:()=>{},
            });
            console.log("editorPanel",editorPanel)
        }

        async function edit(courseId){
            const baseURLAPI = USE_REMOTE_SERVER?`https://golfcraftgame.com`:`http://localhost:2569`;
            const courseWipData = await fetch(`${baseURLAPI}/api/get-course-wip`, {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({
                    alias:courseId
                }),
            }).then(async(r)=>await r.json()).then((data)=>{
                console.log("data",data)
                if(data?.error){
                    return {
                        definition:courseDefinitionsRepo[remoteGameDefinition.type][remoteGameDefinition.subType][remoteGameDefinition.courseId]
                    };
                }
                return ({
                    ...data,
                    definition:JSON.parse(data.definition),//TODO it should come already parsed from server
                    metadata:JSON.parse(data.metadata)
                });
            }, ()=>{
                return {
                    definition:courseDefinitionsRepo[remoteGameDefinition.type][remoteGameDefinition.subType][remoteGameDefinition.courseId],
                    ID:-1
                }
            });
        console.log("courseWipData",remoteGameDefinition,courseWipData);

            const editor = await createEditor(scene,{
                courseName:courseWipData.alias,
                courseID:courseWipData.ID,
                metadata:courseWipData.metadata,
                definition:courseWipData.definition,
                wipParts:true,
                disableSave:true,
                useEgypt:true
            });
            editor.onExit(async ()=>{
                editor.dispose();
                state.editing = false;
            })
        }
    }
    function waitForInitialisedState(room){
        return new Promise((resolve, reject)=>{
            room.onStateChange.once(()=>{
                resolve();
            });
        })
    }
});
var colyseus;

function getColyseus(){
    if(colyseus) return colyseus;
    console.log("colyseus url",remote)
    colyseus = new Colyseus.Client(`${remote}`);
    return colyseus;
}

/* Maps data 
 Race = 16 -> 8 active
 Zone = 28 -> 18 active
 Voxters = 8 -> 2 active
 holein3 = 57 -> 50 active 
 
 Ratio R:Z:V:H
 5:3:1:7
 
  Ratio Race : Zone : Voxter : Holein3 : Competition
 5:3:1:7:15
 */