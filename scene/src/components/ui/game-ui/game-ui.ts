import {getCanvas} from "../../../../golfplay/services/canvas";
import {globalStore} from "../../../services/globalStore/globalStore";

export const createGameUi = () => {
    const playContainer = new UIContainerRect(getCanvas());
    playContainer.color = new Color4(0,0,0,0.5);
    playContainer.vAlign = "bottom";
    playContainer.hAlign = "right";
    playContainer.width = 200;
    playContainer.height = 32;
    playContainer.positionX = -20;
    playContainer.visible = false;
    const courseId = new UIText(playContainer);

    courseId.positionX = 10;
    courseId.vAlign = courseId.vTextAlign = "top";
    courseId.hAlign =  courseId.hTextAlign = "left"
    courseId.value = "courseId";

    //TODO move globalStore outside in a controller like lobby-ui controller
    globalStore.game.onChange(setCourseInfo, "courseId");
    globalStore.game.onChange(setCourseInfo, "courseAuthor");
    globalStore.game.onChange(setCourseInfo, "courseName");
    globalStore.game.onChange(({newValue,oldValue, prop}:any)=>{
        playContainer.visible = !!newValue;
    },"playing");
    globalStore.game.onChange(({newValue,oldValue, prop}:any)=>{
        playContainer.visible = !newValue;
    },"editing");

    function setCourseInfo(){
        let text = globalStore.game.getState().courseName ||  globalStore.game.getState().courseId ;
        if(globalStore.game.getState().courseAuthor){
            text += `\nby ${globalStore.game.getState().courseAuthor}`
        }
        courseId.value = text;
    }
}