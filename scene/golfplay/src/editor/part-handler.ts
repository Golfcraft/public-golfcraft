import {getEditorStore} from "./editor-store";
import {getTexture} from "../../services/resource-repo";

class UpdateSystem implements ISystem {
    private callback;
    constructor(callback){
        this.callback = callback;
        engine.addSystem(this);
    }
    update(dt:number){
        this.callback(dt);
    }
    dispose(){
        this.callback = null;
        engine.removeSystem(this);
    }
}

const createPartHandler = (defaultTarget:Entity)=>{
    const baseUrl = (<any>engine)["__COURSE_MODELS_BASE__"]||"";
    const editorStore = getEditorStore();
    const editorState = editorStore.getState();
    const state = {
        active:false,
        mode:2, //1 = rotation, 2 = position
        target:defaultTarget
    };
    const callbacks = {
        onChangePosition:null,
        onChangeRotation:null,
        onChangeMode:null
    }
    const entity = new Entity();
    const shape = new BoxShape();
    shape.visible = false;
    shape.withCollisions = false;
    shape.isPointerBlocker = false;
    entity.addComponent(shape);
    const material = new Material();

    const texture = getTexture(baseUrl+`images/guide1.png`,{samplingMode:0});
    material.albedoTexture = texture;
    material.emissiveTexture = texture;
    material.alphaTexture = texture;
    material.emissiveIntensity = 2;
    material.emissiveColor = Color3.White();

    entity.addComponent(material);

    entity.setParent(state.target);

    entity.addComponent(new Transform({
        scale:new Vector3(0.2,0.2,0.2)
    }));
    const switchMode =  ()=>{
        if(state.mode === 1){
            state.mode = 2;
        }else{
            state.mode = 1;
        }
        callbacks.onChangeMode && callbacks.onChangeMode(state.mode);
    }
    function getSnap(value, direction, snapValue){
        if(direction === -1){
            const rest = (value+snapValue)%snapValue;
            const originZ = value + rest;
            return originZ - snapValue;
        }else{
            const rest = value%snapValue;
            const originZ = value - rest;
            return originZ + snapValue;
        }
    }

    function getSnapRotation(_value, direction, snapValue){
        let result;
        const value = Math.round(_value);
        if(direction === -1){
            const rest = (value+snapValue)%snapValue;
            const originZ = value + rest;
            result =  originZ - snapValue;
        }else{
            const rest = value%snapValue;
            const originZ = value - rest;

            result = originZ + snapValue;
        }
        return result;
    }
    const onW = wrapKeyHandler(()=>{
        if(state.mode === 2){
            if(getCameraCardinality() === 0){
                moveSnapToNorth();
            }else if(getCameraCardinality() === 1){
                moveSnapToEast();
            }else if(getCameraCardinality() === 2){
                moveSnapToSouth()
            }else if(getCameraCardinality() === 3){
                moveSnapToWest()
            }
        }else{
            const {x,y,z} = state.target.getComponent(Transform).rotation.eulerAngles;
            const newQ = Quaternion.Euler(getSnapRotation(x, 1, editorState.snapRotate),y,z);
            callbacks.onChangeRotation && callbacks.onChangeRotation([newQ.x, newQ.y, newQ.z, newQ.w]);
        }
    });

    const onS = wrapKeyHandler(()=>{
        if(state.mode === 2) {
            if(getCameraCardinality() === 0){
                moveSnapToSouth()
            }else if(getCameraCardinality() === 1){
                moveSnapToWest()
            }else if(getCameraCardinality() === 2){
                moveSnapToNorth();
            }else if(getCameraCardinality() === 3){
                moveSnapToEast();
            }
        }else{
            const {x,y,z} = state.target.getComponent(Transform).rotation.eulerAngles;
            const newQ = Quaternion.Euler(getSnapRotation(x, -1, editorState.snapRotate),y,z);
            callbacks.onChangeRotation && callbacks.onChangeRotation([newQ.x, newQ.y, newQ.z, newQ.w]);
        }
    });
    const onD = wrapKeyHandler(()=>{
        if(state.mode === 2) {
            if(getCameraCardinality() === 0){
                moveSnapToEast();
            }else if(getCameraCardinality() === 1){
                moveSnapToSouth()
            }else if(getCameraCardinality() === 2){
                moveSnapToWest()
            }else if(getCameraCardinality() === 3){
                moveSnapToNorth();
            }
        }else{
            const {x,y,z} = state.target.getComponent(Transform).rotation.eulerAngles;
            const newQ = Quaternion.Euler(x,y,getSnapRotation(z, 1, editorState.snapRotate));
            callbacks.onChangeRotation && callbacks.onChangeRotation([newQ.x, newQ.y, newQ.z, newQ.w]);
        }
    });
    const onA = wrapKeyHandler(()=>{
        if(state.mode === 2) {
            const targetPosition = state.target.getComponent(Transform).position;
            const {x, y, z} = targetPosition;
            if(getCameraCardinality() === 0){
                moveSnapToWest();
            }else if(getCameraCardinality() === 1){
                moveSnapToNorth();
            }else if(getCameraCardinality() === 2){
                moveSnapToEast();
            }else if(getCameraCardinality() === 3){
                moveSnapToSouth();
            }

        }else{
            const {x,y,z} = state.target.getComponent(Transform).rotation.eulerAngles;
            const newQ = Quaternion.Euler(x,y,getSnapRotation(z, -1, editorState.snapRotate));
            callbacks.onChangeRotation && callbacks.onChangeRotation([newQ.x, newQ.y, newQ.z, newQ.w]);
        }
    });
    const onE = wrapKeyHandler(()=>{
        if(state.mode === 2) {
            const targetPosition = state.target.getComponent(Transform).position;
            const {x, y, z} = targetPosition;
            callbacks.onChangePosition && callbacks.onChangePosition([x,getSnap(y,1,editorState.snapMove),z]);
        }else{
            const {x,y,z} = state.target.getComponent(Transform).rotation.eulerAngles;
            const newQ = Quaternion.Euler(x,getSnapRotation(y, 1, editorState.snapRotate),z);
            callbacks.onChangeRotation && callbacks.onChangeRotation([newQ.x, newQ.y, newQ.z, newQ.w]);
        }
    });
    const onF = wrapKeyHandler(()=>{
        if(state.mode === 2) {
            const targetPosition = state.target.getComponent(Transform).position;
            const {x, y, z} = targetPosition;
            callbacks.onChangePosition && callbacks.onChangePosition([x,getSnap(y,-1,editorState.snapMove),z]);
        }else{
            const {x,y,z} = state.target.getComponent(Transform).rotation.eulerAngles;
            const newQ = Quaternion.Euler(x,getSnap(y, -1, editorState.snapRotate),z);
            callbacks.onChangeRotation && callbacks.onChangeRotation([newQ.x, newQ.y, newQ.z, newQ.w]);
        }
    });

    Input.instance.subscribe("BUTTON_DOWN", ActionButton.FORWARD, false, onW);//TODO unsubscribe on dispose
    Input.instance.subscribe("BUTTON_DOWN", ActionButton.BACKWARD, false, onS);
    Input.instance.subscribe("BUTTON_DOWN", ActionButton.LEFT, false, onA);
    Input.instance.subscribe("BUTTON_DOWN", ActionButton.RIGHT, false, onD);
    Input.instance.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, onE);
    Input.instance.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false, onF);

    function wrapKeyHandler(fn){
        return function(){
            if(!state.active) return;
            if(Input.instance.isButtonPressed(ActionButton.JUMP).BUTTON_DOWN) return;
            fn();
        }
    }
    const updateSystem = new UpdateSystem((_dt:number)=>{
        if(!state.active) return;
        if(!Input.instance.isButtonPressed(ActionButton.JUMP).BUTTON_DOWN) return;
        if(state.mode === 2){
            const amount = _dt/4;
            let changed = false;
            const targetPosition = state.target.getComponent(Transform).position;
            let newPosition;
            if(Input.instance.isButtonPressed(ActionButton.FORWARD).BUTTON_DOWN){
                if(getCameraCardinality() === 0){
                    newPosition = moveToNorth(targetPosition, amount);
                }else if(getCameraCardinality() === 1){
                    newPosition = moveToEast(targetPosition, amount);
                }else if(getCameraCardinality() === 2){
                    newPosition = moveToSouth(targetPosition, amount);
                }else if(getCameraCardinality() === 3){
                    newPosition = moveToWest(targetPosition, amount);
                }
                changed = true;
            }else if(Input.instance.isButtonPressed(ActionButton.BACKWARD).BUTTON_DOWN){
                if(getCameraCardinality() === 0){
                    newPosition = moveToSouth(targetPosition, amount);
                }else if(getCameraCardinality() === 1){
                    newPosition = moveToWest(targetPosition, amount);
                }else if(getCameraCardinality() === 2){
                    newPosition = moveToNorth(targetPosition, amount);
                }else if(getCameraCardinality() === 3){
                    newPosition = moveToEast(targetPosition, amount);
                }
                changed = true;
            }else if(Input.instance.isButtonPressed(ActionButton.RIGHT).BUTTON_DOWN){
                if(getCameraCardinality() === 0){
                    newPosition = moveToEast(targetPosition, amount);
                }else if(getCameraCardinality() === 1){
                    newPosition = moveToSouth(targetPosition, amount);
                }else if(getCameraCardinality() === 2){
                    newPosition = moveToWest(targetPosition, amount);
                }else if(getCameraCardinality() === 3){
                    newPosition = moveToNorth(targetPosition, amount);
                }
                changed = true;
            }else if(Input.instance.isButtonPressed(ActionButton.LEFT).BUTTON_DOWN){
                if(getCameraCardinality() === 0){
                    newPosition = moveToWest(targetPosition, amount);
                }else if(getCameraCardinality() === 1){
                    newPosition = moveToNorth(targetPosition, amount);
                }else if(getCameraCardinality() === 2){
                    newPosition = moveToEast(targetPosition, amount);
                }else if(getCameraCardinality() === 3){
                    newPosition = moveToSouth(targetPosition, amount);
                }
                changed = true;
            }else if(Input.instance.isButtonPressed(ActionButton.PRIMARY).BUTTON_DOWN){
                newPosition = targetPosition.clone();
                newPosition.y = targetPosition.y + amount;changed = true;
            }else if(Input.instance.isButtonPressed(ActionButton.SECONDARY).BUTTON_DOWN){
                newPosition = targetPosition.clone();
                newPosition.y = targetPosition.y - amount;changed = true;
            }

            if(changed){
                const {x,y,z} = newPosition;
                callbacks.onChangePosition && callbacks.onChangePosition([x,y,z]);
            }

        }else{
            const {x,y,z} = state.target.getComponent(Transform).rotation.eulerAngles;
            const factor = _dt*20;
            let newQ;
            if(Input.instance.isButtonPressed(ActionButton.FORWARD).BUTTON_DOWN) {
                newQ = Quaternion.Euler(x+factor,y,z);
            }else if(Input.instance.isButtonPressed(ActionButton.BACKWARD).BUTTON_DOWN) {
                newQ = Quaternion.Euler(x-factor,y,z);
            }else if(Input.instance.isButtonPressed(ActionButton.PRIMARY).BUTTON_DOWN){
                newQ = Quaternion.Euler(x,y+factor,z);
            }else if(Input.instance.isButtonPressed(ActionButton.SECONDARY).BUTTON_DOWN){
                newQ = Quaternion.Euler(x,y-factor,z);
            }else if(Input.instance.isButtonPressed(ActionButton.RIGHT).BUTTON_DOWN){
                newQ = Quaternion.Euler(x,y,z+factor);
            }else if(Input.instance.isButtonPressed(ActionButton.LEFT).BUTTON_DOWN){
                newQ = Quaternion.Euler(x,y,z-factor);
            }
            if(newQ){
                callbacks.onChangeRotation && callbacks.onChangeRotation([newQ.x, newQ.y, newQ.z, newQ.w]);
            }

        }
        function moveToNorth(targetPosition, amount){
            const newPosition = targetPosition.clone();
            newPosition.z = targetPosition.z + amount;
            return newPosition;
        }
        function moveToEast(targetPosition, amount){
            const newPosition = targetPosition.clone();
            newPosition.x = targetPosition.x + amount;
            return newPosition;
        }
        function moveToSouth(targetPosition, amount){
            const newPosition = targetPosition.clone();
            newPosition.z = targetPosition.z - amount;
            return newPosition;
        }
        function moveToWest(targetPosition, amount){
            const newPosition = targetPosition.clone();
            newPosition.x = targetPosition.x - amount;
            return newPosition;
        }
    });
    const key2Handler = ()=>{
        if(!state.active) return;
        switchMode();
    }
    Input.instance.subscribe("BUTTON_DOWN", ActionButton.ACTION_4, false, key2Handler);

    return {
        hide:()=>{
            shape.visible = shape.isPointerBlocker = false;
        },
        show:()=>{
            shape.visible = shape.isPointerBlocker = true;
        },
        enable:()=>{
            state.active = true;
        },
        disable:()=>{
            state.active = false;
        },
        setTarget:(newTarget:Entity)=>{
            state.target = newTarget;
            entity.setParent(state.target);
        },
        onChangePosition:(fn)=>{
            callbacks.onChangePosition = fn;
        },
        onChangeRotation:(fn)=>{
            callbacks.onChangeRotation = fn;
        },
        onChangeMode:(fn)=>{
            callbacks.onChangeMode = fn;
        },
        setMode:(mode)=>{
            state.mode = mode;
        },
        switchMode,
        dispose:()=>{
            Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.ACTION_4, key2Handler);
            Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.FORWARD,  onW);//TODO unsubscribe on dispose
            Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.BACKWARD,  onS);
            Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.LEFT,  onA);
            Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.RIGHT,  onD);
            Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.PRIMARY,  onE);
            Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.SECONDARY,  onF);
            updateSystem.dispose();
            entity.setParent(null);
            engine.removeEntity(entity);
        },
        getEntity:()=>entity
    }

    function moveSnapToNorth(){
        const targetPosition = state.target.getComponent(Transform).position;
        const {x,y,z} = targetPosition;
        callbacks.onChangePosition && callbacks.onChangePosition([x,y,getSnap(z,1,editorState.snapMove)]);
    }
    function moveSnapToEast(){
        const targetPosition = state.target.getComponent(Transform).position;
        const {x,y,z} = targetPosition;
        callbacks.onChangePosition && callbacks.onChangePosition([getSnap(x,1,editorState.snapMove),y,z]);
    }
    function moveSnapToSouth(){
        const targetPosition = state.target.getComponent(Transform).position;
        const {x,y,z} = targetPosition;
        callbacks.onChangePosition && callbacks.onChangePosition([x,y,getSnap(z,-1,editorState.snapMove)]);
    }
    function moveSnapToWest(){
        const targetPosition = state.target.getComponent(Transform).position;
        const {x,y,z} = targetPosition;
        callbacks.onChangePosition && callbacks.onChangePosition([getSnap(x,-1,editorState.snapMove),y,z]);
    }
}

function getCameraCardinality(){
    const q = Camera.instance.rotation;
    const {y} = q.eulerAngles;
    if(y < 45 || (y > 315 && y < 360)) {
        return 0;
    }else if(y >= 45 && y <= 135){
        return 1
    }else if(y > 135 && y < 225){
        return 2
    }else if(y >= 225 && y <= 315){
        return 3;
    }
}

export {createPartHandler};