import {getProvider} from "@decentraland/web3-provider";
import * as eth from "eth-connect";
import {getGLTFShape} from "../../../golfplay/services/resource-repo";
const MATERIALS_CONTRACT_ADDRESS = `0xb50e29a3ccf7c0ab133ea7de46b09d0d8feafdf0`;
import materialsBurnAbi = require("../../../src/components/bridge/materials-burn-abi.json");
import {globalStore} from "../../services/globalStore/globalStore";
import {createNumberPrompt} from "../bridge/number-prompt";
import * as ui from "@dcl/ui-scene-utils";
import {bridgeURL} from "../bridge/bridge-url";
import {signedFetch} from "@decentraland/SignedFetch";
import {refreshUserData} from "../../services/userData";
import {showMessage} from "../server-notification";
import {createImageButton} from "../imageButton";
import {sleep} from "../../../../common/utils";
import {getPendingChecker} from "../../services/pending-queue";
import { registerSound, reproduceAvatarSound } from "../../services/avatar-sound";
import {atlasAnalytics} from "../../atlas-analytics-service";

registerSound("int_ref_wood_click");
registerSound("int_ref_wood_add_01");
registerSound("int_ref_wood_add_02");
registerSound("int_ref_wood_remove_01");
registerSound("int_ref_wood_remove_02");
registerSound("int_ref_wood_cancel_01");
registerSound("int_ref_wood_cancel_02");
registerSound("int_ref_wood_error_material");
registerSound("int_ref_wood_initiate");
//
registerSound("int_ref_stone_click");
registerSound("int_ref_stone_add_01");
registerSound("int_ref_stone_add_02");
registerSound("int_ref_stone_add_03");
registerSound("int_ref_stone_remove_01");
registerSound("int_ref_stone_remove_02");
registerSound("int_ref_stone_remove_03");
registerSound("int_ref_stone_cancel");
registerSound("int_ref_stone_error_material_01");
registerSound("int_ref_stone_error_material_02");
registerSound("int_ref_stone_initiate");
//
registerSound("int_ref_iron_click");
registerSound("int_ref_iron_add_01");
registerSound("int_ref_iron_add_02");
registerSound("int_ref_iron_add_03");
registerSound("int_ref_iron_remove");
registerSound("int_ref_iron_cancel_01");
registerSound("int_ref_iron_cancel_02");
registerSound("int_ref_iron_error_material");
registerSound("int_ref_iron_initiate");
//
registerSound("int_ref_gold_click");
registerSound("int_ref_gold_add_01");
registerSound("int_ref_gold_add_02");
registerSound("int_ref_gold_remove_01");
registerSound("int_ref_gold_remove_02");
registerSound("int_ref_gold_remove_03");
registerSound("int_ref_gold_cancel_01");
registerSound("int_ref_gold_cancel_02");
registerSound("int_ref_gold_error_material");
registerSound("int_ref_gold_initiate");

declare const console;
const domainType = [
    {name: "name", type: "string"},
    {name: "version", type: "string"},
    {name: "verifyingContract", type: "address"},
    {name: "salt", type: "bytes32"},
];
const metaTransactionType = [
    {name: "nonce", type: "uint256"},
    {name: "from", type: "address"},
    {name: "functionSignature", type: "bytes"}
];
const MATERIAL_MODEL = {
    WD:"wood",
    ST:"rocks",
    IR:"steel",
    GD:"gold"
};
const MATERIAL_TOKEN = {
    WD:4,
    IR:6,
    ST:5,
    GD:7
};
const MATERIAL_NAME = {
    WD:"wood",
    IR:"iron",
    ST:"stone",
    GD:"gold"
};
const MATERIAL_REFINED_NAME ={
    WD:"planks",
    IR:"iron bars",
    ST:"stone blocks",
    GD:"gold bars"
}
export async function createRefinery(parent, {position, rotation, scale, sourceMaterial, address, PlayFabId}){
    const entity = new Entity();
    const animator = new Animator();
    const clipIdle = new AnimationState("0. idle");
    const clipAction = new AnimationState("1. crafting");
    animator.addClip(clipIdle);
    animator.addClip(clipAction);

    const state = {
        crafting:false,
        sending:false
    };
    const prompt =
        createNumberPrompt({
            onSubmit: (value) => {
                return executeGameToChain({value, tokenId:MATERIAL_TOKEN[sourceMaterial], address, PlayFabId});
            },
            onReject: () => {
                state.crafting = false;
            },
            title: `Refine game ${MATERIAL_NAME[sourceMaterial]} \ninto ${MATERIAL_REFINED_NAME[sourceMaterial]} in blockchain`, stack:100,
            sounds: [getSound(sourceMaterial, "add", true), getSound(sourceMaterial, "remove", true)] 
        });
    const chainQueue = getPendingChecker();
    chainQueue.onFinishedQueue(async ()=>{
       clipAction.stop();
       clipIdle.play(false);
       await sleep(5000);
       refreshUserData();
    });
    console.log("chainQueue", chainQueue);
    entity.setParent(parent);
    entity.addComponent(animator)
    entity.addComponent(new Transform({
        position,
        rotation,
        scale
    }));

    entity.addComponent(getGLTFShape(`models/crafting/crafting_${MATERIAL_MODEL[sourceMaterial]}.glb`));
    entity.addComponent(new OnPointerDown(async ()=>{
        if(chainQueue.isPending()){
            showMessage({message:"You already have pending requests", timeout:3000})
            reproduceAvatarSound(getSound(sourceMaterial, "cancel"));
            return;
        }
        if(state.crafting) return;
        state.crafting = true;
        prompt.show();
        atlasAnalytics.submitGenericEvent(`gbc-refinery-prompt-${sourceMaterial}`);
        reproduceAvatarSound(getSound(sourceMaterial, "click"));

    }, {hoverText:`Refine ${MATERIAL_NAME[sourceMaterial]} into blockchain material`}))

    globalStore.game.onChange(showOrHide, "playing");
    globalStore.game.onChange(showOrHide, "editing");

    function showOrHide({newValue, oldValue, prop}){
        if(newValue && !oldValue){
            hide();
            prompt.hide();
        }else if(oldValue && !newValue){
            show();
        }
    }

    function hide(){
        engine.removeEntity(entity);
        entity.setParent(null);
    }

    function show(){
        entity.setParent(parent)
    }

    async function executeGameToChain({value, tokenId, address, PlayFabId}) {
        if (!await handlePromptValue(prompt, value, () => globalStore.userData.getState()[sourceMaterial] >= Number(value))) {
            state.crafting = false;
            return false;
        }

        reproduceAvatarSound(getSound(sourceMaterial, "initiate"));

        await tryRequest(async () => {
            const url = `${bridgeURL}/game-to-chain`;
            return await signedFetch(
                url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        VirtualCurrency:sourceMaterial,
                        Amount: Number(value),
                        tokenId,
                        address,
                        PlayFabId,
                        stack:100
                    })
                });
        });
        clipAction.play(false);
        state.crafting = false;
        refreshUserData();
    }
    async function handlePromptValue(prompt, value, balanceCheck) {
        await refreshUserData();
        if (!value) {
            prompt.hide();
            return;
        }
        const Amount = Number(value);
        if (isNaN(Amount)) {
            showMessage({timeout: 5000, message: "Wrong value"});
            prompt.hide();
            reproduceAvatarSound(getSound(sourceMaterial, "error_material"));
            return;
        }
        if (!balanceCheck()) {
            showMessage({timeout: 5000, message: `You don't have enough ${MATERIAL_NAME[sourceMaterial]}`});
            prompt.hide();
            reproduceAvatarSound(getSound(sourceMaterial, "error_material"));
            return;
        }

        return true;
    }
    async function tryRequest(fn) {
        try {
            state.sending = true;
            const result = await fn();
            if (result.error) {
                showMessage({timeout: 5000, message: result.error});
                state.sending = false;
                prompt.hide();
                return;
            }

            showMessage({timeout: 5000, message: "Your request has been sent"});
            chainQueue.checkPending();
            state.sending = false;
            prompt.hide();
        } catch (error) {
            console.error(error);
            showMessage({timeout: 5000, message: "An error happened trying to reach the server."});
            state.sending = false;
            prompt.hide();
            reproduceAvatarSound("ui_servererror");
        }
    }


}


function getSound(material, sound_type, as_array = false){
    var soundName = `int_ref_${MATERIAL_NAME[material]}_${sound_type}`;
    var amount = 1
    if (MATERIAL_NAME[material] == "wood") {
        if (["add", "remove", "cancel"].indexOf(sound_type) >= 0) {
            amount = 2
        }
    } else if (MATERIAL_NAME[material] == "stone") {
        if (["add", "remove"].indexOf(sound_type) >= 0) {
            amount = 3
        } else if (["error_material"].indexOf(sound_type) >= 0) {
            amount = 2
        }
    } else if (MATERIAL_NAME[material] == "iron") {
        if (["add"].indexOf(sound_type) >= 0) {
            amount = 3
        } else if (["cancel"].indexOf(sound_type) >= 0) {
            amount = 2
        }
    } else if (MATERIAL_NAME[material] == "gold") {
        if (["add", "cancel"].indexOf(sound_type) >= 0) {
            amount = 2
        } else if (["remove"].indexOf(sound_type) >= 0) {
            amount = 3
        }
    }


    var soundsArray = [];
    if (amount == 1){
        soundsArray.push(soundName);
    } else {
        for (var n=0; n < amount; n++) {
            soundsArray.push(`${soundName}_0${n+1}`)
        }
    }
    
    if (as_array) {
        return soundsArray;
    } else {
        return soundsArray[Math.floor(Math.random() * soundsArray.length)];
    }

}