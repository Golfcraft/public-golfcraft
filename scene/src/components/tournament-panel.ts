import {createImageButton} from "./imageButton";
import * as ui from '@dcl/ui-scene-utils';
import {PRICE_COMPETITION_GROUP, USE_REMOTE_SERVER} from "../../../common/constants";
import {globalStore} from "../services/globalStore/globalStore";
import {createLinkBoard} from "./link-board";
import {createScreenIconWithValue} from "./lobby/training/training-menu";
import {getLevelInfo, getRandomInt} from "../../../common/utils";
import {getTexture} from "./ui/ui-texture";
import {defaultEmissive} from "../../golfplay/src/emissive-image";
import {getGLTFShape} from "../../golfplay/services/resource-repo";
import { registerSound, reproduceAvatarSound } from "../services/avatar-sound";
import {atlasAnalytics} from "../atlas-analytics-service";

registerSound("ui_play_findtournament");

const emissiveColor = new Color3(1,1,0)
export const createTournamentPanel = (parent, {position, rotation}) => {
    const state = {
        tournamentData:null,
        code:null,
        loading:false
    };
    const entity = new Entity();
    entity.setParent(parent);
    entity.addComponent(new Transform({
        position,
        rotation
    }));

    const price = createScreenIconWithValue(entity, {
        position:new Vector3(1.1, 1.5, 0),
        value:PRICE_COMPETITION_GROUP,
        src:`images/screen-icon-gc.png`
    });
    const board = new Entity();
    board.addComponent(new Transform({}));
    board.setParent(entity);
    const boardShape = getGLTFShape(`models/board.glb`);
    board.addComponent(boardShape);
    const title = new Entity();
    title.setParent(entity);
    title.addComponent(new Transform({
        position:new Vector3(0,3.4,0),
        scale:new Vector3(-2,-0.5,-1)
    }));
    const titleTexture = new Texture(`images/tournament.png`);
    const titleMaterial = new Material();
    titleMaterial.albedoTexture = titleTexture;
    titleMaterial.emissiveTexture = titleTexture;
    titleMaterial.alphaTexture = titleTexture;
    titleMaterial.emissiveIntensity = 3;
    titleMaterial.emissiveColor = emissiveColor;
    titleMaterial.albedoTexture = titleTexture;
    title.addComponent(new PlaneShape());
    title.addComponent(titleMaterial);

    const enterButton = createImageButton(entity, {
        rotation:Quaternion.Zero(),
        position:new Vector3(-0.75, 1.45,0),
        scale:new Vector3(-1,-0.4,-1),
        imageSrc:`images/button-play.png`,
        alphaSrc:`images/button-play.png`,
        hoverText:`Enter a tournament code`
    });
    const randomButton = createImageButton(entity,{
        rotation:Quaternion.Zero(),
        position:new Vector3(0.75, 1.45,0),
        scale:new Vector3(-1,-0.4,-1),
        imageSrc:`images/button-join-random.png`,
        alphaSrc:`images/button-join-random.png`,
        hoverText:`Join a random tournament`
    })
    const exitButton = createImageButton(entity, {
        rotation:Quaternion.Zero(),
        position:new Vector3(-1.5, 1.45,0),
        scale:new Vector3(-1,-0.4,-1),
        imageSrc:`images/back.png`,
        alphaSrc:`images/back.png`,
        hoverText:`Back`
    });
    const browseButton = createImageButton(entity, {
        rotation:Quaternion.Zero(),
        position:new Vector3(0, 2.5,0),
        scale:new Vector3(-1,-0.4,-1),
        imageSrc:`images/browse.png`,
        alphaSrc:`images/browse.png`,
        hoverText:`Browse tournaments`
    })

    const detailsLink = createImageButton(entity, {
        rotation:Quaternion.Zero(),
        position:new Vector3(0, 2.5,0),
        scale:new Vector3(-3,-1.5,-1),
        imageSrc:``,
        alphaSrc:``,
        hoverText:`View tournament details`,
        withEmissive:false
    })

    detailsLink.onClick(()=>{
        openExternalURL("https://golfcraftgame.com/view-tournament?code="+state.code)
        atlasAnalytics.submitGenericEvent(`gbc-tournament-detail`)
    });
    browseButton.onClick(()=>{
        openExternalURL("https://golfcraftgame.com/tournaments");
        atlasAnalytics.submitGenericEvent(`gbc-browse-tournaments`)
    });

    if(Date.now() >= new Date("2022-12-16T23:59:59.000Z").getTime() && Date.now() <= new Date("2022-12-25T23:59:59.000Z").getTime()){
        const banner = new Entity();
        banner.addComponent(new PlaneShape());
        banner.addComponent(new Transform({
            position:new Vector3(0,5.5,0.01),
            scale:new Vector3(-6,-3,-1)
        }));
        const bannerMaterial = new Material();
        bannerMaterial.albedoTexture = getTexture(`images/banner-xmas-2022.jpeg`);
        bannerMaterial.emissiveTexture = getTexture(`images/banner-xmas-2022.jpeg`);
        Object.assign(bannerMaterial, defaultEmissive);
        banner.addComponent(bannerMaterial);
        banner.setParent(entity);
    }


    const playButton = createImageButton(entity, {
        rotation:Quaternion.Zero(),
        position:new Vector3(0, 1.45,0),
        scale:new Vector3(-1,-0.4,-1),
        imageSrc:`images/button-play.png`,
        alphaSrc:`images/button-play.png`,
        hoverText:`Enter a tournament code`
    });

    exitButton.onClick(()=>{
        state.code = null;
        state.tournamentData = null;
        applyStateToScreen();
    });

    const TOURNAMENT_URL = USE_REMOTE_SERVER?`https://golfcraftgame.com`:`http://localhost:2569`;

    const dataPanel = new Entity();
    const dataText = new TextShape("foo");
    dataText.hTextAlign = "left";
    dataText.vTextAlign = "top";
    dataText.fontSize = 2;
    dataText.width = 4;
    dataPanel.addComponent(new Transform({
        position:new Vector3(-1.5,3,0)
    }))
    dataPanel.setParent(entity);
    dataPanel.addComponent(dataText);

    let prompt = new ui.FillInPrompt(
        'Press ESC and select text input',
        (code: string) => {
            log("code",code);
            state.code = code;
            refreshData();
        },
        'Submit!',
        'Enter tournament code here'
    )
    enterButton.onClick(()=>{
        prompt.show();
        atlasAnalytics.submitGenericEvent(`gbc-enter-tournament-code`);
    });
    playButton.onClick(()=>{
        if (hasEnoughCoins()) {
            callbacks.onPlay && callbacks.onPlay(state.tournamentData);
            atlasAnalytics.submitGenericEvent(`gbc-play-tournament`);
        } else {
            ui.displayAnnouncement("You need 20 coins to play. Collect coins around the building.");
        }
    });

    randomButton.onClick(async ()=>{
        reproduceAvatarSound("ui_play_findtournament")
        const tournaments = await fetch(USE_REMOTE_SERVER?`https://golfcraftgame.com/api/get-tournaments`:`http://localhost:2569/api/get-tournaments`, {
            headers:{"Content-Type":"application/json"},
            method:"POST",
            body:JSON.stringify({start:0,
                limit:100,
                filter:{
                    onlyPublic:true,
                    alive:true
                }})
        }).then(r=>r.json());
        //TODO fetch and select random with enough space
        //TODO filter also that Im not participating

        var filtered_torunaments = []
        for (var n=0; n<tournaments.results.length; n++) {
            if (canBePlayed(tournaments.results[n])) {
                filtered_torunaments.push(tournaments.results[n]);
            }
        }
        if (filtered_torunaments.length > 0) {
            //const tournament = tournaments.results[getRandomInt(0, tournaments.results.length-1)];
            const tournament = filtered_torunaments[getRandomInt(0, filtered_torunaments.length-1)];
            state.code = tournament.code;
            refreshData();
        } else {
            let p = new ui.OkPrompt(
                "No available tournaments right now. Try again later.",
                () => {
                  p.close()
                  //PlayCloseSound()
                },
                'Ok',
                true
              )
        }
    });

    prompt.hide();
    applyStateToScreen();
    const callbacks = {
        onPlay:null
    }

    buildWearablesFoundText();

    globalStore.userData.onChange(({newValue, oldValue, prop})=>{
        applyStateToScreen();
    }, "GC")
    async function refreshData(){
        return await fetch(`${TOURNAMENT_URL}/api/get-tournament-by-code`, {
            method:"POST",
            body:JSON.stringify({code:state.code.toUpperCase()}),
            headers:{"Content-Type":"application/json"}
        }).then(async (res)=>{
            state.tournamentData = await res.json();

            applyStateToScreen();
        }, (err)=>{
            console.log("error", err);
        })
    }
    return {
        onPlay:(fn)=>{
            callbacks.onPlay = fn;
            return () => callbacks.onPlay = null;
        },
        hide:()=>{
            entity.setParent(null);
            engine.removeEntity(entity);
        },
        show:()=>{
            entity.setParent(parent);
        },
        refreshData:async ()=> await refreshData()
    }
    function buildWearablesFoundText(){
        const wearablesFound = new Entity();
        const wearablesFoundText = new TextShape(`Found wearables: --`);wearablesFoundText.fontSize = 2;
        wearablesFound.setParent(entity);
        wearablesFound.addComponent(wearablesFoundText);
        wearablesFound.addComponent(new Transform({position:new Vector3(-0.1,4.2,0)}))
        checkHalloweenWearablesFound();
        globalStore.game.onChange(checkHalloweenWearablesFound,"playing");
        async function checkHalloweenWearablesFound(){
            try{
                const found = await fetch(`https://golfcraftgame.com/api/halloween-found-wearables`).then(r=>r.json()).then(j=>j.result);

                wearablesFoundText.value =found ? `Found wearables: ${(found)}` : "";

            }catch(error){}
        }
    }

    function canBePlayed(tournamentData): boolean{
        const {min_level} = tournamentData;
        const currentLevel = getCurrentLevel();
        console.log(" tournamentData",  tournamentData)
        console.log(" tournamentData.participants",  tournamentData.participants)
        const participant = tournamentData.participants?.find(p=>p.address.toLowerCase() === globalStore.userData.getState().userId.toLowerCase())
        const cant_play = (participant?.data?.courseStates?.length === 12 && !participant?.data?.courseStates[11].abandoned)
        || (Date.now() <= (tournamentData.start_date * 1000) || Date.now() >= (tournamentData.expiration_date * 1000))
        || ((tournamentData?.participants?.length||0) >= tournamentData.max_participants && !participant)
        || min_level > currentLevel;
        return !cant_play;
    }

    function hasEnoughCoins(): boolean {
        return globalStore.userData.getState().GC >= 20
    }

    function getCurrentLevel() {
        return getLevelInfo(globalStore.userData.getState().xp).currentLevel;
    }

    function applyStateToScreen(){
        if(state.tournamentData){
            const {min_level} = state.tournamentData;
            const currentLevel = getCurrentLevel();
            enterButton.hide();
            dataText.value = `code: ${state.code}
participants: ${state.tournamentData.participants?.length || 0}
courses: ${state.tournamentData.courses.length}
played: ${getPlayerCourses( globalStore.userData.getState().userId, state.tournamentData)}
<color=${currentLevel >= min_level?"#ffffff":"#ff0000"}>minimum level: ${min_level||0}</color>`
            exitButton.show();
            detailsLink.show();
            playButton.show();
            browseButton.hide();
            randomButton.hide();
            if(!canBePlayed(state.tournamentData)) {
                playButton.hide();
            }
            price.show();

        }else{
            price.hide();
            browseButton.show();
            randomButton.show();
            enterButton.show();
            dataText.value = "";
            exitButton.hide();
            detailsLink.hide();
            playButton.hide();
        }
    }
};

function getPlayerCourses(address, tournamentData){
    const participant = tournamentData.participants?.find(p=>p.address.toLowerCase() === address.toLowerCase());
    return participant?.data?.courseStates?.length || 0;
}

