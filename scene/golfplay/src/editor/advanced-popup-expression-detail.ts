import {getTexture} from "../../services/resource-repo";

const COLOR_BLACK = Color4.Black();
const VARIABLE_PLACEHOLDER = "Write variable name here";
const EXPRESSION_PLACEHOLDER = "Write assignment expression here (expression to evaluate and to be saved in the variable)";
const CONDITION_PLACEHOLDER = "Write condition expression here (or will be executed when any variable in assignment expression changes)";
const TIMEOUT_PLACEHOLDER = "Write timeout milliseconds here";
const INITIAL_PLACEHOLDER = "Is initial assignment? true or false (executes the assignment when the game starts)";
export const createExpressionPopup = (parent, onSave) => {
    const callbacks = {
        onSave
    }
    const state = {
        storage:"",
        expression:"",
        condition:"",
        timeout:0,
        initial:""
    }
    const container = new UIContainerRect(parent);
    container.thickness = 1;
    container.width = 600;
    container.height = 400;
    container.color = Color4.White();
    container.vAlign = "top";
    container.positionY = -50;

    /*  const inputVariableLabel = new UIText(parent);
      inputVariableLabel.color = COLOR_BLACK;
      inputVariableLabel.value = "Variable name";
      inputVariableLabel.vAlign = "top";
      inputVariableLabel.hAlign = "left";
      inputVariableLabel.positionX = 110;
      inputVariableLabel.positionY = -30;*/
    const inputVariable = new UIInputText(container);
    inputVariable.vAlign = "top";
    inputVariable.hAlign = "left";
    inputVariable.width = 580;
    inputVariable.positionX = 10;
    inputVariable.positionY = -30;
    inputVariable.height = 20;
    inputVariable.outlineColor = COLOR_BLACK;
    inputVariable.focusedBackground = COLOR_BLACK;
    inputVariable.paddingTop = 0;
    inputVariable.color = Color4.Black();
    inputVariable.placeholder = VARIABLE_PLACEHOLDER;
    inputVariable.value = "doo";
    inputVariable.onChange(()=>{
        state.storage = inputVariable.value === VARIABLE_PLACEHOLDER?undefined:inputVariable.value;
    })
    /*    const inputAssignmentLabel = new UIText(parent);
        inputAssignmentLabel.color = COLOR_BLACK;
        inputAssignmentLabel.value = "Assignment expression (what will be evaluated and saved into the variable)";
        inputAssignmentLabel.vAlign = "top";
        inputAssignmentLabel.hAlign = "left";
        inputAssignmentLabel.positionX = 110;
        inputAssignmentLabel.positionY = -80;*/

    const inputAssignment = new UIInputText(container);
    inputAssignment.vAlign = "top";
    inputAssignment.hAlign = "left";
    inputAssignment.width = 580;
    inputAssignment.positionX = 10;
    inputAssignment.positionY = -80;
    inputAssignment.height = 20;
    inputAssignment.outlineColor = COLOR_BLACK;
    inputAssignment.focusedBackground = COLOR_BLACK;
    inputAssignment.paddingTop = 0;
    inputAssignment.color = Color4.Black();
    inputAssignment.placeholder = EXPRESSION_PLACEHOLDER;
    inputAssignment.onChange(()=>{
        state.expression = inputAssignment.value === EXPRESSION_PLACEHOLDER ? undefined:inputAssignment.value;
    })
    /* const inputConditionLabel = new UIText(parent);
     inputAssignmentLabel.color = COLOR_BLACK;
     inputAssignmentLabel.value = "Condition expression (defines if the assignment will be executed, if not defined, the assignment will be executed when variables in assignments changes)";
     inputAssignmentLabel.vAlign = "top";
     inputAssignmentLabel.hAlign = "left";
     inputAssignmentLabel.positionX = 110;
     inputAssignmentLabel.positionY = -110;*/

    const inputCondition = new UIInputText(container);
    inputCondition.vAlign = "top";
    inputCondition.hAlign = "left";
    inputCondition.width = 580;
    inputCondition.positionX = 10;
    inputCondition.positionY = -120;
    inputCondition.height = 20;
    inputCondition.outlineColor = COLOR_BLACK;
    inputCondition.focusedBackground = COLOR_BLACK;
    inputCondition.paddingTop = 0;
    inputCondition.color = Color4.Black();
    inputCondition.placeholder = CONDITION_PLACEHOLDER;
    inputCondition.onChange(()=>{
        state.condition = inputCondition.value == CONDITION_PLACEHOLDER ? undefined : inputCondition.value;
    })
    const inputTimeout = new UIInputText(container);
    inputTimeout.vAlign = "top";
    inputTimeout.hAlign = "left";
    inputTimeout.width = 580;
    inputTimeout.positionX = 10;
    inputTimeout.positionY = -210;
    inputTimeout.height = 20;
    inputTimeout.outlineColor = COLOR_BLACK;
    inputTimeout.focusedBackground = COLOR_BLACK;
    inputTimeout.paddingTop = 0;
    inputTimeout.color = Color4.Black();
    inputTimeout.placeholder = TIMEOUT_PLACEHOLDER;
    inputTimeout.onChange((value)=>{
        const num = Number(inputTimeout.value);

        if(isNaN(num)){
            state.timeout = 0;
        }else{
            state.timeout = num;
        }
    })
    const inputInitial = new UIInputText(container);
    inputInitial.vAlign = "top";
    inputInitial.hAlign = "left";
    inputInitial.width = 580;
    inputInitial.positionX = 10;
    inputInitial.positionY = -160;
    inputInitial.height = 20;
    inputInitial.outlineColor = COLOR_BLACK;
    inputInitial.focusedBackground = COLOR_BLACK;
    inputInitial.paddingTop = 0;
    inputInitial.color = Color4.Black();
    inputInitial.placeholder = INITIAL_PLACEHOLDER;
    inputInitial.onChange(()=>{
        state.initial = inputInitial.value;
    })

    const saveBackground = new UIContainerRect(container);
    saveBackground.vAlign = "top";
    saveBackground.hAlign = "left";
    saveBackground.width = 60;
    saveBackground.height = 30;
    saveBackground.color = COLOR_BLACK;
    saveBackground.positionX = 10;
    saveBackground.positionY = -280;

    const saveButton = creteUIButton({
        container:saveBackground,
        x:20,y:-4,
        onClick:() => callbacks.onSave(state),
        sprite:{
            sourceWidth:128,
            sourceHeight:64,
            sourceLeft:128,
            sourceTop:32
        },
        height:30,width:30
    });
    const exitBackground = new UIContainerRect(container);
    exitBackground.vAlign = "top";
    exitBackground.hAlign = "left";
    exitBackground.width = 60;
    exitBackground.height = 30;
    exitBackground.color = COLOR_BLACK;
    exitBackground.positionX = 120;
    exitBackground.positionY = -280;
    const exitButton = creteUIButton({
        container:exitBackground,
        x:20,y:-4,
        onClick:()=>{
            container.visible = false;
        },
        sprite:{
            sourceWidth:128,
            sourceHeight:64,
            sourceLeft:0,
            sourceTop:32
        },
        height:30,width:30
    });

    applyState();
    function applyState(newState?:any){
        console.log("eDetail applyState",newState);
        if(newState) Object.assign(state, {initial:undefined, ...newState});

        const {storage, condition, expression, initial, timeout} = state;
        if(!newState){
            console.log(JSON.stringify({storage, condition, expression, initial, timeout}))
        }

        inputVariable.value = inputVariable.placeholder = storage||VARIABLE_PLACEHOLDER;
        inputAssignment.value = inputAssignment.placeholder = expression||EXPRESSION_PLACEHOLDER;
        inputCondition.value = inputCondition.placeholder = condition||CONDITION_PLACEHOLDER;
        inputTimeout.value = inputTimeout.placeholder = (timeout||TIMEOUT_PLACEHOLDER).toString();
        inputInitial.value = inputInitial.placeholder = initial !== undefined
                                            ? (initial
                                                ? initial
                                                : "false")
                                            : INITIAL_PLACEHOLDER;


    }

    return {
        show:(newState?)=>{
            console.log("show", newState);
            container.visible = true;
            if(newState){
                applyState(newState);
            }else{
                inputVariable.value= inputVariable.placeholder = VARIABLE_PLACEHOLDER;
                inputAssignment.value = inputAssignment.placeholder = EXPRESSION_PLACEHOLDER;
                inputCondition.value = inputCondition.placeholder = CONDITION_PLACEHOLDER;
                inputInitial.value = inputInitial.placeholder = INITIAL_PLACEHOLDER;
                inputTimeout.value = inputTimeout.placeholder = TIMEOUT_PLACEHOLDER;
            }
        },
        hide:()=>{
            container.visible = false;
        }
    }
}

function creteUIButton({container, y, x, onClick, sprite, height = 30, width = 60}){

    const image = new UIImage(container, getTexture(`images/spritesheet.png`));

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