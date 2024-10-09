import {createInventory} from "../components/menu/Inventory/Inventory";
import {getSpriteDefinition} from "../components/menu/SpriteRepo";
import {registerAllSprites, SPRITE} from "../components/menu/sprites";
import {getPartsData} from "./parts-repository";
import {getEditorStore} from "./editor-store";
import {getPartIdFromShapeInstanceId} from "./editor-util";
import {getTexture} from "../../services/resource-repo";
registerAllSprites();
const canvas = new UICanvas();
const BACKGROUND_COLOR = new Color4(0,0,0,0.5);
const MESSAGE_MOVE = "EDIT | Move: WASDEF (keep space for no-snap) | Change edit mode:2";
const MESSAGE_ROTATE = "EDIT | Rotate: WASDEF (keep space for no-snap) | Change edit mode:2";

export const createEditorUI = (collectionId, wipParts?) => {
    const baseUrl = (<any>engine)["__COURSE_MODELS_BASE__"]||"";
    const callbacks = {
        onChangeShape:null,
        onDuplicate:null,
        onDelete:null
    };

    const container = canvas;
    const modesContainer = new UIContainerRect(container);
    modesContainer.vAlign = "bottom";
    modesContainer.hAlign = "center";
    modesContainer.color = BACKGROUND_COLOR;
    modesContainer.alignmentUsesSize = true;
    modesContainer.height = 20;
    modesContainer.width = 200;
    const modesText = new UIText(modesContainer);
    modesText.adaptWidth = true;
    modesText.adaptHeight = true;
    modesText.fontSize = 12;
    modesText.value = `*1:Camera 2:Edit 3:Shape 4:Duplicate`;

    const editText = new UIText(modesContainer);
    editText.positionY = 40;
    editText.fontSize = 14;
    editText.value='CAMERA | Move:WASDEF | Click:Select';
    editText.hAlign = "center";
    editText.vAlign = "bottom";
    editText.adaptWidth = true;
    editText.adaptHeight = true;

    const shapeMenu = new UIContainerRect(container);
    shapeMenu.color = BACKGROUND_COLOR;
    shapeMenu.width = 640;
    shapeMenu.height = 580;
    shapeMenu.positionY = 50;
    shapeMenu.visible = false;
    const editorState = getEditorStore().getState();
    const shapeSelectedId = new UIText(shapeMenu);
    shapeSelectedId.value = `SELECTED PART INSTANCE: ${editorState.selectedPartId} TYPE: ${getPartIdFromShapeInstanceId(editorState.selectedPartId)}`;
    shapeSelectedId.vAlign = "top";
    shapeSelectedId.hAlign = "left";
    shapeSelectedId.hTextAlign = "left";
    shapeSelectedId.vTextAlign = "top";

    const deleteButton = new UIImage(shapeMenu, getTexture(baseUrl + `images/spritesheet.png`));
    deleteButton.sourceWidth = 128;
    deleteButton.sourceTop = 96;
    deleteButton.sourceHeight = 64;
    deleteButton.vAlign = "bottom";
    deleteButton.hAlign = "right";
    deleteButton.height = 30;
    deleteButton.width = 100;
    deleteButton.positionX = -150;
    deleteButton.positionY = -5;
    deleteButton.onClick = new OnClick(() => {
        // DO SOMETHING
        callbacks.onDelete && callbacks.onDelete();
    });

    getEditorStore().onChange(({newValue, oldValue, prop})=>{
        if(prop === "editorMode"){
            switch (newValue){
                case 0:{
                    editText.value = 'CAMERA | Move:WASDEF | Click:Select'
                    shapeMenu.visible = false;
                    modesText.value = `*1:Camera 2:Edit 3:Shape 4:Duplicate`;break;

                }
                case 1:{
                    editText.value=MESSAGE_MOVE;
                    shapeMenu.visible = false;
                    modesText.value = `1:Camera *2:Edit 3:Shape 4:Duplicate`;break;
                }
                case 2:{
                    editText.value="SHAPE MENU";
                    shapeMenu.visible = true;
                    modesText.value = `1:Camera 2:Edit *3:Shape 4:Duplicate`;break;
                }
            }
            if(newValue === 0){

            }
        }else if(prop === "editorEditMode"){
            switch (newValue){
                case 1:{
                    editText.value=MESSAGE_ROTATE;break;
                }
                case 2:{
                    editText.value=MESSAGE_MOVE;break;
                }
            }
        }else if(prop === "selectedPartId"){
            shapeSelectedId.value = `SELECTED PART INSTANCE: ${editorState.selectedPartId} TYPE: ${getPartIdFromShapeInstanceId(editorState.selectedPartId)}`;
            //TODO get part id of shapeSelectedId


        }else if(prop === "definition"){
            if(newValue.parts.length>1){
                deleteButton.visible = true;
            }else{
                deleteButton.visible = false;
            }
            shapeSelectedId.value = `SELECTED PART INSTANCE: ${editorState.selectedPartId} TYPE: ${getPartIdFromShapeInstanceId(editorState.selectedPartId)}`;
        }
    });

    const partsData = getPartsData().filter(p => wipParts
        ? (p.status === 0 || p.status ===2 || p.status === null)
        : (p.status === 2)
    );
    const commonParts = ["control_area", "direction_area", "explosive_mine"];
    const collectionTabLabels = ["Egypt", "Space", "Urban", "Jungle", "Mountain", "Cocobay"];
    const commonPartAliases = ["image", "text", "rubber"];

    const tabDefinitions = [{
        id: SPRITE.DESERT,
        label: collectionTabLabels[collectionId] || `Collection-${collectionId}`,
        elements: [
            ...partsData
                .filter(part => ~part.alias.indexOf(collectionTabLabels[collectionId].toLowerCase() + "_") || commonPartAliases.some(alias => ~part.alias.indexOf(alias)) || ~commonParts.indexOf(part.alias))
                .map(part => ({
                    thumbnail: part.thumbnail64,
                    id: part.alias,
                    data: {
                        ID: part.ID,
                        alias: part.alias
                    }
                }))
        ],
        selected: true
    }]

    console.log("tabDefinitions for collectionId", collectionId, tabDefinitions);
    const inventory = createInventory(shapeMenu, {
        tabDefinitions,
        width:500,
        height:500,
        slotSize:64
    });
    inventory.onChangeActiveTab(()=>{
        inventory.select( getPartIdFromShapeInstanceId(getEditorStore().getState().selectedPartId));
    });
    inventory.onClickItem((item)=>{
        callbacks.onChangeShape && callbacks.onChangeShape(item);
    });
    return {
        onDelete:(fn)=>{
            callbacks.onDelete = fn;
        },
        onDuplicate:(fn)=>{
            callbacks.onDuplicate = fn;
        },
        onChangeShape:(fn)=>{
            callbacks.onChangeShape = fn;
        },
        select:(partId)=>{
            inventory.select(partId)
        },
        hide:()=>{
            shapeMenu.visible = false;
            modesContainer.visible = false;
            editText.visible = false;
        }
    }
}