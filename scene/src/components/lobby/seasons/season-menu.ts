import {createImageButton} from "../../imageButton";
import {globalStore} from "../../../services/globalStore/globalStore";
import {
    getCatFromTier,
    getPointsOnCurrentTier,
    getTierFromSub,
    getUvsFromSprite,
    seasonPointsPerCategory
} from "../../../../../common/utils";
import {seasonTierDefinitions} from "../../../../../common/season-tier-definitions";
import {createSeasonDemo} from "../../../../golfplay/src/season-demo";
import {getGLTFShape, getTexture} from "../../../../golfplay/services/resource-repo";
import {movePlayerTo} from "@decentraland/RestrictedActions";
import {getSpriteUv} from "../../../../golfplay/mana-fever-utils/lib/sprite";
import {GAME_SPAWN} from "../../spawns";
import {atlasAnalytics} from "../../../atlas-analytics-service";
import {registerCallback} from "../../../services/userData";
import {seasonCatalog} from "./season-catalog";

import * as ui from '@dcl/ui-scene-utils';

declare const console;
var action_id;
var item_data;

const ACTION_ENDPOINT = 'https://golfcraftgame.com/bridge/action/'

export const createSeasonMenu = async (parent, {root, position, rotation, colyseus, wip, onStarting, onFinish}) => {
    console.log("createSeasonMenu")
    const gameState = globalStore.game.getState();
    const entity = new Entity();

    const emblem = createImageButton(entity, {
        position:new Vector3(0,2.2,0),
        scale:new Vector3(-0.7,-0.7,-0.7),
        rotation:Quaternion.Zero(),
        withEmissive:true,
        emissiveColor:new Color3(1,1,1),
        emissiveIntensity:1,
        imageSrc:"images/season-badges.png",
        alphaSrc:"images/season-badges-alpha.png",
        hoverText:"This is your current rank"
    });


    const text = new TextShape();
    text.vTextAlign = "top";
    text.hTextAlign = "center";
    text.fontSize = 2;
    text.value = "";

    entity.addComponent(new Transform({
        position,
        rotation
    }));
    const textWrapper = new Entity();
    textWrapper.setParent(entity);
    textWrapper.addComponent(new Transform({
        position:new Vector3(0,3.6,0)
    }))
    textWrapper.addComponent(text);


    const board = new Entity();
    board.setParent(entity);
    const shape = getGLTFShape(`models/board.glb`);
    board.addComponent(shape);

    const playButton = createImageButton(entity, {
        position:new Vector3(0.8, 1.30, -0.1),
        scale:new Vector3(-1,-0.4,-1),
        rotation :Quaternion.Zero(),
        imageSrc:"images/button-play.png",
        alphaSrc:`images/button-play.png`,
        hoverText:`Play season`,
    });
    const tpButton = createImageButton(entity, {
        position:new Vector3(0, 1.2, -0.1),
        scale:new Vector3(-1,-0.4,-1),
        rotation :Quaternion.Zero(),
        imageSrc:"images/teleport.png",
        alphaSrc:`images/teleport.png`,
        hoverText:`Teleport to tournaments`,
    });
    tpButton.onClick(()=>{
        movePlayerTo(...GAME_SPAWN.TOURNAMENT)
    });
    playButton.onClick(()=>{
        seasonGame.startGame();
        atlasAnalytics.submitGenericEvent(`gbc-play-season`);
    });
    console.log("creating season demo")
    const seasonGame = await createSeasonDemo(root, {
        colyseus, wip, onFinish: () => {
            onFinish();
            show();
            claimRewards();
            atlasAnalytics.submitGenericEvent(`gbc-finish-season`);
        },
        userDataState: globalStore.userData.getState()
        , onStarting: () => {
            gameState.playing = true;
            onStarting();
            hide();
        }, onStarted: () => {
        }
    });
    console.log("refresh season menu")
    refresh();

    registerCallback(refresh);

    return {
        show,
        hide,
        refresh
    };

    function claimRewards(){
        var userData = globalStore.userData.getState();
        var data = JSON.stringify({
            PlayFabId: userData.PlayFabId,
            displayName:userData.displayName
        });
        executeTask(async () => {
            const response = await fetch("https://golfcraftgame.com/bridge/claim-season-reward",{
                method:"post",
                body:data,
                headers:{
                    "Content-Type":"application/json"
                }
            })
            const result = await response.json()
            if (result.ok) {
                action_id = result.actionID
                item_data = result
            }
        })
    }

    function show(){
        console.log("show season menu")
        entity.setParent(parent);
    }

    function hide(){
        console.log("hide season menu")
        entity.setParent(null);
        engine.removeEntity(entity);
    }

    function refresh(){
        const userData = globalStore.userData.getState();
        const currentMission = userData["statistic_current_mission"] || 0;
        const userTierSub = userData["statistic_tier-sub"]||0;
        const tier = getTierFromSub(userTierSub);
        const emblemShape = emblem.getShape();
        const tierDefinition = seasonTierDefinitions[tier||0];

        if(!currentMission || currentMission < 6){
            emblemShape.visible = false;
            text.value = "<b>MOUNTAIN SEASON</b>\n\n";
            text.value += "\n\nYou need to complete\nDr. Par initial missions\nbefore participating on\nSeason competition";
            tpButton.hide();
            playButton.hide();
            return;
        }else{
            emblemShape.visible = true;
        }
        //emblemShape.visible = false; //TODO remove when emblem is fixed

        emblemShape.uvs = getUvsFromSprite(1536,1024, ...tierDefinition.sprite);

        text.value = `<b>${seasonCatalog[userData.config.currentSeasonCollectionId]?.name || 'UNKNOWN'} SEASON</b>\n\n`;
        text.value += "You are rank <b><color=#ffff00>" + tierDefinition.name + `</color></b> ${getPointsOnCurrentTier(userTierSub)}/${seasonPointsPerCategory[getCatFromTier(tier)]} \n(${userTierSub} Season points) `;

        if(!userData.EN){
            tpButton.show();
            playButton.hide();
        }else{
            tpButton.hide()
            playButton.show();
        }
        text.value += `\n\n\n\n\nEnergy: ${userData?.EN || 0} ( Recharges 1 every 2.4 hours )`;
        if(!userData?.EN){
            text.value += `\nMeanwhile, You can play Community Tournaments`;
        }
        console.log("refresh end seasonTierDefinitions");
    }
};

export class TransactionStatusSystem implements ISystem {
    time = 0.0
    update(dt: number) {
        this.time += dt
        if (this.time < 15) return
        this.time = 0.0
        if (action_id == null) return

        log("Checking action", action_id)
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
                    if (item_data.sends_wearable) {
                        ui.displayAnnouncement(`Reward sent successfully!\n${item_data.wearable.name}`)
                    } else {
                        var ft = item_data.wearable.tierReward * 10
                        ui.displayAnnouncement(`Reward sent successfully!\nFT ${ft}`)
                    }
                    log("Action success", action_id)
                } else if (result.result.state == 0) {
                    ui.displayAnnouncement('Error sending reward. Play again to retry.')
                    log("Action error", action_id)
                }
            } catch {
                log("failed to reach URL");
            }
        })
    }
  }

  engine.addSystem(new TransactionStatusSystem())