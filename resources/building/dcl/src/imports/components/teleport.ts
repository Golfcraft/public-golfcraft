import { movePlayerTo } from "@decentraland/RestrictedActions"
import { clearDelay, delay } from "./delay"
import { Trigger } from "./triggers"

export type TeleportData = {
    clickEntity?: Entity
    targetLocation: Vector3
    hoverText ?: string
    trigger?: Trigger
    camaraTarget ?: Vector3
    enableTeleportLoop?: boolean
    enableDebug?: boolean
    delayTeleport ?: number // milesimas
}

var nextTeleport = true
var delayHandle = null

function canTeleport(reset: boolean = false) {
    const aux = nextTeleport
    if (reset) {
        resetNextTeleport()
    }
    return aux
}
function deactivateNextTeleport(resetInTime = 0.1) {
    nextTeleport = false
    if (delayHandle) {
        clearDelay(delayHandle)
    }
    delayHandle = delay(() => {
        nextTeleport = true
    }, resetInTime*1000);
}

function resetNextTeleport() {
    if (!nextTeleport) {
        if (delayHandle) {
            clearDelay(delayHandle)
        }
        nextTeleport = true
    }
}

@Component("Teleport")
export class Teleport{
    teleportData: TeleportData
    constructor(teleportData: TeleportData){
        var self = this
        if(teleportData.hoverText === undefined || teleportData.hoverText === null){
            teleportData.hoverText = "Teleport"
        }
        if(!teleportData.delayTeleport){
            teleportData.delayTeleport = 0
        }
        this.teleportData = teleportData
        if(teleportData.clickEntity){
            teleportData.clickEntity.addComponent(
                new OnClick(() => {
                    delay(() => {
                        this.teleportPlayer()
                    }, teleportData.delayTeleport);
                }, {
                    hoverText: teleportData.hoverText
                })
            )
        }
        if(teleportData.trigger){
            teleportData.trigger.createTrigger().onCameraEnter= function(){
                delay(() => {
                self.teleportPlayer();
            }, teleportData.delayTeleport);
            }
        }
        // if(teleportData.enableDebug){
        //     teleportData.trigger.bDebug = teleportData.enableDebug
        // }
    }
    teleportPlayer(target: Vector3 = this.teleportData.targetLocation){
        if(canTeleport()){
            if(!this.teleportData.enableTeleportLoop){
                deactivateNextTeleport()
            }
            movePlayerTo({x: target.x, y: target.y, z: target.z}, this.teleportData.camaraTarget)
        }
        else {
            resetNextTeleport()
        }
    }
}
