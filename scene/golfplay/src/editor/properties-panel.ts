import {getEditorStore} from "./editor-store";
import {getPartIdFromShapeInstanceId, getPartModelFromInstanceId} from "./editor-util";
import {createField} from "./save-panel";
import {getCanvas} from "../../services/canvas";

export const createPropertiesPanel = ()=>{
    const container = new UIContainerRect(getCanvas());
    container.hAlign = "right";
    container.vAlign = "top";
    container.width = 180;
    container.alignmentUsesSize = true;
    container.positionY = -120;
    container.positionX = -10;
    container.color = new Color4(1,1,1,0);

    const fields = new UIContainerStack(container);
    fields.stackOrientation = UIStackOrientation.VERTICAL;
    fields.color = new Color4(1,1,1,0.1);
    fields.width = 180;
    fields.adaptHeight = true;
    fields.height = 400;
    fields.vAlign = "top";
    fields.hAlign = "left";

    const state = {enabled:true};

    function applyState(){
        const editorStore = getEditorStore();
        const partModel = getPartModelFromInstanceId(editorStore.getState().selectedPartId);
        if(!partModel?.store?.getState()) return;
        if(partModel.store.getState().type === "image") {
            imageURLField.show();
            imageWidthHeight.show();
            imageWidthHeight.refresh();
            imageURLField.refresh();
            textValueField.hide();
        }else if(partModel.store.getState().type === "text"){
            imageURLField.hide();
            imageWidthHeight.hide();
            textValueField.show();
            textValueField.refresh();
        }else{
            textValueField.hide();
            imageURLField.hide();
            imageWidthHeight.hide();
        }

        if(~partModel.store.getState().subtype.indexOf("control_")){
            storageField.show();
            storageField.refresh();
        }else{
            storageField.hide();
        }

        selectedPartField.refresh();
        ignoredField.refresh();
        hiddenField.refresh();
        ignoredPhysicsField.refresh();
        //TODO show storage field for smart-switch component only
    }
    const selectedPartField = createField(fields, {
        key:() => getPartIdFromShapeInstanceId(getEditorStore().getState().selectedPartId),
        editable:false,
        type:"string",
        label:"Part type"
    })
    const imageURLField = createField(fields, {
        key:()=>{
            const partModel = getEditorStore().getState().definition.parts.find(p=>p.id === getEditorStore().getState().selectedPartId);
            return partModel?.store?.getState()?.expressions?.image?.url;
        },
        onChange:(value)=>{
            getEditorStore().getState().definition.parts.find(p=>p.id === getEditorStore().getState().selectedPartId).store.getState().expressions.image.url = value;
            getEditorStore().getState().definition = {...getEditorStore().getState().definition};
        },
        editable:true,
        type:"string",
        label:"Image URL",
        placeholder:"Enter image URL"
    });
    const textValueField = createField(fields, {
        key:()=>{
            const partModel = getEditorStore().getState().definition.parts.find(p=>p.id === getEditorStore().getState().selectedPartId);
            return partModel?.store?.getState()?.expressions?.text?.value;
        },
        onChange:(value)=>{
            getEditorStore().getState().definition.parts.find(p=>p.id === getEditorStore().getState().selectedPartId).store.getState().expressions.text.value = value;
            getEditorStore().getState().definition = {...getEditorStore().getState().definition};
        },
        editable:true,
        type:"string",
        label:"Text value",
        placeholder:"Enter text value"
    });
   const ignoredField = createField(fields, {
        key:(editorStore)=>{
            const partModel = getEditorStore().getState().definition.parts.find(p=>p.id === getEditorStore().getState().selectedPartId);
            return partModel?.store?.getState()?.expressions?.runtime?.ignored;
        },
        onChange:(value)=>{
            const partState =getEditorStore().getState().definition.parts.find(p=>p.id === getEditorStore().getState().selectedPartId).store.getState();
            partState.expressions = partState.expressions || {runtime:{}};
            partState.expressions.runtime = partState.expressions.runtime||{};
            partState.expressions.runtime.ignored = value;
            getEditorStore().getState().definition = {...getEditorStore().getState().definition};
        },
        editable:true,
        type:"string",
        label:"Ignored (expression)",
        placeholder:"Enter expression"
    });
    const hiddenField = createField(fields, {
        key:(editorStore)=>{
            const partModel = getEditorStore().getState().definition.parts.find(p=>p.id === getEditorStore().getState().selectedPartId);
            return partModel?.store?.getState()?.expressions?.runtime?.hidden;
        },
        onChange:(value)=>{
            const partState =getEditorStore().getState().definition.parts.find(p=>p.id === getEditorStore().getState().selectedPartId).store.getState();
            partState.expressions = partState.expressions || {runtime:{}};
            partState.expressions.runtime = partState.expressions.runtime||{};
            partState.expressions.runtime.hidden = value;
            getEditorStore().getState().definition = {...getEditorStore().getState().definition};
        },
        editable:true,
        type:"string",
        label:"Hidden (expression)",
        placeholder:"Enter expression"
    });
    const ignoredPhysicsField = createField(fields, {
        key:(editorStore)=>{
            const partModel = getEditorStore().getState().definition.parts.find(p=>p.id === getEditorStore().getState().selectedPartId);
            return partModel?.store?.getState()?.expressions?.runtime?.ignoredPhysics;
        },
        onChange:(value)=>{
            const partState =getEditorStore().getState().definition.parts.find(p=>p.id === getEditorStore().getState().selectedPartId).store.getState();
            partState.expressions = partState.expressions || {runtime:{}};
            partState.expressions.runtime = partState.expressions.runtime||{};
            partState.expressions.runtime.ignoredPhysics = value;
            getEditorStore().getState().definition = {...getEditorStore().getState().definition};
        },
        editable:true,
        type:"string",
        label:"Ignored physics (expression)",
        placeholder:"Enter expression"
    });
    const storageField = createField(fields, {
        key:(editorStore)=>{
            const partModel = getEditorStore().getState().definition.parts.find(p=>p.id === getEditorStore().getState().selectedPartId);
            return partModel?.store?.getState()?.expressions?.runtime?.storage;
        },
        onChange:(value)=>{
            const partState =getEditorStore().getState().definition.parts.find(p=>p.id === getEditorStore().getState().selectedPartId).store.getState();
            partState.expressions = partState.expressions || {runtime:{}};
            partState.expressions.runtime = partState.expressions.runtime||{};
            partState.expressions.runtime.storage = value;
            getEditorStore().getState().definition = {...getEditorStore().getState().definition};
        },
        editable:true,
        type:"string",
        label:"Variable name (variable to save control state)",
        placeholder:"Enter variable name"
    });
    const imageWidthHeight = createField(fields, {
        key:(editorStore)=>{
            const partModel = getEditorStore().getState().definition.parts.find(p=>p.id === getEditorStore().getState().selectedPartId);
            return `${partModel?.store?.getState()?.expressions?.image?.width},${partModel?.store?.getState()?.expressions?.image?.height}`;
        },
        onChange:(value:string)=>{
            console.log("value",typeof value, value);
            const [width,height] = (value||"").split(",");
            const image = getEditorStore().getState().definition.parts.find(p=>p.id === getEditorStore().getState().selectedPartId).store.getState().expressions.image;
            image.width = width;
            image.height = height;

            getEditorStore().getState().definition = {...getEditorStore().getState().definition};
        },
        editable:true,
        type:"string",
        label:"Image size",
        placeholder:"Enter width,height"
    });

    getEditorStore().onChange(({newValue, oldValue, prop})=>{
        if(state.enabled) applyState();
    });

    applyState();
    return {
        show:()=>{
            container.visible   =true;
        },
        hide:()=>{
            container.visible  =false;
        },
        enable:(value)=>{
            state.enabled  =value;
        }
    }
}