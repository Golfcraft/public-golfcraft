import { signedFetch } from '@decentraland/SignedFetch';
import * as utils from "@dcl/ecs-scene-utils";
import { getEvents } from "./checkApi";
import { EventPanelData } from "./preSetEventData";
import { PortalUI } from "./portalUI";
import { warn } from 'console';


export class Portal {

    name: string
    bActive: boolean = false
    myTransform: Transform

    event: Array<any> = []
    event_data: EventPanelData[] = []

    portal: Entity
    portalImage: Entity
    portaltrigger: Entity
    portalAnimated: Entity
    eventLifeText: Entity

    delay: any
    delayTime: number

    isEventOnline: boolean = false

    portalUI: PortalUI

    user: any
    PlayFabId: string

    /**
     * Creates a portal to the event
     * @param event The event data
     * @param TransformArgs the transform of the portal
     * @param bActive if the portal is active or not
    */
    constructor(event: EventPanelData, TransformArgs: TransformConstructorArgs, user: any, PlayFabId: string) {
        (TransformArgs != null) ? this.myTransform = new Transform(TransformArgs) : this.myTransform = new Transform({ position: new Vector3(0, 0, 0), rotation: new Quaternion(0, 0, 0, 1), scale: new Vector3(1, 1, 1) });
        this.setPortalEntities();
        this.setProximityTrigger();
        this.setPointerDownPortal();
        this.checkIfEventIsOnline(event);
        this.createImagePortal();
        this.setPortalTrigger();
        this.bActive = true;
        this.portalUI = PortalUI.instance();
        this.user = user;
        this.PlayFabId = PlayFabId;
    }



    /**
     * Sets the portal entities and animations
    */
    private setPortalEntities() {

        if (this.portal == null) {
            this.portal = new Entity()
            this.portal.addComponent(new Transform(this.myTransform))
            engine.addEntity(this.portal)
        }

        if (this.portalImage == null) {
            this.portalImage = new Entity()
            this.portalImage.addComponent(new Transform({ position: new Vector3(0, 2.18, -0.2), scale: new Vector3(3.2, -3.2, 3.2), rotation: Quaternion.Euler(0, 180, 0) }))
            this.portalImage.addComponent(new PlaneShape())
            this.portalImage.getComponent(PlaneShape).visible = false
            this.portalImage.setParent(this.portal)
            engine.addEntity(this.portalImage)

        }

        if (this.eventLifeText == null) {
            this.eventLifeText = new Entity()
            this.eventLifeText.addComponent(new Transform({ position: new Vector3(0, 0, 0), scale: new Vector3(1, 1, 1) }))
            this.eventLifeText.addComponent(new GLTFShape("models/pride-portal/portal_live_now.glb"))
            this.eventLifeText.getComponent(GLTFShape).visible = false
            this.eventLifeText.setParent(this.portal)
        }


        if (this.portaltrigger == null) {
            this.portaltrigger = new Entity()
            this.portaltrigger.addComponent(new Transform({ position: new Vector3(0, 0, 0), scale: Vector3.One().scale(1) }))
            engine.addEntity(this.portaltrigger)
            this.portaltrigger.setParent(this.portalImage)

        }

        if (this.portalAnimated == null) {
            this.portalAnimated = new Entity()
            this.portalAnimated.addComponent(new Transform({ position: new Vector3(0, 0, 0), scale: Vector3.One().scale(1) }))
            this.portalAnimated.addComponent(new GLTFShape("models/pride-portal/pride_portal.glb"))
            this.portalAnimated.addComponent(new Animator())
            const idle = new AnimationState("Portal_Idle", { layer: 0 })
            const portalOff = new AnimationState("Anim_Portal_OFF", { layer: 0, looping: false })
            const portalOn = new AnimationState("Anim_Portal_ON", { layer: 0, looping: false })
            this.portalAnimated.getComponent(Animator).addClip(idle)
            this.portalAnimated.getComponent(Animator).addClip(portalOff)
            this.portalAnimated.getComponent(Animator).addClip(portalOn)
            engine.addEntity(this.portalAnimated)
            this.portalAnimated.setParent(this.portal)
        }

    }
    private createImagePortal() {
        this.portalImage.addComponentOrReplace(new Material())
        if (this.event_data[0]) {
            this.portalImage.getComponent(Material).albedoTexture = new Texture(this.event_data[0].image)
        }
        this.portalImage.getComponent(Material).alphaTexture = new Texture("images/pride-portal/portal_mask_01.png")

    }



    /**
     *  Sets the portal event
     * @param event Of the owner of the event
     */
    private async checkIfEventIsOnline(event: EventPanelData) {
        this.event_data[0] = event

        if (event.id.length == 0) {
            log(" Event id is empty")

        } else {

            this.event = await getEvents("https://events.decentraland.org/api/events")
            this.event = this.event.filter((e: any) => e.id == event.id)

            if (this.event.length > 0) {
                this.isEventOnline = true
                this.onlineAnimation()

            } else {
                log("No online events found in the Decentraland Api with the id: " + event.id)
                //Set event to default animation
            }
        }

    }


    /**
     * Sets the portal to pointer down to player jump in to the event
     */
    private setPointerDownPortal() {
        this.portalImage.addComponent(new OnPointerDown(
            (e) => {
                //Show portal tp ui
                log("Portal pointer down");
                (this.bActive) ? (this.showPortalUI()) : log("Portal is not active");

            },
            {
                button: ActionButton.POINTER,
                hoverText: "Jump in!",
                distance: 10
            }
        ))
    }

    /**
     * Sets the portal trigger to player enter
     */
    private setPortalTrigger() {
        this.portaltrigger.addComponent(new utils.TriggerComponent(
            new utils.TriggerBoxShape(new Vector3(4, 4, 4), new Vector3(0, 1, 0)),
            {
                onCameraEnter: () => {
                    (this.bActive) ? (this.showPortalUI()) : log("Portal is not active");
                    log("Portal trigger camera enter")
                },
                enableDebug: false
            }

        ))
    }


    /**
    * Teleports the player to the event and shows DCL UI
    */
    private showPortalUI() {
        this.portalUI.showTeleportToLand(() => {
            try {
                var data = JSON.stringify({
                    address: this.user.publicKey,
                    PlayFabId: this.PlayFabId,
                    itemId: 0,
                    displayName:this.user.displayName
                });
                signedFetch("https://golfcraftgame.com/bridge/claim-pride-wearable",{
                    method:"post",
                    body:data,
                    headers:{
                        "Content-Type":"application/json"
                    }
                });
            } catch (error) {
                warn(error)
            }
            teleportTo(this.event_data[0].coordinates.x.toString() + ',' + this.event_data[0].coordinates.y.toString())
        })
        // teleportTo(this.event_data[0].coordinates.x.toString() + ',' + this.event_data[0].coordinates.y.toString())
    }


    /**
     * Sets the proximity trigger to activate the portal
     */
    private setProximityTrigger() {
        this.portal.addComponent(new utils.TriggerComponent(
            new utils.TriggerBoxShape(new Vector3(32, 4, 32), new Vector3(0, 0.5, 0)),
            {
                onCameraEnter: () => {
                    this.activateAnimation()
                    log("ProximityTrigger camera enter")
                },
                onCameraExit: () => {
                    this.deactivateAnimation()
                    log("ProximityTrigger camera exit")
                },
                enableDebug: false
            }

        ))
    }

    private delayedFunction(delayTime: number, functionToCall: Function) {
        const delayEntity = new Entity()
        delayEntity.addComponent(new utils.Delay(delayTime, () => {
            functionToCall()
            engine.removeEntity(this.delay)
        }))
        this.delay = delayEntity
        engine.addEntity(this.delay)
    }


    //TODO: Set all new animations according to the new model
    private activateAnimation() {
        this.portalAnimated.getComponent(Animator).getClip("Anim_Portal_OFF").stop()
        this.portalAnimated.getComponent(Animator).getClip("Anim_Portal_ON").play()
        this.delayedFunction(2083, () => { this.activateAnimationDelayed() })
    }

    private activateAnimationDelayed() {
        this.portalAnimated.getComponent(Animator).getClip("Anim_Portal_ON").stop()
        this.portalAnimated.getComponent(Animator).getClip("Portal_Idle").play()
        this.portalImage.getComponent(PlaneShape).visible = true
    }

    private deactivateAnimation() {
        this.portalImage.getComponent(PlaneShape).visible = false
        this.eventLifeText.getComponent(GLTFShape).visible = false
        this.portalAnimated.getComponent(Animator).getClip("Portal_Idle").stop()
        this.portalAnimated.getComponent(Animator).getClip("Anim_Portal_OFF").play()
    }

    private onlineAnimation() {
        this.eventLifeText.getComponent(GLTFShape).visible = true
        log("Online animation")
    }

}
