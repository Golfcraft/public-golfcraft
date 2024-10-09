const canvas = new UICanvas();
const container = new UIContainerRect(canvas);
container.vAlign = "top";
container.hAlign = "center";
container.color = new Color4(0,0,0,0.7);
container.width = 500;    
container.height = 64;
container.positionY = -50;
container.visible = false;
container.isPointerBlocker = false;
const text = new UIText(container);
    text.vAlign = "top";
    text.hAlign = "center";
    text.hTextAlign = "center";
    text.vTextAlign = "top";
    text.paddingTop = 10;
    text.fontSize = 20;
    text.value = '___________________________';
let _timeout;
export const showMessage = ({timeout = 1000, message, inGameplay = false}) => {
    text.value = message;
    container.visible = true;
    if(_timeout) clearTimeout(_timeout);

    _timeout = setTimeout(()=>{
        container.visible = false;
    }, timeout);
    
}

export const hideMessage = ()=>{
    clearTimeout(_timeout);
    container.visible = false;
}