type Frame = {
    uvs:number[]
};

type SpriteAnimationOptions = {
    spriteMaterial:any,
    time?:number,
    frames:Frame[],
    init?:boolean,
    position?:Vector3,
    scale?:Vector3,
    loop?:boolean
};

type SpriteAnimationState = {
    playing:boolean,
    initialized:boolean,
    dtCount:number,
    currentFrame:number,
    start:number,
    end:number,
    loop:boolean,
    time:number,
    playtrack:number[]
};
const defaultOptions:SpriteAnimationOptions = {
    time:0.5,
    frames:[],
    init:true,
    position:undefined,
    scale:undefined   ,
    spriteMaterial:Material
}

type SpriteEntityCreateOptions = {
    spriteMaterial:Material
    position?:Vector3,
    scale?:Vector3
    uvs:number[]
}

export const createSpriteEntity = (parent:Entity, {spriteMaterial, position = new Vector3(0,0,0), scale = new Vector3(1,1,1), uvs}:SpriteEntityCreateOptions) => {
    const entity = new Entity();
    const plane = new PlaneShape();
    plane.withCollisions = false;
    plane.isPointerBlocker = false;
    const transform = new Transform({
        position, 
        scale
    });
    plane.uvs = uvs;

    entity.addComponent(plane);
    entity.addComponent(spriteMaterial);   
    entity.addComponent(transform);
    entity.setParent(parent);
    

    return {
        show:()=>{
            plane.visible = true;
        },
        hide:()=>{
            plane.visible = false;
        },
        getEntity:()=>entity,
        getShape:()=>plane,
        getTransform:()=>transform,
        updateUvs:(uvs) => plane.uvs = uvs
    }
}

export class SpriteAnimationSystem {
    private parent;
    private sprite;
    public state:SpriteAnimationState;
    public globalOptions:SpriteAnimationOptions;
    private plane:PlaneShape;
    
    constructor(parent:Entity, globalOptions:SpriteAnimationOptions = defaultOptions){        
        const {scale, time, position, frames, init, spriteMaterial} = globalOptions;
        this.globalOptions = {...defaultOptions, ...globalOptions};
        this.parent = parent;
        this.setInitialState();

        this.sprite = new Entity();
        this.plane = new PlaneShape();    
        this.sprite.addComponent(spriteMaterial);
        this.sprite.addComponent(this.plane);
        
        
        if(position || scale) this.sprite.addComponent(new Transform({scale, position}));

        this.plane.uvs = frames[0].uvs;
        engine.addSystem(this);            
    }

    setPosition(vector:Vector3){
        this.sprite.getComponent(Transform).position.set(vector.x,vector.y,vector.z)
    }

    public getPosition(){
        return this.sprite.getComponent(Transform).position;
    }

    setRotation(angle:number){
        this.sprite.getComponent(Transform).rotation.setEuler(0,0,angle);
    }
    addComponentOrReplace(Component:any){
        this.sprite.addComponentOrReplace(Component);
    }
    addComponent(Component:any){
        this.sprite.addComponent(Component)
    }
    removeComponent(Component:any){
        this.sprite.removeComponent(Component)
    }

    init(){
        this.state.initialized = true;
        this.sprite.setParent(this.parent);
    }    

    nextFrame(){                
        this.state.currentFrame++;
        if(this.state.currentFrame >= this.state.playtrack.length-1 && this.state.playing && !this.state.loop) this.state.playing = false;

        if(this.state.currentFrame >= this.state.playtrack.length){
            if(this.state.loop){
                this.state.currentFrame = 0;
            }else{                
                this.state.currentFrame = this.state.playtrack.length-1;
            }            
        }
        
        this.plane.uvs = this.globalOptions.frames[this.state.playtrack[this.state.currentFrame]].uvs;            
    }

    update(dt:number){
        if(!this.state.initialized) return;
        if(this.state.playing){            
            this.state.dtCount += dt;
            if(this.state.dtCount >= this.state.time){
                this.state.dtCount = 0;
                this.nextFrame();                              
            }
        }else{
            this.state.dtCount = 0;
        }
    }

    play(frames:any[],options?:SpriteAnimationOptions){
        this.state.playtrack = frames;
        this.state.dtCount = 0;
        this.state.currentFrame = -1;        
        this.state.initialized = true;
        this.state.playing = true;        
        this.state.end = frames.length-1;
        this.state.time = Number(options?.time || this.globalOptions.time);
        this.state.loop = !!(options?.loop || false);
        this.nextFrame();        
    }

    stop(frame:number = 0){
        this.plane.uvs = this.globalOptions.frames[0].uvs;
        this.state.playing = false;
    }

    destroy(){
        engine.removeSystem(this);
    }

    setInitialState(){
        this.state = {
            initialized:false,
            playing:false,
            currentFrame:0,
            dtCount:0,
            start:0,
            end:0,
            loop:false,
            time:this.globalOptions.time||0.5,
            playtrack:[0]
        }
    }

    resetState(){
        this.state = {
            ...this.state,
            playing:false
        };
    }
}

export const getSpriteUv = (index:number, offsetIndex = 0, width = 64, height = width, totalWidth=1024, totalHeight=1024):number[] => {
    let spriteCols = 1024/width;
    let spriteRows = 1024/height;
    let currentSpriteCell = index + offsetIndex;


    let colFactor = 1/spriteCols;
    let rowFactor = 1/spriteRows;
    let currRowStart = spriteRows - Math.floor((currentSpriteCell-1)/spriteCols);
    let currColStart = Math.floor((currentSpriteCell-1) % spriteCols);

    const A = (currColStart) * (colFactor);
    const B = (currColStart+1) * (colFactor);
    const C = (currRowStart-1) * (rowFactor);
    const D = (currRowStart) * (rowFactor);

    return [
      0,0,0,0,0,0,0,0,

      B,
      C,
      A,
      C,

      A,
      D,
      B,
      D,
    ];
};