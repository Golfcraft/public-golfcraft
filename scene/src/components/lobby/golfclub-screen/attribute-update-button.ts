import {createHandlerFrom} from "./button-handler";

export const createAttributeUpdateButton = (parent:Entity, {position, value}:any) => {
    const callbacks:any = {
        onClick:null
    };
    const state:any = {
        value,
        visible:true
    };
    const entity = new Entity();

    const idleTexture = new Texture(`images/attribute-plus-idle.png`);
    const idleMaterial = new Material();
    idleMaterial.albedoTexture = idleTexture;
    idleMaterial.alphaTexture = idleTexture;
    idleMaterial.emissiveTexture = idleTexture;
    idleMaterial.emissiveColor = Color3.Yellow();
    idleMaterial.emissiveIntensity = 3;

    const activeTexture = new Texture(`images/attribute-plus-active.png`);
    const activeMaterial = new Material();
    activeMaterial.albedoTexture = activeTexture;
    activeMaterial.alphaTexture = activeTexture;
    activeMaterial.emissiveTexture = activeTexture;
    activeMaterial.emissiveColor = Color3.Yellow();
    activeMaterial.emissiveIntensity = 3;
    const shape = new PlaneShape();
    entity.addComponent(shape);
    entity.addComponent(new Transform({
        position,
        scale: new Vector3(-0.2,-0.2,-0.2)
    }));
    entity.setParent(parent);
    const handler = createHandlerFrom(entity,state,()=>{
        callbacks.onClick && callbacks.onClick();
    },{
        hoverText:'Upgrade',
        button:ActionButton.POINTER
    } )
    updateViewFromState();

    function updateViewFromState(){
        if(state.value){
            handler.enable(false);
            entity.addComponentOrReplace(activeMaterial);
        }else{
            handler.enable(state.visible);
            entity.addComponentOrReplace(idleMaterial);
        }
        shape.visible = state.visible;

    }


    return {
        onClick:(fn:any) => {
            callbacks.onClick = fn;
        },
        setState:(newState:{visible?:boolean,value?:boolean})=>{
            (<any>Object).assign(state, newState);
            updateViewFromState();
        }
    }
}