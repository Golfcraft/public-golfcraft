import { getUserAccount } from "@decentraland/EthereumController";
import { TokenInfo } from "../eth/eth";
import { hasTokenInList } from "../eth/tokenCheck";
import { NFTdata } from "./NFT";
import { hasPoap } from "./poap";
import { Trigger } from "./triggers";


export enum ActivableAction {
    ignore = 0,
    deactivate = 1,
    activate = 2
}
  
export type ActivableShapeConfig = {
    activateOnSpawn?: boolean
    success?: {
        collision?: ActivableAction
        visible?: ActivableAction
    }
    fail?: {
        collision?: ActivableAction
        visible?: ActivableAction
    }
}
  
export function actionToBoolean(action: ActivableAction): boolean {
    switch (action) {
      case ActivableAction.ignore:
        return;
      case ActivableAction.deactivate:
        return false;
      case ActivableAction.activate:
        return true; 
      default:
        break;
    }
}

interface IActivable{
    bActive: Boolean
    activate(bActivate: boolean): void
}

export class Activable implements IActivable{
    bActive: boolean
    constructor(){
    }
    activate(bActivate: boolean){
        this.bActive = bActivate
    }
 
}

export class ActivableCondition{
    activable: IActivable
    condition: () => boolean | Promise<boolean>
    constructor(activable: IActivable){
        this.activable = activable
    }
    checkActivable(){
        if (this.condition) {
            let result = this.condition()
            if(!isPromise(result)){
                this.activable.activate(result as boolean)
            }
            else{
                executeTask(async () => {
                    this.activable.activate((await result))
                })
            }
        }
    }
}

@Component('ActivableShape')
export class ActivableShape extends Activable{
    entity: IEntity
    config: ActivableShapeConfig
    constructor(entity: IEntity, config: ActivableShapeConfig){
        super()
        this.config = config
        this.entity = entity
    }
    activate(bActivate: boolean){

        if (bActivate && this.config.success) {
            if (this.config.success.collision) {
                this.activeCollision(actionToBoolean(this.config.success.collision))
            }
            if (this.config.success.visible) {
                this.activeVisibility(actionToBoolean(this.config.success.visible))
            }
        }
        else if (!bActivate && this.config.fail) {
            if (this.config.fail.collision) {
                this.activeCollision(actionToBoolean(this.config.fail.collision))
            }
            if (this.config.fail.visible) {
                this.activeVisibility(actionToBoolean(this.config.fail.visible))
            }
        }
        this.bActive = bActivate
    }
    activeCollision(bActivate: boolean){
      let shapeComponent = getMeshShapeComponent(this.entity)
      if (shapeComponent) {
        shapeComponent.withCollisions = bActivate
      }
    }
    activeVisibility(bActivate: boolean){
      let shapeComponent = getMeshShapeComponent(this.entity)
      if (shapeComponent) {
        shapeComponent.visible = bActivate
      }
    }
}

@Component('ActivableWithPoap')
export class ActivableWithPoap {
    poapEventId: number
    activable: Activable
    condition: ActivableCondition
    constructor(entity: IEntity, poapEventId: number, config: ActivableShapeConfig){

        const bAutoActivate = config.activateOnSpawn
        config.activateOnSpawn = false

        this.activable = new ActivableShape(entity, config)
        this.poapEventId = poapEventId
        this.condition = new ActivableCondition(this.activable)
        var self = this
        this.condition.condition = async function(): Promise<boolean> {
            try {
                const result = await hasPoap(self.poapEventId)
                console_log("hasPoap", result)
                return result
            } catch (error) {
                log("hasPoap error")
                console_log(error)
                return false
            }
        }
        if (bAutoActivate) {
        this.condition.checkActivable()
        }
    }
}

@Component('ActivableWithToken')
export class ActivableWithToken {
  tokenList: TokenInfo[]
  activable: Activable
  condition: ActivableCondition
  constructor(entity: IEntity, tokenList: TokenInfo[], config: ActivableShapeConfig){

    const bAutoActivate = config.activateOnSpawn
    config.activateOnSpawn = false

    this.activable = new ActivableShape(entity, config)
    this.tokenList = tokenList
    this.condition = new ActivableCondition(this.activable)
    var self = this
    this.condition.condition = async function(): Promise<boolean> {
        try {
            const address = await getUserAccount()
            const hasToken = await hasTokenInList(address, self.tokenList)
            console_log("hasToken", hasToken)
            return hasToken
          } catch (error) {
            log("hasToken error")
            console_log(error)
            return false
          }
    }
    if (bAutoActivate) {
      this.condition.checkActivable()
    }
  }
}

export enum TypeOfToggle 
{
    toggle,
    enableOnce,
    disableOnce
}
export enum TypeOfInteraction
{
    clickBox,
    trigger,
    clickGLTF
}
export enum TypeOfAction
{
    scaleTo0,
    visibility
}
export enum TypeOfPoke
{
    toggle,
    once
}
export enum TypeOfPokeAction
{
    position,
    rotation,
    scale
}

@Component('ToggleVisibility')
export class ToggleVisibility {
    activeEntity: Entity
    pasiveEntities: Entity[]
    voyeurEntities: Entity[]
    originalSize: Vector3[]
    interaction: TypeOfInteraction
    toggle: TypeOfToggle
    action:TypeOfAction
    trigger: Trigger
    constructor(entityActive: Entity, pasiveEntities:Entity[], voyeurEntities:Entity[] = null, hoverText: string, toggle: TypeOfToggle, action:TypeOfAction, interaction:TypeOfInteraction, trigger?: Trigger){

      this.activeEntity = entityActive;
      this.pasiveEntities = pasiveEntities;
      this.voyeurEntities = voyeurEntities;
      this.interaction = interaction;
      this.toggle = toggle;
      this.action = action;
      this.originalSize = [];
      if(this.interaction != TypeOfInteraction.trigger)
      {
        if(toggle == TypeOfToggle.enableOnce && action == TypeOfAction.scaleTo0)
        {
          this.pasiveEntities.forEach(element => {
        
              this.originalSize.unshift(new Vector3(element.getComponent(Transform).scale.x,element.getComponent(Transform).scale.y,element.getComponent(Transform).scale.z));
              element.getComponent(Transform).scale.setAll(0);
          });
        }
        this.activeEntity.addComponent(new OnPointerDown((e) =>this.ToggleFunction(),
          {
            button: ActionButton.POINTER,
            hoverText: hoverText,
            distance: 8
          }
        ));
      }
      else
      {
        if(trigger)
        {
          this.trigger = trigger;
          this.trigger.createTrigger().onCameraEnter= () => this.ToggleFunction();
          
        }
      }      
    }

    ToggleFunction()
    {
      switch(this.interaction)
      {
        case TypeOfInteraction.clickBox:
          this.InteractionFunction();
          break;
        case TypeOfInteraction.trigger:
          this.InteractionFunction();
          break;
        case TypeOfInteraction.clickGLTF:
          this.InteractionFunction();
          break;
      }
    }
    InteractionFunction()
    {
      switch(this.toggle)
      {
        case TypeOfToggle.toggle:
          this.pasiveEntities.forEach(element => {
            this.actionVisibilityFunction(element);
          });
          break;
        
        case TypeOfToggle.enableOnce:
          this.pasiveEntities.forEach(element => {
            this.actionOnceFunction(element,true);        
          });
          if(this.interaction != TypeOfInteraction.trigger)
            this.activeEntity.removeComponent(OnPointerDown);
          else
            //ELIMINAR TRIGGER
          break;

        case TypeOfToggle.disableOnce:
          this.pasiveEntities.forEach(element => {
            this.actionOnceFunction(element,false);
        });
          if(this.interaction != TypeOfInteraction.trigger)
            this.activeEntity.removeComponent(OnPointerDown);
          else
            //ELIMINAR TRIGGER
          break;
      }
    }
    actionVisibilityFunction(element:Entity)
    {
      switch(this.action)
      {
        case TypeOfAction.scaleTo0:
          if(element.getComponent(Transform).scale.x != 0 && element.getComponent(Transform).scale.y != 0 && element.getComponent(Transform).scale.z != 0)
          {
            this.originalSize.unshift(new Vector3(element.getComponent(Transform).scale.x,element.getComponent(Transform).scale.y,element.getComponent(Transform).scale.z));
            element.getComponent(Transform).scale.setAll(0);
          }
          else
          {
            let aux = this.originalSize.pop();
            element.getComponent(Transform).scale = new Vector3(aux.x, aux.y, aux.z);
          }
          break;
        case TypeOfAction.visibility:
          this.childRecursive(element);
          break;
      }
    }
    actionOnceFunction(element:Entity, action:boolean)
    {
      switch(this.action)
      {
        case TypeOfAction.scaleTo0:
          if(action)
          {
            let aux = this.originalSize.pop();
            element.getComponent(Transform).scale = new Vector3(aux.x, aux.y, aux.z);
          }
          else
          {
            element.getComponent(Transform).scale.setAll(0);
          }
          break;
        case TypeOfAction.visibility:
          this.childRecursiveOnce(element,action);
          break;
      }
    }
    childRecursive(element:Entity|IEntity)
    {
      for (let k in element.children) {
        let child = element.children[k as keyof typeof element.children];
        this.childRecursive(child);
      }
      if(element.getComponentOrNull(GLTFShape)!=null)
      {
        if(element.getComponentOrNull(NFTdata)!=null)
        {
          element.getComponent(NFTdata).entity.getComponent(NFTShape).visible = !element.getComponent(NFTdata).entity.getComponent(NFTShape).visible;
        }
        else
          element.getComponent(GLTFShape).visible = !element.getComponent(GLTFShape).visible;
      }
      else if(element.getComponentOrNull(BoxShape)!=null)
        element.getComponent(BoxShape).visible = !element.getComponent(BoxShape).visible;
      else if(element.getComponentOrNull(SphereShape)!=null)
        element.getComponent(SphereShape).visible = !element.getComponent(SphereShape).visible;
      else if(element.getComponentOrNull(TextShape)!=null)
        element.getComponent(TextShape).visible = !element.getComponent(TextShape).visible;
      else if(element.getComponentOrNull(UIImage)!=null)
        element.getComponent(UIImage).visible = !element.getComponent(TextShape).visible;
    }

    childRecursiveOnce(element:Entity|IEntity, action:boolean)
    {
      for (let k in element.children) {
        let child = element.children[k as keyof typeof element.children];
        this.childRecursiveOnce(child,action);
      }
      if(element.getComponentOrNull(GLTFShape)!=null)
      {
        if(element.getComponentOrNull(NFTdata)!=null)
        {
          element.getComponent(NFTdata).entity.getComponent(NFTShape).visible = action;
        }
        else
          element.getComponent(GLTFShape).visible = action;
      }
      else if(element.getComponentOrNull(BoxShape)!=null)
      element.getComponent(BoxShape).visible = action;
      else if(element.getComponentOrNull(SphereShape)!=null)
      element.getComponent(SphereShape).visible = action;
      else if(element.getComponentOrNull(TextShape)!=null)
      element.getComponent(TextShape).visible = action;
    }
}


@Component('Poke')
export class Poke {
    activeEntity: Entity
    pasiveEntities: Entity[]
    voyeurEntities: Entity[]
    originalTransform: Transform[]
    interaction: TypeOfInteraction
    poke: TypeOfPoke
    action:TypeOfPokeAction
    offset:Vector3
    trigger: Trigger
    input: Input
    clicked: boolean
    constructor(entityActive: Entity, pasiveEntities:Entity[], voyeurEntities:Entity[] = null, hoverText: string, offset:Vector3, poke: TypeOfPoke,  action:TypeOfPokeAction, interaction:TypeOfInteraction, trigger?: Trigger){

      this.activeEntity = entityActive;
      this.pasiveEntities = pasiveEntities;
      this.voyeurEntities = voyeurEntities;
      this.interaction = interaction;
      this.poke = poke;
      this.action = action;
      this.offset = offset;
      this.originalTransform = [];
      this.input = Input.instance;
      this.clicked = false;

      if(interaction != TypeOfInteraction.trigger)
      {
          // button down event
        this.input.subscribe("BUTTON_DOWN", ActionButton.POINTER, false, (e) => {
          if(this.clicked)
          {
            for(let i=0; i<this.pasiveEntities.length; i++)
            {
              //console.log("F: " + this.pasiveEntities[i].getComponent(Transform).position + " O: " + this.originalTransform[i]);
              this.pasiveEntities[i].getComponent(Transform).position = new Vector3(this.originalTransform[i].position.x, this.originalTransform[i].position.y, this.originalTransform[i].position.z);
              this.pasiveEntities[i].getComponent(Transform).scale = new Vector3(this.originalTransform[i].scale.x, this.originalTransform[i].scale.y, this.originalTransform[i].scale.z);
              this.pasiveEntities[i].getComponent(Transform).rotation = new Quaternion(this.originalTransform[i].rotation.x, this.originalTransform[i].rotation.y, this.originalTransform[i].rotation.z, this.originalTransform[i].rotation.w);
            }
            this.clicked = false;
          }
        });

        this.input.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, (e) => {
          if(this.clicked)
          {
            this.PokeFunction(true)
            this.clicked = false;
          }
          
        });

        this.input.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false, (e) => {
          if(this.clicked)
          {
            this.PokeFunction(false)
            this.clicked = false;
          }

        });

        this.activeEntity.addComponent(new OnPointerDown((e) =>{
          this.clicked=true;
        },
          {
            button: ActionButton.ANY,
            hoverText: hoverText,
            distance: 8
          }
        ));

        this.pasiveEntities.forEach(element => {
        
          this.originalTransform.push(new Transform(
            {position: new Vector3(element.getComponent(Transform).position.x, element.getComponent(Transform).position.y, element.getComponent(Transform).position.z),
              scale: new Vector3(element.getComponent(Transform).scale.x, element.getComponent(Transform).scale.y, element.getComponent(Transform).scale.z),
              rotation: new Quaternion(element.getComponent(Transform).rotation.x, element.getComponent(Transform).rotation.y, element.getComponent(Transform).rotation.z, element.getComponent(Transform).rotation.w)
            
            }));
        });
      }
      else
      {
        if(trigger)
        {
          this.trigger = trigger;
          this.trigger.createTrigger().onCameraEnter= () => this.PokeFunction(true);
          
        }
      }
      
        
    }

    PokeFunction(action:boolean)
    {
      switch(this.poke)
      {
        case TypeOfPoke.toggle:
          this.pasiveEntities.forEach(element => {
            this.actionPokeFunction(element, action);
          });
          break;
        
        case TypeOfPoke.once:
          this.pasiveEntities.forEach(element => {
            this.actionPokeFunction(element, action);        
          });
          if(this.interaction != TypeOfInteraction.trigger)
            this.activeEntity.removeComponent(OnPointerDown);
          else
            //ELIMINAR TRIGGER
          break;
      }
    }
    actionPokeFunction(element:Entity, action:boolean)
    {
      let aux: Vector3;
      if(action)
      {
        aux = this.offset;
      }
      else
      {
        aux = this.offset.multiplyByFloats(-1,-1,-1);
      }
      switch(this.action)
      {
        case TypeOfPokeAction.position:
            element.getComponent(Transform).position.addInPlace(aux);
          break;
        case TypeOfPokeAction.scale:
            element.getComponent(Transform).scale.addInPlace(aux);
        break;
        case TypeOfPokeAction.rotation:
            let euler = element.getComponent(Transform).rotation.eulerAngles;
            element.getComponent(Transform).rotation.setEuler(euler.x + aux.x, euler.y + aux.y, euler.z + aux.z);
        break;
      }      
      
    }
    
}