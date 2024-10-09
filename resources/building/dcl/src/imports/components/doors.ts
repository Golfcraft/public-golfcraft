import { MoveComponent, MovementType } from './movement'
import { delay, clearDelay } from './delay'

export var doorSwitches: DoorSwitchComponent[] = []

export enum DoorTriggerBehaviour {
    Close = 0,
    Open = 1,
    Toggle = 2,
    CloseAndOpen = 3,
}

//Manage movement between openPosition and closedPosition
@Component('DoorComponent')
export class DoorComponent{
    doorEntity: IEntity
    closeSpeed: number  //Movement speed
    waitToClose: number   //Delay between open/close call and movement start
    startClosed: Boolean  //If the door starts in the closedPosition
    closeMoveVector: Vector3 //The relative vector to close
    openPosition: Vector3 //Position when the door is open, sets when constructed with the entity position
    closedPosition: Vector3 //Position when the door is closed, sets when constructed with the entity position+closeMoveVector
    bIsClosed: Boolean
    instantCloseAndDisapear: Boolean
    callback: Function
    bInMovmement: Boolean
    waitTimeout: any
    audioMove: AudioSource
    audioStop: AudioSource
    audioMoveEntity: IEntity
    audioStopEntity: IEntity
    moveComponent: MoveComponent
    openScale: Vector3
    constructor(doorEntity: IEntity, closeSpeed: number, waitToClose: number, startClosed: Boolean, instantCloseAndDisapear: boolean, closeMoveVector: Vector3, callback: Function = function(){}){
        this.doorEntity = doorEntity
        this.closeSpeed = closeSpeed
        this.waitToClose = waitToClose
        this.startClosed = startClosed
        this.closeMoveVector = closeMoveVector
        this.instantCloseAndDisapear = instantCloseAndDisapear
        this.openPosition = new Vector3(doorEntity.getComponent(Transform).position.x, doorEntity.getComponent(Transform).position.y, doorEntity.getComponent(Transform).position.z)
        this.closedPosition = Vector3.Add(this.openPosition, this.closeMoveVector)
        this.openScale = doorEntity.getComponent(Transform).scale.clone()
        this.bIsClosed = false
        this.callback = callback
        let self = this
        this.moveComponent = new MoveComponent(MovementType.Simple, this.openPosition, this.doorEntity, this.closeSpeed, false, false, function(){
          //Deactivate and remove MoveComponent from the system update loop, when the movement is finished
          this.bActive = false
          this.entityToMove.removeComponent(MoveComponent)
          self.bInMovmement = false
          self.playAudioStop()
          self.callback()
        })
        //Fixed update speed
        this.moveComponent.movement.dt = 0.016666
        if (startClosed) {
            this.closeDoor(true)
        }
    }
    //Open or close the door with SimpleMoveComponent, bInstant to skip use of movement over time
    toggleDoor(bInstant: boolean = false){
      if (this.bIsClosed) {
        this.openDoor(bInstant)
      }
      else {
        this.closeDoor(bInstant)
      }
    }
    openDoor(bInstant: boolean = false){
      if (this.bIsClosed) {
        if (this.instantCloseAndDisapear) {
          this.moveComponent.movement.bActive = false
          this.doorEntity.getComponent(Transform).scale = new Vector3(0,0,0)
          if (this.doorEntity.hasComponent(GLTFShape)) {
            this.doorEntity.getComponent(GLTFShape).visible = false
            this.doorEntity.getComponent(GLTFShape).withCollisions = false
          }
        }
        else if (bInstant) {
            if (this.bInMovmement) {
              this.moveComponent.movement.bActive = false
              this.doorEntity.removeComponent(MoveComponent)
              if (this.waitTimeout) {
                clearDelay(this.waitTimeout)
              }
            }
            this.doorEntity.getComponent(Transform).position.set(this.openPosition.x, this.openPosition.y, this.openPosition.z)

        }
        else{
          let selfDoor = this
          if (this.bInMovmement) {
            this.moveComponent.movement.bActive = false
            if (this.waitTimeout) {
              clearDelay(this.waitTimeout)
            }
          }
          this.bInMovmement = true
          this.moveComponent.movement.speed = this.closeSpeed
          this.moveComponent.movement.targetLocation = this.openPosition
          if (this.waitToClose>0) {
            this.waitTimeout = delay(function () {
              if (!selfDoor.doorEntity.hasComponent(MoveComponent)) {
                selfDoor.doorEntity.addComponent(selfDoor.moveComponent)
              }
              selfDoor.playAudioMove()
              selfDoor.moveComponent.movement.bActive = true
            }, this.waitToClose*1000);
          }
          else{
            if (!selfDoor.doorEntity.hasComponent(MoveComponent)) {
              selfDoor.doorEntity.addComponent(selfDoor.moveComponent)
            }
            selfDoor.playAudioMove()
            selfDoor.moveComponent.movement.bActive = true
          }
        }
        this.bIsClosed = false
      }
    }
    closeDoor(bInstant: boolean = false){
      if (!this.bIsClosed) {
        if (this.instantCloseAndDisapear) {
          this.moveComponent.movement.bActive = false
          this.doorEntity.getComponent(Transform).scale = this.openScale.clone()
          if (this.doorEntity.hasComponent(GLTFShape)) {
            this.doorEntity.getComponent(GLTFShape).visible = true
            this.doorEntity.getComponent(GLTFShape).withCollisions = true
          }
        }
        else if (bInstant) {
            if (this.bInMovmement) {
              this.moveComponent.movement.bActive = false
              this.doorEntity.removeComponent(MoveComponent)
              if (this.waitTimeout) {
                clearDelay(this.waitTimeout)
              }
            }
            this.doorEntity.getComponent(Transform).position.set(this.closedPosition.x, this.closedPosition.y, this.closedPosition.z)
        }
        else{
          let selfDoor = this
          if (this.bInMovmement) {
            this.moveComponent.movement.bActive = false
            if (this.waitTimeout) {
              clearDelay(this.waitTimeout)
            }
          }
          this.bInMovmement = true
          this.moveComponent.movement.speed = this.closeSpeed
          this.moveComponent.movement.targetLocation =  this.closedPosition
          if (this.waitToClose>0) {
            this.waitTimeout = delay(function () {
              if (!selfDoor.doorEntity.hasComponent(MoveComponent)) {
                selfDoor.doorEntity.addComponent(selfDoor.moveComponent)
              }
              selfDoor.playAudioMove()
              selfDoor.moveComponent.movement.bActive = true
            }, this.waitToClose*1000);
          }
          else{
            if (!selfDoor.doorEntity.hasComponent(MoveComponent)) {
              selfDoor.doorEntity.addComponent(selfDoor.moveComponent)
            }
            selfDoor.playAudioMove()
            selfDoor.moveComponent.movement.bActive = true
          }

        }
        this.bIsClosed = true
      }
    }
    resetDoor(){
      if (this.startClosed) {
        this.closeDoor()
      }
      else{
        this.openDoor()
      }
    }
    setAudio(audioMoveClip: AudioClip, audioStopClip: AudioClip){
      if (!this.audioMoveEntity) {
        this.audioMoveEntity = new Entity()
        this.audioMoveEntity.setParent(this.doorEntity)
      }
      if (!this.audioStopEntity) {
        this.audioStopEntity = new Entity()
        this.audioStopEntity.setParent(this.doorEntity)
      }
      this.audioMove = new AudioSource(audioMoveClip)
      this.audioMove.loop = true
      this.audioMoveEntity.addComponentOrReplace(this.audioMove)

      this.audioStop = new AudioSource(audioStopClip)
      this.audioStop.loop = false
      this.audioStopEntity.addComponentOrReplace(this.audioStop)
    }
    playAudioMove(){
      if (this.audioStop) {
        this.audioStop.playing = false
      }
      if (this.audioMove) {
        this.audioMove.playing = true
      }
    }
    playAudioStop(){
      if (this.audioMove) {
        this.audioMove.playing = false
      }
      if (this.audioStop) {
        this.audioStop.playing = true
      }

    }
}
@Component('DoorSwitchComponent')
export class DoorSwitchComponent{
  entity: IEntity
  doorEnititiesNames: string[]
  doorEnitities: DoorComponent[]
  bDebug: boolean
  doorBehaviour: DoorTriggerBehaviour
  pointerEvent: OnPointerDown
  panelEntity: IEntity
  openEntity: IEntity
  closeEntity: IEntity
  bCreated: boolean
  constructor(entity: IEntity, doorBehaviour: DoorTriggerBehaviour, doorEnititiesNames: string[]){
      this.entity = entity
      this.doorEnititiesNames = doorEnititiesNames
      this.doorBehaviour = doorBehaviour
      this.bDebug = false
      this.doorEnitities = []
      this.bCreated = false
      doorSwitches.push(this)
  }
  createSwitch(){
    if (!this.bCreated) {
      this.bCreated = true
      for (const entityId in this.entity.children) {
        let child: Entity = this.entity.children[entityId] as Entity
        if (child.name=="switch_Pannel") {
          this.panelEntity = child
        }
        else if(child.name=="Glow_switch_red"){
          this.closeEntity = child
        }
        else if(child.name=="Glow_switch_green"){
          this.openEntity = child
          this.openEntity.getComponent(GLTFShape).visible = false
        }
      }


      if (this.doorEnitities.length==0) {
        for (const entityId in engine.getEntitiesWithComponent(DoorComponent)) {
          let entity: Entity = engine.getEntitiesWithComponent(DoorComponent)[entityId] as Entity
          if (this.doorEnititiesNames.indexOf(entity.name) != -1) {
              this.doorEnitities.push(entity.getComponent(DoorComponent))
          }
        }
      }
      var self = this
      self.pointerEvent = new OnPointerDown(
        e => {
          self.pointerEvent.distance = 0
          delay(() => {
            self.pointerEvent.distance = 5
          }, 500);
          //console_log(self.doorBehaviour);
          //console_log(self.doorEnitities);

          for (let i = 0; i < self.doorEnitities.length; i++) {
            switch (self.doorBehaviour) {
              case DoorTriggerBehaviour.Close:
                self.doorEnitities[i].closeDoor()
                break;
              case DoorTriggerBehaviour.Open:
                self.doorEnitities[i].openDoor()
                break;
              case DoorTriggerBehaviour.CloseAndOpen:
                self.doorEnitities[i].callback = function() {
                  self.doorEnitities[i].callback = function(){}
                  self.doorEnitities[i].openDoor()
                }
                self.doorEnitities[i].closeDoor()
                break;
              case DoorTriggerBehaviour.Toggle:
                self.doorEnitities[i].toggleDoor()
                break;
              default:
                break;
            }
          }
          switch (self.doorBehaviour) {
            case DoorTriggerBehaviour.Close:
              self.openEntity.getComponent(GLTFShape).visible = false
              self.closeEntity.getComponent(GLTFShape).visible = true
              break;
            case DoorTriggerBehaviour.Open:

              self.openEntity.getComponent(GLTFShape).visible = true
              self.closeEntity.getComponent(GLTFShape).visible = false
              break;
            case DoorTriggerBehaviour.CloseAndOpen:
              delay(() => {
                self.openEntity.getComponent(GLTFShape).visible = true
                self.closeEntity.getComponent(GLTFShape).visible = false
              }, 2000);
              self.openEntity.getComponent(GLTFShape).visible = false
              self.closeEntity.getComponent(GLTFShape).visible = true
              break;
            case DoorTriggerBehaviour.Toggle:
              self.openEntity.getComponent(GLTFShape).visible = !self.openEntity.getComponent(GLTFShape).visible
              self.closeEntity.getComponent(GLTFShape).visible = !self.closeEntity.getComponent(GLTFShape).visible
              break;
            default:
              break;
          }
        },
        {
          button: ActionButton.POINTER,
          hoverText: "Press switch",
          distance: 5
      })
      self.panelEntity.addComponent(self.pointerEvent)
    }


  }

}
