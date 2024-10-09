/*
Create the Fashion Claiming Machine
*/

import { signedFetch, FlatFetchResponse } from '@decentraland/SignedFetch'
import * as ui from '@dcl/ui-scene-utils'
import { getUserData } from '@decentraland/Identity'
import {getGLTFShape} from "../../golfplay/services/resource-repo"
import {refreshUserData} from "../services/userData"
import { registerSound, reproduceAvatarSound } from "../services/avatar-sound"

registerSound("ui_wbl_accept")
registerSound("ui_wbl_cancel")
registerSound("ui_wbl_click")
registerSound("ui_wbl_error_tickets")

const animator = new Animator()
animator.addClip(new AnimationState("0. idle"))
const animColLeft = new AnimationState("1. button_col_left")
animColLeft.looping = false
animator.addClip(animColLeft)
const animColRight = new AnimationState("2. button_col_right")
animColRight.looping = false
animator.addClip(animColRight)
const animItemLeft = new AnimationState("3. button_item_left")
animItemLeft.looping = false
animator.addClip(animItemLeft)
const animItemRight = new AnimationState("4. button_item_right")
animItemRight.looping = false
animator.addClip(animItemRight)

const CATALOG_ENDPOINT = "https://golfcraftgame.com/api/wearables-catalog";

var catalog = []
var collections = []
var current_collection = 0
var current_item = 0

const collectionNameShape = new TextShape("-")
const itemNameShape = new TextShape("-")
const itemPriceShape = new TextShape("-")
const itemInfoShape = new TextShape("-")
const itemGLTFEntity = new Entity()
const baseEntity = new Entity();

let fashiontickets = 0;
let playfabid = "";
let userid = "";

const ENDPOINT = 'https://golfcraftgame.com/bridge/buy-wearable-ft'
const ACTION_ENDPOINT = 'https://golfcraftgame.com/bridge/action/'

var claim_prompt: boolean = false
var action_id: number|null = null

export const createFashionLobby = () => {

    baseEntity.addComponent(new Transform({
        position: new Vector3(37.2, 15.1, 13),
        //position: new Vector3(37.2, 1, 13),
        rotation: Quaternion.Euler(0, -55, 0)
    }));
    engine.addEntity(baseEntity)


    const fashionshopEntity = new Entity();
    fashionshopEntity.addComponent(getGLTFShape("models/building/vending_machine.gltf"))
    fashionshopEntity.getComponent(GLTFShape).isPointerBlocker = false
    fashionshopEntity.addComponent(animator)
    fashionshopEntity.setParent(baseEntity)

    const invisibleMaterial = new Material()
    invisibleMaterial.albedoColor = new Color4(0, 0, 0, 0)

    const changeCollection = new Entity()
    changeCollection.addComponent(new BoxShape())
    changeCollection.addComponent(invisibleMaterial)
    changeCollection.addComponent(new OnPointerDown((e)=>{
        if (e.buttonId == 0) {
            //log("Clicked pointer")
        } else if (e.buttonId == 1 && !claim_prompt) {
            log("Pressed E collection")
            //updateCollection(-1)
            updateItem(-1)
            playAnimation("col_left")
            reproduceAvatarSound("ui_club_previous")
        } else if (e.buttonId == 2 && !claim_prompt) {
            log("Pressed F collection")
            //updateCollection(1)
            updateItem(1)
            playAnimation("col_right")
            reproduceAvatarSound("ui_club_next")
        }
    },
    {
        showFeedback: false,
        button: ActionButton.ANY
    }
    ))
    changeCollection.addComponent(new Transform({
        position: new Vector3(0, 0.5, 2),
        rotation: Quaternion.Euler(-40, 0, 0),
        scale: new Vector3(5, 1.2, 0.1)
    }))
    changeCollection.setParent(baseEntity)

    const changeWearable = new Entity()
    changeWearable.addComponent(new BoxShape())
    changeWearable.addComponent(invisibleMaterial)
    changeWearable.addComponent(new OnPointerDown((e)=>{
        if (e.buttonId == 1 && !claim_prompt) {
            log("Pressed E wearable")
            updateItem(-1)
            playAnimation("item_left")
            reproduceAvatarSound("ui_club_previous")
        } else if (e.buttonId == 2 && !claim_prompt) {
            log("Pressed F wearable")
            updateItem(1)
            playAnimation("item_right")
            reproduceAvatarSound("ui_club_next")
        }
    },
    {
        showFeedback: false,
        button: ActionButton.ANY
    }
    ))
    changeWearable.addComponent(new Transform({
        position: new Vector3(0, 3.5, 0.1),
        rotation: Quaternion.Euler(-28, 0, 0),
        scale: new Vector3(10, 4.5, 0.1)
    }))
    changeWearable.setParent(baseEntity)

    const claimWearable = new Entity()
    claimWearable.addComponent(new BoxShape())
    claimWearable.addComponent(invisibleMaterial)
    claimWearable.addComponent(new OnPointerDown((e)=>{
        if (e.buttonId == 0 && !claim_prompt) {
            log("Mouse Claim")
            onClaimWearable()
        } else if (e.buttonId == 1 && !claim_prompt) {
            log("Pressed E wearable")
            updateItem(-1)
            playAnimation("item_left")
            reproduceAvatarSound("ui_club_previous")
        } else if (e.buttonId == 2 && !claim_prompt) {
            log("Pressed F wearable")
            updateItem(1)
            playAnimation("item_right")
            reproduceAvatarSound("ui_club_next")
        }
    },
    {
        showFeedback: true,
        hoverText: "Claim",
        button: ActionButton.ANY
    }
    ))
    claimWearable.addComponent(new Transform({
        position: new Vector3(-1.8, 3, 1),
        rotation: Quaternion.Euler(0, 0, 0),
        scale: new Vector3(1.8, 1.5, 0.1)
    }))
    claimWearable.setParent(baseEntity)

    const collectionName = new Entity()
    collectionName.addComponent(collectionNameShape)
    collectionNameShape.fontSize = 2
    collectionNameShape.width = 2.5
    collectionNameShape.textWrapping = true
    collectionNameShape.vTextAlign = "top"
    collectionName.addComponent(new Transform({
        position: new Vector3(0, 0.5, 2.3),
        rotation: Quaternion.Euler(40, 180, 0)
    }))
    collectionName.setParent(baseEntity)

    const itemDataEntity = new Entity()
    itemDataEntity.addComponent(new Transform({
        position: new Vector3(-1.7, 3.1, 0.85),
        rotation: Quaternion.Euler(0, 180+10, 0),
    }))
    itemDataEntity.setParent(baseEntity)

    const itemName = new Entity()
    itemName.addComponent(itemNameShape)
    itemNameShape.fontSize = 1
    itemNameShape.width = 1.5
    itemNameShape.textWrapping = true
    itemNameShape.vTextAlign = "top"
    itemName.addComponent(new Transform({
        position: new Vector3(0, 0.2, 0),
    }))
    itemName.setParent(itemDataEntity)

    const itemPrice = new Entity()
    itemPrice.addComponent(itemPriceShape)
    itemPriceShape.fontSize = 2
    itemPriceShape.hTextAlign = "left"
    itemPriceShape.vTextAlign = "top"
    itemPrice.addComponent(new Transform({
        position: new Vector3(-0.8, -0.1, 0),
    }))
    itemPrice.setParent(itemDataEntity)

    const itemInfo = new Entity()
    itemInfo.addComponent(itemInfoShape)
    itemInfoShape.fontSize = 1
    itemInfoShape.hTextAlign = "left"
    itemInfoShape.vTextAlign = "top"
    itemInfo.addComponent(new Transform({
        position: new Vector3(-0.8, 0.5, 0),
    }))
    itemInfo.setParent(itemDataEntity)

    itemGLTFEntity.addComponent(new Transform({
        position: new Vector3(0, 1.5, 0.1),
        scale: new Vector3(1.5, 1.5, 1.5)
    }))
    itemGLTFEntity.setParent(baseEntity)
};

export function showFashionLobby() {
    engine.addEntity(baseEntity)
}

export function hideFashionLobby(){
    engine.removeEntity(baseEntity)
}

executeTask(async () => {
    try {
        let response = await fetch(CATALOG_ENDPOINT);
        catalog = await response.json()
        log("catalog", catalog)
        collections = Object.keys(catalog)
        updateInformation()
    } catch {
        log("failed to reach URL");
    }
})

function updateCollection(step: number) {
    if (collections.length == 0) return
    current_collection += step
    if (current_collection < 0) {
        current_collection = collections.length-1
    } else if (current_collection > collections.length-1) {
        current_collection = 0
    }
    current_item = 0
    updateInformation()
}

function updateItem(step: number) {
    if (collections.length == 0) return
    const collection_id = collections[current_collection]
    current_item += step
    if (current_item < 0) {
        updateCollection(-1)
        const new_collection_id = collections[current_collection]
        current_item = catalog[new_collection_id].items.length-1
    } else if (current_item > catalog[collection_id].items.length-1) {
        updateCollection(1)
        current_item = 0
    }
    updateInformation()
}

function updateInformation() {
    if (collections.length == 0) return
    const collection_id = collections[current_collection]
    const collectionName = catalog[collection_id].name
    const itemData = catalog[collection_id].items[current_item]
    collectionNameShape.value = collectionName
    itemNameShape.value = itemData.name
    var price_text = ""

    //maxMintsByAddress
    //price
    //maxStock - sold

    Object.keys(itemData.price).forEach((p)=>{
        price_text += p + ": " + itemData.price[p] + "\n"
    })
    itemPriceShape.value = price_text

    itemInfoShape.value = "Max Claims: " + itemData.maxMintsByAddress
    itemInfoShape.value += "\nMin Level: " + itemData.minPlayerLevel
    itemInfoShape.value += "\nSuply: "+ itemData.supply
    itemInfoShape.value += "\nStock: " + (itemData.maxStock - itemData.sold)

    var glb_extension = ".glb"
    if (itemData.id.startsWith("jungle-")) {
        glb_extension = ".gltf"
    }
    itemGLTFEntity.addComponentOrReplace(new GLTFShape("models/fashion/"+itemData.id+glb_extension))
}

function onClaimWearable() {
    //if(state.loading) return;
    if (claim_prompt) {
        return;
    }
    if (action_id != null) {
        ui.displayAnnouncement("Claim in process. Try again later.");
        return;
    }
    reproduceAvatarSound("ui_wbl_click");
    claim_prompt = true;

    const collection_id = collections[current_collection]
    const itemData = catalog[collection_id].items[current_item]
    const ftprice = itemData.price.FT // TODO FT hardcode


    let prompt = new ui.OptionPrompt(
        `Claiming a ${itemData.name}`,
        `Claim ${itemData.name} for ${ftprice} Fashion Tickets`,
        async () => {
            log(`Claim`)
            
            if (ftprice > fashiontickets) {
                ui.displayAnnouncement("You don't have enough FashionTickets");
                reproduceAvatarSound("ui_wbl_error_tickets");
                claim_prompt = false;
                return;
            }
            //setLoading(true);
            reproduceAvatarSound("ui_wbl_accept");

            let response: FlatFetchResponse
            try{
                const user = await getUserData(); //TODO not needed, displayName can be taken from setUserData 
                response = await signedFetch(ENDPOINT, {
                    method:'POST',
                    body:JSON.stringify({
                        wearableId:itemData.wearableId,
                        contract:catalog[collection_id].contract,
                        PlayFabId: playfabid,
                        address: userid,
                        displayName:user.displayName,
                        user:{
                            displayName:user.displayName
                        }
                    }),
                    headers:{
                        "Content-Type":"application/json"
                    }
                })
            }catch(err){
                log("fetch error",err);
                //setLoading(false);
                ui.displayAnnouncement(err && (err.error || err.data.message) || err)
                reproduceAvatarSound("ui_servererror");
            }
            claim_prompt = false;
            log(response)

            let json
            if (response.text) {
                json = await JSON.parse(response.text)
                log(json);
                //setLoading(false);
            }

            if (json && json.ok === true) {
                //onSale && onSale();
                log('All good');
                ui.displayAnnouncement('Request sent. Processing...')
                action_id = json.actionID
                log("action_id", action_id)
                //setLoading(false);
                reproduceAvatarSound("ui_wbl_accept");
            } else {
                log('Not valid')
                ui.displayAnnouncement(json.error)
                //setLoading(false);
                reproduceAvatarSound("ui_servererror");
            }
        },
        () => {
            log(`Cancel`)
            claim_prompt = false;
            reproduceAvatarSound("ui_wbl_cancel");
        },
        'Claim',
        'Cancel'
    );
    prompt.closeIcon.onClick = new OnPointerDown((e)=>{
        prompt.close();
        claim_prompt = false
    });

}


function playAnimation(animName: string) {
    if (animName=="item_left") {
        animItemLeft.play(true)
    } else if (animName=="item_right") {
        animItemRight.play(true)
    } else if (animName=="col_left") {
        animColLeft.play(true)
    } else if (animName=="col_right") {
        animColRight.play(true)
    }
    
}

export function setUserData(user_data: any) {
    if(!user_data) return;
    if (user_data.FT !== undefined) {
        fashiontickets = user_data.FT;
    }
    if (user_data.PlayFabId) {
        playfabid = user_data.PlayFabId;
    }
    if (user_data.userId) {
        userid = user_data.userId;
    }
}

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
                    refreshUserData()
                    ui.displayAnnouncement('Wearable sent successfully!')
                    log("Action success", action_id)
                } else if (result.result.state == 0) {
                    ui.displayAnnouncement('Error sending wearable. Try again later.')
                    log("Action error", action_id)
                }
            } catch {
                log("failed to reach URL");
            }
        })
    }
  }

  engine.addSystem(new TransactionStatusSystem())