import ExpressionStorage from "../../../../lib/expression-storage/_expression-storage";
const {getVariablesFromExpression} = ExpressionStorage;
export const createSmartPart = (partInstance, ballBody, eStorage) => {
    if(!partInstance) debugger;
    const partDef = partInstance.definition;
    const disposeCallbacks = [];
    let smartPart; 
    const listeningVariables = [];//TODO string could be low performance, maybe we will need an object model for variables
    const control = eStorage.addControl({id:partDef.id, runtime:partDef.expressions?.runtime});
    if(~partDef.subtype.indexOf("control_switch")){
        smartPart = createSmartSwitch(control, partInstance, ballBody, eStorage);
    }else if(~partDef.subtype.indexOf("control_area")){
        smartPart = createTriggerArea(control, partInstance, ballBody, eStorage);
    }

    if(partDef.expressions?.runtime?.ignored || partDef.expressions?.runtime?.ignoredPhysics){
        decorateVariableCollectionFromExpression(partDef.expressions.runtime.ignored || partDef.expressions.runtime.ignoredPhysics);
        const disposeCallback = eStorage.onEvent(({type, data})=>{
            const {targetControlIds} = data;
            apply(targetControlIds);
        });
        apply([control.id]);
        disposeCallbacks.push(disposeCallback)
    }

    return {
        update:(dt)=>smartPart && smartPart.update(dt),
        dispose:()=>{
            disposeCallbacks.forEach(dc => dc());
            smartPart && smartPart.dispose();
        }
    };
    function apply(targetControlIds){
        const [body] = partInstance.bodies;
        const runtimeProp = partDef.expressions.runtime.ignored !== undefined
            ? "ignored"
            : "ignoredPhysics"
        if(targetControlIds.indexOf(control.id) !== -1 && partInstance.bodies?.length){

            if(control.evaluate(runtimeProp)){
                body.collisionFilterGroup = 2;
            }else{
                body.collisionFilterGroup = 1;
            }
        }
    }
    function decorateVariableCollectionFromExpression(expression){
        if(!expression) return;
        const variableNames = getVariablesFromExpression(expression)||[];
        variableNames.forEach(variableName => {
            if(listeningVariables.indexOf(variableName) === -1){
                listeningVariables.push(variableName);
            }
        });
    }
};

const createSmartSwitch = (control, partInstance, ballBody, eStorage) => {
    const [body] = partInstance.bodies;
    //TODO 
    const lockTime = 1000;
    const state = {
        lastLockTime:0
    };
    body.addEventListener("collide", (e)=>{
        if(Date.now() - lockTime > state.lastLockTime){
            state.lastLockTime = Date.now();
            control.setValue(!control.evaluate());
        }
    })
    const initialValue = control.evaluate();
    control.setValue(initialValue);

    return {
        setValue:()=>{},
        update:()=>{

        },
        dispose:()=>{            
            body.removeEventListener("collide");
            body.world.remove(body)
        }
    };
};


const createTriggerArea = (control, partInstance, ballBody, eStorage) => {
    const [body] = partInstance.bodies;
    const initialValue = control.evaluate();
    control.setValue(initialValue);
    const boxSize = [4,0.5,4];
    const storage = partInstance.definition.expressions?.runtime?.storage;


    return {
        setValue: () => { },
        update: (dt) => {
            if(!storage) return;
            const storageValue = eStorage.getState()[storage];
            const isInBox = isPointInBox(ballBody.position, partInstance.definition.position, boxSize);
            if(!storageValue && isInBox){
                control.setValue(true);
            }else if(storageValue && !isInBox){
                control.setValue(false);
            }
        },
        dispose: () => {
            body.world.remove(body)
        }
    };

    function isPointInBox(point:{x:number, y:number, z:number}, boxPosition:number[], boxSize:number[]){
        const [_bx,_by,_bz] = boxPosition;
        const [bw,bh,bd] = boxSize;
        const bx = _bx - bw/2;
        const by = _by - bh/2;
        const bz = _bz - bd/2;
        const bx2 = bx+bw;
        const by2 = by+bh;
        const bz2 = bz+bd;
        const {x,y,z} = point;
        return x >= bx && x <= bx2 && y >= by && y <= by2 && z >= bz && z <= bz2;
    }
}