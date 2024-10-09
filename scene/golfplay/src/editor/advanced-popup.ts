import {getCanvas} from "../../services/canvas";
import {getTexture} from "../../services/resource-repo";
import {createExpressionPopup} from "./advanced-popup-expression-detail";
import {removeValueFromArray} from "../../../../common/utils";

export const createMapAdvancedPopup = (expressions = {}, onChange, onClose) => {
    const state = {
        editingExpression:-1,
        expressions:serializeExpressions(expressions)
    }
    const callbacks = {
        onChange,
        onClose
    }


    console.log("state",state);
    const container = new UIContainerRect(getCanvas());
    container.color = Color4.White();
    container.width = 800;
    container.height = 580;
    container.vAlign = "top";
    container.positionY = 20;

    const title = new UIText(container);
    title.adaptHeight = true;
    title.value = "Advanced expressions";
    title.color = Color4.Gray();
    title.vAlign = "top";
    title.hAlign = "left";
    title.vTextAlign = "top";
    title.fontSize = 20;
    title.paddingLeft = title.paddingTop = 10;


    const addButton = creteUIButton({
        container,
        x:290, y:-14,
        width:30, height:30,
        onClick:()=>{
            expressionPopup.show();
        },
        sprite:{
            sourceWidth:36, sourceHeight:42,
            sourceLeft:129, sourceTop:0
        }
    });
    const elements = new Array(13).fill(null).map((_,index)=>createExpressionElement({},index));
    applyState();
    const expressionPopup = createExpressionPopup(container,({storage, condition, timeout, initial, expression})=>{
        if(~state.editingExpression){
            Object.assign(state.expressions[state.editingExpression], {storage, condition, timeout, initial, expression});
        }else{
            if(state.expressions.length === 13) return;
            console.log("adding", {storage, condition, timeout, initial, expression});
            if(storage?.trim()){
                state.expressions.push({storage, condition, timeout, initial, expression});
            }
        }
        applyState();
        expressionPopup.hide();
        state.editingExpression = -1;
    });
    expressionPopup.hide();

    const closeButton = creteUIButton({
        container,x:0,y:0,hAlign:"right",sprite:{},height:32,width:32,onClick:()=>{
            callbacks.onClose();
        }
    })

    return {
        show:()=>{
            container.visible = true;
        },
        hide:()=>{
            container.visible =false;
        }
    }
    function applyState(){
        elements.forEach((element,index)=>{
            element.update(state.expressions[index] || {})
        });
        callbacks.onChange(deserializeExpressions(state.expressions))
    }

    function createExpressionElement(expressionDef, index){
        const element = new UIContainerRect(container);
        element.width = 760;
        element.height = 30;
        element.thickness = 1;

        element.color = Color4.White();
        element.positionY = -50 - index * 40;
        element.positionX = 20;
        element.vAlign = "top";
        element.hAlign = "left";
        const deleteButton = creteUIButton({
            container:element,
            sprite:{
                sourceLeft:66, sourceTop:166,
                sourceWidth:64, sourceHeight:64
            },x:720,y:0,height:30,width:30, onClick:()=>{
                removeValueFromArray(state.expressions, state.expressions[index])
                state.editingExpression = -1;
                applyState();
            }});

        const edit = creteUIButton({
            container:element,
            sprite:{
                sourceLeft:230, sourceTop:0,
                sourceWidth:32, sourceHeight:32
            },x:10,y:0,height:30,width:30, onClick:()=>{
                state.editingExpression = index;
                expressionPopup.show(state.expressions[index])
            }});
        const text = new UIText(element);
        text.value = getStr(expressionDef);
        text.color = Color4.Black();
        text.vAlign = text.vTextAlign = "top";
        text.hAlign = text.hTextAlign = "left";
        text.paddingTop = text.paddingLeft = 0;
        text.positionX = 60;
        text.fontSize = 12;

        return {
            hide:()=>{
                element.visible = false;
            },
            update:(expressionDef)=>{
                console.log("update element", expressionDef)
                text.value = getStr(expressionDef);
                element.visible = !!expressionDef.storage;
                console.log("element.visible",element.visible);
            }
        }

        function getStr(expressionDef){
            if(!expressionDef.storage) return "";
            return `<b>Variable: </b>${expressionDef.storage||" "}  <b>Expression: </b>${expressionDef.expression||" "}<br><color=#888888><b>Condition: </b>${expressionDef.condition||" "} <b>Timeout: </b>${expressionDef.timeout||"0"} <b>Initial: </b>${expressionDef?.initial?.trim() === "true"?"true":"false"}</color>`;
        }
    }
    function serializeExpressions(expressionsDefinition):any[]{
        const result = [];
        if(expressionsDefinition.assignments){
            Object.keys(expressionsDefinition.assignments).forEach((storage)=>{
                result.push({
                    storage,
                    expression:expressionsDefinition.assignments[storage]?.expression,
                    condition:expressionsDefinition.assignments[storage]?.condition,
                    timeout:expressionsDefinition.assignments[storage]?.timeout?.toString(),
                })
            });
        }
        if(expressionsDefinition.initialAssignments){
            Object.keys(expressionsDefinition.initialAssignments).forEach((storage)=>{
                result.push({
                    storage,
                    expression:expressionsDefinition.initialAssignments[storage].toString(),
                    initial:"true"
                })
            });
        }
        console.log("serialized", result)
        return result;
    }

    function deserializeExpressions(expressionDefs:any[]){
        const result = {assignments:{}, initialAssignments:{}};
        expressionDefs.forEach(expressionDef => {
            console.log("expressionDef.initial",typeof expressionDef.initial,expressionDef.initial)
            if(!expressionDef.storage) return;
            if(expressionDef.initial === "true") {
                result.initialAssignments[expressionDef.storage] = expressionDef.expression;
            }else{
                result.assignments[expressionDef.storage] = {
                    expression:expressionDef.expression,
                    condition:expressionDef.condition,
                    timeout:expressionDef.timeout?Number(expressionDef.timeout):undefined,
                };
            }
        });
        return result;

        /*function deserializeValue(value){
            const asNumber = Number(value);
            if(!isNaN(asNumber)) return asNumber;
            if(value === "true") return true;
            if(value === "false") return false;
            return value;
        }*/
    }
}



function creteUIButton({container, y, x, onClick, sprite, height = 30, width = 60, hAlign="left", vAlign="top"}){

    const image = new UIImage(container, getTexture(`images/spritesheet.png`));

    Object.assign(image, sprite);
    image.height = height;
    image.width = width;
    image.vAlign = vAlign;
    image.hAlign = hAlign;
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

