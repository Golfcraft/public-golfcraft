import { formatTime } from "../../../../common/utils";

let topbar;

const createTopBar = ({duration = 0, hTextAlign = "center"}) => {
    const canvas = new UICanvas();
    const container = new UIContainerStack(canvas);
    container.vAlign = "top";
    container.hAlign = "center";
    container.adaptHeight = true;
    
    const timerText = new UIText(container);
    timerText.value = formatTime(duration * 1000);
    timerText.fontSize = 30;
    timerText.height = 30;
    timerText.hTextAlign = hTextAlign;
    
    const state = { ms:duration };


    const hide = () => container.visible = false;
    const show = () => container.visible = true;
    const updateTime = (ms, includeMs) => {
        if(ms === state.ms) return;//TODO why?
        state.ms = ms;
        timerText.value = formatTime(ms, includeMs);
    };
   
    topbar = {
        hide,
        show,
        updateTime,
        isVisible:()=>!!container.visible
    };
    hide();
    return topbar;

    
}

const getTopBar = () => topbar;

export {
    createTopBar,
    getTopBar
}