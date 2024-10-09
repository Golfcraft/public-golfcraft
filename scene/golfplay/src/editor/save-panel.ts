import * as ui from "@dcl/ui-scene-utils";
import {getEditorStore} from "./editor-store";
import {getTexture} from "../../services/resource-repo";
import {createMapAdvancedPopup} from "./advanced-popup";
import {getCanvas} from "../../services/canvas";

export const createField = (parent, {key, onChange, type, label, placeholder, editable = true, extraButtons}:any) => {
    const callbacks = {
        onChange:onChange||null
    }
    const baseUrl = (<any>engine)["__COURSE_MODELS_BASE__"]||"";
    const editorStore = getEditorStore();
    const editorState = editorStore.getState();
    const container = new UIImage(parent, getTexture(baseUrl+"images/spritesheet.png"));
    container.sourceHeight = container.sourceWidth = 31;

    //container.color = new Color4(0,0,0,0.2);
    container.height = 20;
    container.width = 180;

    const labelUI = new UIText(container);
    labelUI.value = label;
    labelUI.vAlign = "top";
    labelUI.height = 12;
    labelUI.hAlign = "left";
    labelUI.paddingLeft = 10;
    const valueUI = new UIText(container);
    valueUI.positionY = -23;
    valueUI.value = "<empty>";
    valueUI.height = 12;
    valueUI.vAlign = "top";
    valueUI.hAlign = "left";
    valueUI.paddingLeft = 10;

    if(editable){
        const button = new UIImage(container, getTexture(baseUrl+"images/spritesheet.png"));
        button.sourceHeight = button.sourceWidth = 31;
        button.sourceLeft = 32;
        button.hAlign = "right";
        button.width = 20;
        button.height = 20;
        button.positionX = 0;
        button.vAlign = "top";

        let prompt = new ui.FillInPrompt(
            label,
            (value: string) => {
                console.log("value", value, placeholder, value.trim() === placeholder.trim())
                if(value.trim() === placeholder.trim()){
                    editorState[key] = null;
                    callbacks.onChange && callbacks.onChange(null);
                    return;
                } else if(typeof key === "string"){
                    editorState[key] = type==="number"?Number(value):value;
                }

                callbacks.onChange && callbacks.onChange(type==="number"?Number(value):value);
            },
            'Submit!',
            placeholder
        );
        prompt.hide();

        button.onClick = new OnClick(()=>{
            prompt.show();
        });

        if(extraButtons?.length){
            extraButtons.forEach(({action, label}, index)=>{
                const button = new UIImage(container, getTexture(baseUrl+"images/spritesheet.png"));
                button.sourceHeight = button.sourceWidth = 31;
                button.sourceLeft = 260 + (index*32);
                button.hAlign = "right";
                button.width = 20;
                button.height = 20;
                button.positionX = -(22*(index+1));
                button.vAlign = "top";

                button.onClick = new OnClick(()=>{
                    editorState[key] = action(editorState[key]);
                })
            })
        }
    }
    applyState();
    if(typeof key === "string"){
        editorStore.onChange(()=>{
            applyState();
        },key);
    }

    return {
        refresh:()=>applyState(),
        hide:()=>{
            container.visible = false;
        },
        show:()=>{
            container.visible = true;
        }
    }

    function applyState(){
        if(typeof key === "string"){
            valueUI.value = editorState[key] || "<empty>";
        }else{
            valueUI.value = key(getEditorStore());
        }

    }
};
const INVALID_ALIAS_REGEXP = /,/g;

export const createSavePanel = () => {
    const baseUrl = (<any>engine)["__COURSE_MODELS_BASE__"]||"";
    const callbacks = {
        onClick:null,
        onExit:null
    };
    const state ={
        advancedOpen:false
    }
    const editorStore = getEditorStore();
    const editorState = editorStore.getState();

    const container = new UIContainerRect(getCanvas());
    container.hAlign = "left";
    container.vAlign = "top";
    container.width = 180;
    container.alignmentUsesSize = true;
    container.positionY = -120;
    container.positionX = 10;
    container.color = new Color4(1,1,0,0)

    const fields = new UIContainerStack(container);
    fields.stackOrientation = UIStackOrientation.VERTICAL;
    fields.color = new Color4(1,1,1,0.1);
    fields.width = 180;
    fields.adaptHeight = true;
    fields.height = 600;
    fields.vAlign = "top";
    fields.hAlign = "left";

    const nameField = createField(fields, {
        key:"courseName",
        type:"string",
        label:"Golf course name *",
        placeholder:'Enter map name here'
    });
    const snapMoveField = createField(fields, {
        key:"snapMove",
        type:"number",
        label:"Move snap",
        placeholder:'Enter snap number here',
        extraButtons:[
            {
                label:"/2",
                action: value => value / 2,
            },
            {
                label:"x2",
                action: value => value * 2
            }
        ]
    });
    const snapRotationField = createField(fields, {
        key:"snapRotate",
        type:"number",
        label:"Rotation snap",
        placeholder:'Enter snap number here'
    });

/*    const durationField = createField(fields, {
        key:"metadataDuration",
        type:"number",
        label:"Max time to complete",
        placeholder:"Enter seconds here",
        editable:false
    });*/

    const partsField = createField(fields, {
        key:(store)=>store.getState().definition.parts.length,
        editable:false,
        type:"number",
        label:"Amount of parts",
        placeholder:""
    });

    const notification = new UIText(fields);
    notification.value = "";
    notification.positionX = 10;
    notification.positionY = -50;

 /*   const lockerField = createField(fields, {
        key:"lockEntityY",
        type:"number",
        label:"lockEntityY",
        placeholder:"Enter lockEntityY here"
    })
    const lockerField2 = createField(fields, {
        key:"lockEntityY2",
        type:"number",
        label:"lockEntityY2",
        placeholder:"Enter lockEntityY2 here"
    })*/
    const saveButton = creteUIButton({y:-250, x:10, onClick: ()=>{
            callbacks.onClick && callbacks.onClick();
            if(editorState.loading || !editorState.courseName) return;
    },
        sprite:{
            sourceWidth:128,
            sourceHeight:64,
            sourceLeft:128,
            sourceTop:32
        }
    });
    const exitButton = creteUIButton({y:-250, x:80, onClick: ()=>{
            callbacks.onExit && callbacks.onExit();
    },
        sprite:{
            sourceWidth:128,
            sourceHeight:64,
            sourceLeft:0,
            sourceTop:32
        }});
    const confirmDelete = new ui.FillInPrompt(
        'Are you sure? the map design will be deleted, type "yes"',
        (e: string) => {
            if(e.trim().toLowerCase() === "yes"){
                callbacks.onClick && callbacks.onClick("RESET");
            }
        },
        'Submit!',
        '',
        false
    );
    confirmDelete.hide();
    const deleteButton = creteUIButton({y:-250, x:80+64+4, onClick:()=>{
            confirmDelete.show();
        }, sprite:{
            sourceWidth:64, sourceHeight:64,
            sourceLeft:0, sourceTop:166,

        },width:30, height:30});
    const advancedPopup = createMapAdvancedPopup(editorStore.getState().definition.expressions, (expressions)=>{
        editorStore.getState().definition = {...editorStore.getState().definition, expressions};
        console.log("expressions", expressions);
    }, ()=>{
        state.advancedOpen = false;
        advancedPopup.hide();
        container.visible = true;
    });
    advancedPopup.hide();
    console.log("editorStore.getState().definition",editorStore.getState().definition.expressions);
    const advancedButton = creteUIButton({y:-210, x:10, onClick:()=>{
            if(state.advancedOpen) return;
            advancedPopup.show();
            container.visible = false;
            state.advancedOpen = true;
        }, sprite:{
            sourceWidth:217, sourceHeight:45,
            sourceLeft:132, sourceTop:114,

        },width:217/2, height:45/2});

    const partsList = new UIText(container);
    partsList.vAlign = partsList.vTextAlign = "top";
    partsList.hAlign = partsList.hTextAlign = "left";
    partsList.positionY = -300;
    partsList.positionX = 10;

    applyState();


    editorStore.onChange(({newValue, oldValue})=>{
        applyState({newValue, oldValue});
    });

    function applyState(changes?){
        if(editorState.loading){
            container.opacity = 0.3;
        }else{
            container.opacity = 1;
        }

        if(editorState.courseName && INVALID_ALIAS_REGEXP.test(editorState.courseName)) {
            notification.value = "Invalid name";
            notification.color = Color4.Red();
            saveButton.disable();
        } else if(editorState.courseName && editorState.courseName?.length > 45){
            notification.value = "Name too long";
            notification.color = Color4.Red();
            saveButton.disable();
        } else if(!editorState.courseName){
            notification.value = "missing golf course name";
            notification.color = Color4.Red();
            saveButton.disable();
        }else{
            if(changes && !changes?.oldValue?.courseName){
                notification.value = "";
            }

            saveButton.enable();
        }

        partsField.refresh();

        const usedParts = editorState.definition.parts
            .filter(p=>p.partId && !~p.partId.toLowerCase().indexOf("skybox"))
            .reduce((acc, current)=>{
                acc[current.partId] = (acc[current.partId]||0) + 1;
                return acc;
            }, {})
        const walletParts = editorState.walletParts;
        partsList.value = Object.keys(usedParts).sort((keyA:string, keyB:string)=>{
            if((walletParts[keyA]||0) < usedParts[keyA]) return -1;
            if((walletParts[keyB]||0) < usedParts[keyB]) return 1;
        }).map(key=>{
            if(walletParts[key] >= usedParts[key]){
                return `<b>${key}</b>: ${usedParts[key]} (${walletParts[key] || 0})`;
            }else{
                return `<color=#ff6600><b>${key}</b>: ${usedParts[key]} (${walletParts[key] || 0})</color>`;
            }

        }).join(`<br>`)
    }

    return {
        show:()=>{

        },
        hide:()=>{
            container.visible = false;
        },
        onClick:(fn)=>{
            callbacks.onClick = fn;
        },
        onExit:(fn)=>{
            callbacks.onExit = fn;
        },
        notify:({text, color, timeout = 5000}:any)=>{
          notification.value = text;
          notification.color = color;
          setTimeout(()=>{
              notification.value = "";
              notification.color = Color4.White();
          },timeout)
        },
        dispose:()=>{


        }
    }

    function creteUIButton({y, x, onClick, sprite, height = 30, width = 60}){

        const image = new UIImage(container, getTexture(baseUrl+`images/spritesheet.png`));
        Object.assign(image, sprite);
        image.height = height;
        image.width = width;
        image.vAlign = "top";
        image.hAlign = "left";
        image.onClick = new OnClick((e)=>{
            onClick(e);
        });
        image.positionX = x;
        image.positionY = y;

        return {
            enable:()=>{
                image.opacity = 1;
            },
            disable:()=>{
                image.opacity = 0.3;
            }
        };
    }
}

