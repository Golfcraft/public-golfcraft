import utils from "../../../node_modules/decentraland-ecs-utils/index"
import {DoorComponent, DoorTriggerBehaviour} from './doors'

export var trapDoorTriggersInfo: TrapDoorTrigger[] = []
export var triggersInfo: Trigger[] = []
export class Trigger{
  triggerPosition: Vector3
  triggerSize: Vector3
  triggerRotation: Quaternion
  tags: string[]
  enableDebug: boolean
  bDebug: boolean
  constructor(position: Vector3, size: Vector3, tags: string[], enableDebug?: boolean, triggerRotation: Quaternion = new Quaternion(0,0,0,0)){
      this.triggerPosition = position
      this.triggerSize = size
      this.triggerRotation = triggerRotation
      this.tags = tags
      this.enableDebug = enableDebug
      this.bDebug = false
  }
  createTrigger(){
    let triggerBox = new utils.TriggerBoxShape(this.triggerSize, new Vector3(0,0,0))
    //create trigger for entity
    let trigger = new utils.TriggerComponent(
       triggerBox, //shape
       {
         layer: 0, //layer
         triggeredByLayer: 0, //triggeredByLayer
         onTriggerEnter: null, //onTriggerEnter
         onTriggerExit: null, //onTriggerExit
         onCameraEnter: null,  //onCameraEnter
         onCameraExit: null, //onCameraExit
         enableDebug: this.enableDebug
       }
    )

    const triggerEntity = new Entity()
    triggerEntity.addComponent(new Transform({ position: this.triggerPosition, rotation: this.triggerRotation}))
    triggerEntity.addComponent(trigger)
    engine.addEntity(triggerEntity)
    if (this.bDebug) {
      //Debug
      const debugEntity = new Entity()
      debugEntity.addComponent(new Transform({ position: this.triggerPosition , scale: this.triggerSize}))
      debugEntity.addComponent(new BoxShape())
      debugEntity.getComponent(BoxShape).withCollisions = false
      const myDebugMaterial = new Material()
      myDebugMaterial.albedoColor = new Color4(1, 0, 0, 0.2)
      debugEntity.addComponent(myDebugMaterial)
      engine.addEntity(debugEntity)
    }
    return trigger;
  }
}

export class TrapDoorTrigger{
  triggerPosition: Vector3
  triggerSize: Vector3
  doorEnititiesNames: string[]
  doorEnitities: DoorComponent[]
  bDebug: boolean
  doorBehaviour: DoorTriggerBehaviour
  constructor(position: Vector3, size: Vector3, doorBehaviour: DoorTriggerBehaviour, doorEnititiesNames: string[]){
      this.triggerPosition = position
      this.triggerSize = size
      this.doorEnititiesNames = doorEnititiesNames
      this.doorBehaviour = doorBehaviour
      this.bDebug = false
      this.doorEnitities = []
  }
  createTrigger(){
    if (this.doorEnitities.length==0) {
      for (const entityId in engine.getEntitiesWithComponent(DoorComponent)) {
        let entity: Entity = engine.getEntitiesWithComponent(DoorComponent)[entityId] as Entity
        if (this.doorEnititiesNames.indexOf(entity.name) != -1) {
            this.doorEnitities.push(entity.getComponent(DoorComponent))
        }
      }
    }
    let triggerBox = new utils.TriggerBoxShape(this.triggerSize, new Vector3(0,0,0))
    //create trigger for entity
    let trigger = new utils.TriggerComponent(
       triggerBox, //shape
       {
         layer: 0, //layer
         triggeredByLayer: 0, //triggeredByLayer
         onTriggerEnter: null, //onTriggerEnter
         onTriggerExit: null, //onTriggerExit
         onCameraEnter: null,  //onCameraEnter
         onCameraExit: null, //onCameraExit
         enableDebug: false
       }
    )

    const triggerEntity = new Entity()
    triggerEntity.addComponent(new Transform({ position: this.triggerPosition}))
    triggerEntity.addComponent(trigger)
    engine.addEntity(triggerEntity)
    if (this.bDebug) {
      //Debug
      const debugEntity = new Entity()
      debugEntity.addComponent(new Transform({ position: this.triggerPosition , scale: this.triggerSize}))
      debugEntity.addComponent(new BoxShape())
      debugEntity.getComponent(BoxShape).withCollisions = false
      const myDebugMaterial = new Material()
      myDebugMaterial.albedoColor = new Color4(1, 0, 0, 0.2)
      debugEntity.addComponent(myDebugMaterial)
      engine.addEntity(debugEntity)
    }
    return trigger;
  }
}
