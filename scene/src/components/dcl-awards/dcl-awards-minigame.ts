import {globalStore} from "../../services/globalStore/globalStore";
import {getCanvas} from "../../../golfplay/services/canvas";
import positions from "../lobby/building-positions";
import {createVisualChest} from "../lobby/visualChest";
import {getBuilding} from "../lobby/building";
import {showMessage} from "../server-notification";
import {refreshUserData} from "../../services/userData";
import {getTexture} from "../ui/ui-texture";
import {registerSound, reproduceAvatarSound} from "../../../sound/avatar-sound";
import * as ui from '@dcl/ui-scene-utils'

/*const rewardImages = [
    { GD:10},
    { DM:10 },
    { FT:10 },
    { GD:100 },
    { DM:100 },
    { FT:100 },
    { wearable:1 }
].reduce((acc,current)=>{
    console.log("current",current)
    const key = Object.keys(current)[0];
    const amount = current[key];
    const img = new UIImage(
        getCanvas(),
        getTexture(`images/dclawards_${key.toLowerCase()}${amount}.png`, {hasAlpha:true, samplingMode:0})
    );
    img.visible = false;
    img.width = img.height =512;
    img.sourceWidth = img.sourceHeight = 1024;
    img.isPointerBlocker = false;

    acc[key+amount] = img;
    return acc;
}, {});*/

export const createDclAwardsMiniGame = async (root, {scenario, PlayFabId, user, realm, colyseus, lobbyRoom}) => {
    const room = await colyseus.joinOrCreate("dcl-awards-room");

    room.onStateChange.once(handleRoom);
    //registerSound("")
    function handleRoom(){
        room.onMessage("REWARD", ({message, timeout, reward})=>{
            showMessage({timeout, message});
            console.log("reward", reward);
      /*      delete reward.weight;
      //      reproduceAvatarSound("reward")
            const key = Object.keys(reward)[0];
            const amount = reward[key];
            rewardImages[key+amount].visible = true;
            setTimeout(()=>{
                rewardImages[key+amount].visible = false;
            },5000)*/
        });
        const currencyModels = {
            GC:"models/building/collectable_coin.gltf",
            WD:"models/building/collectable_wood.gltf",
            ST:"models/building/collectable_stone.gltf",
            IR:"models/building/collectable_iron.gltf",
            GD:"models/building/collectable_gold.gltf",
            DM:"models/building/collectable_diamond.gltf",
            EN:"models/building/collectable_energy.gltf",
            FT:"models/building/collectable_fashion_ticket.gltf",
/*            GIFT:"models/building/event_xmas_gift.glb"*/
        }
        const chests = []
        room.state.chests.forEach((chest, index)=>{
            console.log("chest", chest, index);
            const [x,y,z] = positions[Object.keys(positions).filter(k=>~k.indexOf("EmptyDCLAwardsPrize"))[index]].position;
            const chestComponent = createVisualChest(getBuilding(), {
                chest: {x, y, z}, offsetX: 0, offsetZ: 0,
                button: ActionButton.ANY,
                onClick: () => {
                    room.send("OPEN", {index, PlayFabId, displayName: user.displayName});
                },
                //TODO allow to also appear an event chest if chestEvent.building is 1
                model:currencyModels[chest.currency] || room.state.model || "models/building/collectable_coin.gltf"
            });
            chests.push( chestComponent );
            chest.onChange = () => {
                console.log("chest change", index, chest.currency, chest.visible);
                if(chest.visible){
                    //TODO GIFTS
                    chestComponent.show(currencyModels[chest.currency], chest.currency);
                }else{
                    chestComponent.hide();
                }
                refreshUserData();
            }

            if(chest.visible){
                chestComponent.show()
            }else{
                chestComponent.hide();
            }
            console.log("positioning globe", index, " - ", x,y,z);
        });

        console.log("show button?" ,globalStore.userData.getState().userId);

        if(~[
            "0x598f8af1565003ae7456dac280a18ee826df7a2c",
            "0xcf10cd8b5dc2323b1eb6de6164647756bad4de4d",
            "0x664EAbE08871a7b7f13AdE88bc34605ed5EAEAE6".toLowerCase()
        ].indexOf(globalStore.userData.getState().userId)){
            let prompt = new ui.FillInPrompt(
                'Activate with ms interval',
                (e: string) => {
                    const ms = e && Number(e) || 0;
                    if(!isNaN(ms)){
                        room.send("ACTIVATE",{interval:ms})
                    }
                },
                'Submit!',
                '5000'
            );
            prompt.hide();
            const btn = new UIContainerRect(getCanvas());
            btn.color = room.state.active ? Color4.Green():Color4.Red();
            btn.vAlign = "top";
            btn.hAlign = "left";
            btn.width = btn.height = 32;
            btn.positionX = 164;
            btn.positionY = 20;

            const handler = new UIImage(btn, new Texture(""));
            handler.opacity = 0.5;
            handler.width = handler.height = 34;
            handler.onClick = new OnPointerDown(()=>{
                if(room.state.active){
                    room.send("DEACTIVATE", {});
                }else{
                    //TODO ask input for interval
                 //  room.send("ACTIVATE", {});
                    prompt.show();
                }

            });

            room.state.onChange = ()=>{
                btn.color = room.state.active ? Color4.Green():Color4.Red();
            }

            // TODO reconnect
            room.onLeave((_code)=>{
                log("Dispose chests")
                chests.forEach((chest)=>{
                    chest.dispose()
                })
            })
        }
    }


}

