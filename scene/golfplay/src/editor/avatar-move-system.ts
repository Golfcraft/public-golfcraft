import { getParcel } from '@decentraland/ParcelIdentity'
import {getEditorStore} from "./editor-store";

export class AvatarMovement implements ISystem {
    private transform:Transform = new Transform({
        scale:new Vector3(1,2,1)
    });
    public locked:boolean = false;
    private entity = new Entity();
    private floor = new Entity();
    private floorPosition = new Vector3(8,0.15,8);//TODO get scene size (square for now)
    private lockEntityY = getEditorStore().getState().lockEntityY;
    private subPosition = new Vector3(0, getEditorStore().getState().lockEntityY2,0);
    constructor() {
        executeTask(async ()=>{
            const [sceneWidth, sceneDepth, offsetX, offsetZ] = await getSceneSize();//TODO just square for now
            const shape = new BoxShape();

            shape.visible = false;
            this.entity.addComponent(shape);
            const {x,y,z} = Camera.instance.feetPosition;
            const subEntity = new Entity();
            subEntity.setParent(this.entity);
            subEntity.addComponent(shape);
            this.subPosition.set(0,getEditorStore().getState().lockEntityY2,0)
            subEntity.addComponent(new Transform({
                position:this.subPosition
            }));

            this.entity.addComponent(this.transform);
            this.floorPosition.set(sceneWidth/2*16-offsetX*16, 0.2, sceneDepth/2*16-offsetZ*16);

            const floorShape = new PlaneShape();
            const floorMaterial = new Material();
            floorMaterial.albedoColor = new Color4(0,0,1,0.5)
            //floorShape.visible = false;
            floorShape.isPointerBlocker = false;
            floorShape.withCollisions = true;
            this.floor.addComponent(floorShape);
            this.floor.addComponent(floorMaterial);
            this.floor.addComponent(new Transform({
                position:this.floorPosition,
                scale:new Vector3(sceneWidth*16,sceneDepth*16,1),
                rotation:Quaternion.Euler(90,0,0)
            }))
            engine.addEntity(this.floor);

            getEditorStore().onChange(({newValue, oldValue, prop})=>{
                if(prop === "lockEntityY"){
                    this.lockEntityY = newValue;
                }else if(prop === "lockEntityY2"){
                    this.subPosition.set(0, newValue,0);
                }
            })
        })

    }

    dispose(){
        engine.removeEntity(this.floor);
        engine.removeEntity(this.entity);
        engine.removeSystem(this);
    }

    moveUp(){

    }

    moveDown(){

    }

    lock(){
        engine.addEntity(this.entity);
        const {x,y,z} = Camera.instance.feetPosition;
        this.transform.position.set(x,y+this.lockEntityY,z);
        this.locked = true;
    }

    unlock(){
        engine.removeEntity(this.entity);
        this.locked = false;
        //TODO on disable mode, E/F moves up/down

    }

    update(){
        this.floorPosition.y = Math.max( Camera.instance.feetPosition.y - 0.155, 0.155);
        if(!this.locked){
            if(Input.instance.isButtonPressed(ActionButton.PRIMARY).BUTTON_DOWN && !Input.instance.isButtonPressed(ActionButton.SECONDARY).BUTTON_DOWN ){
                this.floorPosition.y =  Math.max(Camera.instance.feetPosition.y + 0.10, 0.15);
            }else if(!Input.instance.isButtonPressed(ActionButton.PRIMARY).BUTTON_DOWN && Input.instance.isButtonPressed(ActionButton.SECONDARY).BUTTON_DOWN){
                this.floorPosition.y = Math.max(Camera.instance.feetPosition.y-0.5, 0.15)
            }
        }
    }
}

async function getSceneSize(){
    const parcel = await getParcel()
    const parcels = parcel.land.sceneJsonData.scene.parcels;
    const [baseX, baseZ] =  parcel.land.sceneJsonData.scene.base.split(",").map(n=>Number(n));
    const minX = parcels.reduce((acc, current)=>{
        acc = Math.min(acc, current.split(',')[0])
        return acc;
    },Number.MAX_SAFE_INTEGER);
    const minZ = parcels.reduce((acc, current)=>{
        acc = Math.min(acc, current.split(',')[1])
        return acc;
    },Number.MAX_SAFE_INTEGER);
    const maxX = parcels.reduce((acc, current)=>{
        acc = Math.max(acc, current.split(',')[0])
        return acc;
    },Number.MIN_SAFE_INTEGER);

    const maxZ = parcels.reduce((acc, current)=>{
        acc = Math.max(acc, current.split(',')[1])
        return acc;
    },Number.MIN_SAFE_INTEGER);

    return [maxX - minX + 1, maxZ - minZ + 1, baseX-minX, baseZ-minZ];
}