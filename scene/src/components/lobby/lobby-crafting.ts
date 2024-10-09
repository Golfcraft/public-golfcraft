import {createCraftingMenu} from "../../../../crafting-menu/src/crafting-menu";
import {getCanvas} from "../../../golfplay/services/canvas";
import {getProvider} from "@decentraland/web3-provider";
import {bridgeURL} from "../bridge/bridge-url";
import {getSalt} from "../bridge/chain-bridge-panel";
import * as eth from "eth-connect";
import craftingAbi = require("./crafting.abi.json");
import {showMessage} from "../server-notification";
import {sleep} from "../../../../common/utils";
import {globalStore} from "../../services/globalStore/globalStore";
import {getGLTFShape} from "../../../golfplay/services/resource-repo";
import {createRefinery} from "./refinery";
import {refreshUserData} from "../../services/userData";
import {createLandClaimer} from "../land-claimer";
import buildingPositions from "./building-positions";
import { registerSound, reproduceAvatarSound } from "../../services/avatar-sound";

registerSound("ui_craft_openMenu");
registerSound("ui_craft_cancel");
registerSound("ui_craft_space_01");

const ACTION_ENDPOINT = 'https://golfcraftgame.com/bridge/action/'

let craftingMenu;
let action_id;
export const createLobbyCrafting = async (parent, {root, colyseus, user, realm, PlayFabId})=>{
    const empty_name = "EmptySeasonLand"
    const spacetLandClaimer = createLandClaimer(parent,{
        position: new Vector3(...buildingPositions[empty_name].position),
        rotation: new Quaternion(...buildingPositions[empty_name].rotation),
        userStorage:globalStore.userData,
        shape:getGLTFShape(`models/building/`+buildingPositions[empty_name].gltf),
        collectionId:4
    });
    globalStore.game.onChange(showOrHideLandClaimer, "playing");
    globalStore.game.onChange(showOrHideLandClaimer, "editing");

    function showOrHideLandClaimer({newValue, oldValue, prop}){
        if(newValue && !oldValue){
            spacetLandClaimer.hide();
        }else if(oldValue && !newValue){
            spacetLandClaimer.show();
        }
    }

    createRefinery(parent, {
        position:new Vector3(13.8-24,33.8,17-24),
        rotation:Quaternion.Euler(0,45,0),
        scale:new Vector3(0.5,0.5,0.5),
        sourceMaterial:"GD",
        address:user.userId,
        PlayFabId
    });

    createRefinery(parent, {
        position:new Vector3(15-24,33.8,15-24),
        rotation:Quaternion.Euler(0,45,0),
        scale:new Vector3(1,1,1),
        sourceMaterial:"IR",
        address:user.userId,
        PlayFabId
    });

    createRefinery(parent, {
        position:new Vector3(16.8-24,33.8,12-24),
        rotation:Quaternion.Euler(0,45+90,0),
        scale:new Vector3(0.75,0.75,0.75),
        sourceMaterial:"ST",
        address:user.userId,
        PlayFabId
    });

    createRefinery(parent, {
        position:new Vector3(18.5-24,33.8,9.1-24),
        rotation:Quaternion.Euler(0,45,0),
        scale:new Vector3(1,1,1),
        sourceMaterial:"WD",
        address:user.userId,
        PlayFabId
    });

    initializeWorkBench();

    function initializeWorkBench(){
        const entity = new Entity();
        const state = {
            crafting:false
        };
        entity.setParent(parent);
        entity.addComponent(new Transform({
            position:new Vector3(10-24,33.8,21-24),
            rotation:Quaternion.Euler(0,45,0)
        }));
        entity.addComponent(getGLTFShape(`models/crafting/crafting_workbench.glb`));
        entity.addComponent(new OnPointerDown(async ()=>{
            if(state.crafting) return;
            if(action_id != null) {
                showMessage({timeout:5000, message:"Crafting in progress. Please wait a moment."});
                return;
            }
            reproduceAvatarSound("ui_craft_openMenu")
            state.crafting = true;
            if(!craftingMenu){
                craftingMenu = await createCraftingMenu({
                    canvas:getCanvas(),
                    sprite:{
                        source:"images/ui-spritesheet.png",
                        sourceWidth:208,
                        sourceHeight:81,
                        sourceLeft:2,
                        sourceTop:226
                    },
                    onCraft:async (data:any)=>{
                        reproduceAvatarSound("ui_craft_space_01");
                        console.log("Crafting ", data.ID, data.alias, data.amount);
                        try{
                            const address = globalStore?.userData?.getState()?.userId;
                            const fetchResult = await fetch(`${bridgeURL}/nonce-crafting/${address}`).then(r => r.json());
                            var nonce
                            if (fetchResult.result) {
                                nonce = fetchResult.result
                            } else {
                                reproduceAvatarSound("ui_servererror");
                                showMessage({timeout:5000, message:fetchResult.error});
                            }
                            const provider = await getProvider();
                            const metaRequestManager: any = new eth.RequestManager(provider);
                            let craftingContract: any = await new eth.ContractFactory(metaRequestManager, craftingAbi).at("0x8e1e2bbf6dfae62a1988d5a12969ebd057597e4a");
                            const functionSignature = craftingContract.craftPart.toPayload(data.ID, data.amount).data;
                            const message = {
                                nonce,
                                from: address,
                                functionSignature
                            };
                            let chainId = 137;

                            let domainData = {
                                name:"GolfcraftCrafting",
                                version:"1",
                                verifyingContract: "0x8e1e2bbf6dfae62a1988d5a12969ebd057597e4a",
                                salt: getSalt(chainId)
                            };
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
                            const dataToSign = {
                                types: {
                                    EIP712Domain: domainType,
                                    MetaTransaction: metaTransactionType
                                },
                                domain: domainData,
                                primaryType: "MetaTransaction",
                                message
                            };
                            const {signature} = (await requestTypedV4Signature(await getProvider(), message.from, dataToSign)) as any;
                            const {r, s, v} = getSignatureParameters(signature);
                            craftingMenu.hide();
                            const result = await fetch(`${bridgeURL}/craft-part`, {
                                method: "POST",
                                body: JSON.stringify({
                                    from: message.from,
                                    r, s, v,
                                    functionSignature
                                }),
                                headers: {"Content-Type": "application/json"},
                            }).then(r => r.json());

                            if(result.error){
                                reproduceAvatarSound("ui_servererror");
                                showMessage({timeout:5000, message:"Crafting failed"});
                                await sleep(4000);
                                craftingMenu.show();
                            }else{
                                action_id = result.actionID
                                showMessage({timeout:5000, message:"Crafting transaction sent"});
                            }

                        }catch(e){
                            reproduceAvatarSound("ui_servererror");
                            showMessage({timeout:5000, message:"Crafting failed"});
                        }
                    }});

            }
            await refreshUserData();
            craftingMenu.applyStateChange();
            craftingMenu.show();
            craftingMenu.onClose(()=>{
                reproduceAvatarSound("ui_craft_cancel");
                state.crafting = false;
            })
        }, {hoverText:"Craft golf course parts with refined materials"}));
        globalStore.game.onChange(showOrHideWorkbench, "playing");
        globalStore.game.onChange(showOrHideWorkbench, "editing");

        function showOrHideWorkbench({newValue, oldValue, prop}){
            if(newValue){
                entity.setParent(null);
                engine.removeEntity(entity);
            }else{
                entity.setParent(parent);
            }
        }
    }
}


function getSignatureParameters(signature) {
    var r = signature.slice(0, 66);
    var s = "0x".concat(signature.slice(66, 130));
    var vs = "0x".concat(signature.slice(130, 132));
    var v = Number(vs);
    if (![27, 28].includes(v)) v += 27;
    return {
        r: r,
        s: s,
        v: v
    };
};
function requestTypedV4Signature(provider, address, dataToSign) {
    return new Promise((resolve, reject) => {
        provider.sendAsync(
            {
                jsonrpc: '2.0',
                id: 1,
                method: "eth_signTypedData_v4",
                params: [
                    address,
                    JSON.stringify(dataToSign)
                ],
                from: address
            }, (error: any, response: any) => {
                if (error) {
                    reject(error)
                } else {
                    resolve({signature: response.result, dataToSign});
                }
            }
        );
    });
}

export class TransactionStatusSystem implements ISystem {
    time = 0.0
    update(dt: number) {
        this.time += dt
        if (this.time < 15) return
        this.time = 0.0
        if (action_id == null) return

        log("Checking part craft action", action_id)
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
                    refreshUserData()
                    showMessage({timeout:5000, message:"Part crafted successfully!"});
                    log("Part craft action success", action_id)
                } else if (result.result.state == 0) {
                    showMessage({timeout:5000, message:"Error crafting part. Try again later."});
                    log("Part craft action error", action_id)
                }
            } catch {
                log("failed to reach URL");
            }
        })
    }
  }

  engine.addSystem(new TransactionStatusSystem())