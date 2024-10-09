import {DoorComponent, DoorTriggerBehaviour} from './doors'
import { delay, clearDelay } from './delay'

export type TimmerData = {
  seconds: number
  bLoop?: boolean,
  maxLoops?: number,
  bAutoActivate?: boolean
}

export var doorTimmersArray: DoorTimmerComponent[] = []
export class Timmer{
  timmerData: TimmerData
  callback: Function = ()=>{}
  timeout: any
  constructor(callback: Function, timmerData: TimmerData){
      this.timmerData = timmerData
      if (!this.timmerData.maxLoops) {
        this.timmerData.maxLoops = 0
      }
      this.callback = callback
      if (this.timmerData.bAutoActivate) {
        this.start()
      }
  }
  start(nLoopsDone: number = 0){

      var self = this
      if (self.timeout) {
        self.stop(false)
      }
      self.timeout = delay(() => {
        if (self.timmerData.bLoop) {
          if (self.timmerData.maxLoops<=0 || nLoopsDone<self.timmerData.maxLoops) {
            self.start(nLoopsDone+1)
          }
        }
        self.callback()
      }, self.timmerData.seconds*1000);

  }
  stop(fireCallback: boolean = false){
    if (this.timeout) {
      clearDelay(this.timeout)
      this.timeout = null
    }
    if (fireCallback) {
      this.callback()
    }
  }
  /*pause(){

  }
  getTimeRemaining(){

  }
  getTime(){

  }*/
}
@Component('DoorTimmerComponent')
export class DoorTimmerComponent{
  entity: IEntity
  timmer: Timmer
  doorEnititiesNames: string[]
  doorEnitities: DoorComponent[]
  doorBehaviour: DoorTriggerBehaviour
  constructor(entity: IEntity, time: double, bLoop: boolean, maxLoops: number, bAutoActivate: boolean, doorBehaviour: DoorTriggerBehaviour, doorEnititiesNames: string[]){
    this.entity = entity
    this.doorEnititiesNames = doorEnititiesNames
    this.doorBehaviour = doorBehaviour
    this.doorEnitities = []
    var self = this
    let callback = function() {
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
    }
    this.timmer = new Timmer(
      callback,
      {
        seconds: time,
        bLoop: bLoop,
        maxLoops: maxLoops,
        bAutoActivate: bAutoActivate
      }
    )
    doorTimmersArray.push(this)
  }
  createTimmer(){
    if (this.doorEnitities.length==0) {
      for (const entityId in engine.getEntitiesWithComponent(DoorComponent)) {
        let entity: Entity = engine.getEntitiesWithComponent(DoorComponent)[entityId] as Entity
        if (this.doorEnititiesNames.indexOf(entity.name) != -1) {
            this.doorEnitities.push(entity.getComponent(DoorComponent))
        }
      }
    }
  }
}
