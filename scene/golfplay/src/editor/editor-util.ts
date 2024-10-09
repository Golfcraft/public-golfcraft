import {getEditorStore} from "./editor-store";

export function getPartIdFromShapeInstanceId(instanceId){
    const selectedPart = getEditorStore().getState().definition.parts.find(p => p.id === instanceId);
    return selectedPart.partId || selectedPart.store.getState().subtype || selectedPart.store.getState().type;
}

export function getPartModelFromInstanceId(instanceId){
    return getEditorStore().getState().definition.parts.find(p => p.id === instanceId);
}