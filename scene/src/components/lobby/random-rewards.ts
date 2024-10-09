/*
Create the Random Rewards Machine
*/

import { signedFetch, FlatFetchResponse } from '@decentraland/SignedFetch'
import * as ui from '@dcl/ui-scene-utils'
import {getGLTFShape, getTexture} from "../../../golfplay/services/resource-repo"
import {refreshUserData} from "../../services/userData"
import {createImageButton} from "../imageButton";
import {getSpriteUv} from "../../../golfplay/mana-fever-utils/lib/sprite";
import {getUvsFromSprite} from "../../../../common/utils";

var coinbalance = 0
var playfabid = ""
var userid = ""
var userName = ""
var cost = 0

var claim_prompt: boolean = false
var action_id: number|null = null
var item_data: any = {}
const baseEntity = new Entity()

const REWARD_COST_ENDPOINT = "https://golfcraftgame.com/bridge/random-reward-cost"
const ACTION_ENDPOINT = 'https://golfcraftgame.com/bridge/action/'

export const createRandomReward = () => {
    engine.addEntity(baseEntity);
    baseEntity.addComponent(new Transform({
        position:new Vector3(4.7, 1.0, 41.7),
        rotation: Quaternion.Euler(0, 135, 0)
    }))
    const prizesButton = new Entity();
    const prizesButtonShape = new BoxShape();
    const prizesButtonMaterial = new Material();
    prizesButtonMaterial.albedoColor = new Color4(0,0,0,0);

    prizesButton.addComponent(prizesButtonMaterial);

    //prizesButtonShape.uvs = getUvsFromSprite(1024, 1024, 649, 178, 192,257);
    prizesButtonShape.withCollisions = true;
    prizesButtonShape.isPointerBlocker = true;
    prizesButton.addComponent(prizesButtonShape);
    prizesButton.addComponent(new Transform({
        position:new Vector3(0,3.2,0.6),
        scale:new Vector3(0.75,-1,0.3)
    }))
    prizesButton.addComponent(new OnPointerDown(()=>{
        openExternalURL("https://golfcraftgame.com/bridge/lucky-balls");
    }, {hoverText:"Open prize list"}))
    prizesButton.setParent(baseEntity);

    const randomRewardsButton = new Entity()
    randomRewardsButton.addComponent(getGLTFShape("models/nft_machine.glb"))

    randomRewardsButton.addComponent(new OnPointerDown((e)=>{
        if (claim_prompt) return
        if (action_id != null) {
            ui.displayAnnouncement("Claim in process. Try again later.")
            return
        }
        claim_prompt = true
        onClaimRandomReward()
    },{
        button: ActionButton.POINTER,
        showFeedback: true,
        hoverText: "Get Random Reward"
    }))

    randomRewardsButton.setParent(baseEntity)
}

export function showRandomReward() {
    engine.addEntity(baseEntity)
}

export function hideRandomReward(){
    engine.removeEntity(baseEntity)
}

function onClaimRandomReward() {
    ui.displayAnnouncement('Loading...')
    executeTask(async () => {
        try {
            const response = await fetch(REWARD_COST_ENDPOINT);
            const info = await response.json()
            cost = info.cost

            let prompt = new ui.OptionPrompt(
                "Claiming a random reward",
                `Claim a random reward for ${cost} Coins`,
                async () => {
                    claim_prompt = false
                    executeClaim()
                },
                () => {
                    log(`Cancel`)
                    claim_prompt = false
                },
                'Claim',
                'Cancel'
            )
            prompt.closeIcon.onClick = new OnPointerDown((e)=>{
                claim_prompt = false
                prompt.close();
            });
        } catch {
            log("failed to reach reward cost URL")
        }
    })

    
}

async function executeClaim() {
    var data = JSON.stringify({
        address: userid,
        PlayFabId: playfabid,
        displayName: userName,
        maxPrice: cost
    });
    let response: FlatFetchResponse
    try {
        response = await signedFetch("https://golfcraftgame.com/bridge/claim-random-reward",{
            method:"post",
            body:data,
            headers:{
                "Content-Type":"application/json"
            }
        })
    } catch(err) {
        log("fetch error",err);
        ui.displayAnnouncement(err && (err.error || err.data.message) || err)
    }
    let json
    if (response.text) {
        json = await JSON.parse(response.text)
        log(json);
    }
    if (json && json.ok === true) {
        log('All good');
        ui.displayAnnouncement('Request sent. Processing...')
        action_id = json.actionID
        item_data = json.data
        log("action_id", action_id)
    } else {
        log('Not valid')
        ui.displayAnnouncement(json.error)
    }
}

export function setUserRandomRewardData(user_data: any) {
    if(!user_data) return;
    if (user_data.GC !== undefined) {
        coinbalance = user_data.GC;
    }
    if (user_data.PlayFabId) {
        playfabid = user_data.PlayFabId;
    }
    if (user_data.userId) {
        userid = user_data.userId;
    }
    if (user_data.user) {
        userName = user_data.user.displayName
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
                    ui.displayAnnouncement(`Reward sent successfully!\n${item_data.collection_name}:${item_data.token_name}`)
                    log("Action success", action_id)
                } else if (result.result.state == 0) {
                    ui.displayAnnouncement('Error sending reward. Try again later.')
                    log("Action error", action_id)
                }
            } catch {
                log("failed to reach URL");
            }
        })
    }
  }

  engine.addSystem(new TransactionStatusSystem())