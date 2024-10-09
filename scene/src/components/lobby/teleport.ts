import { movePlayerTo } from "@decentraland/RestrictedActions"

export type TeleportData = {
    clickEntity?: Entity
    targetLocation: Vector3
    hoverText ?: string
    //trigger?: Trigger
    trigger?: boolean
    camaraTarget ?: Vector3
    enableTeleportLoop?: boolean
    enableDebug?: boolean
    delayTeleport ?: number // milliseconds
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
                new OnPointerDown(() => {
                    this.teleportPlayer()
                }, {
                    hoverText: teleportData.hoverText
                })
            )
        }
    }
    teleportPlayer(target: Vector3 = this.teleportData.targetLocation){
        movePlayerTo({x: 48-target.x, y: target.y, z: 48-target.z}, this.teleportData?.camaraTarget || undefined)
    }
}
