import { getLevelInfo } from "../../../../common/utils";
import { globalStore } from "../../services/globalStore/globalStore";

const createLevelUI = (container) => {
    const userData = globalStore.userData.getState();
    const label = new UIText(container);
    const {currentLevel, progressPercentage} = getLevelInfo(userData.xp);

    label.value = `Level ${currentLevel}`;
    label.vAlign = "top";
    label.hAlign = "left";
    label.height = 16;
    label.fontSize = 12;
    label.adaptWidth = true;    
    label.paddingTop = label.paddingBottom = label.paddingLeft = label.paddingRight = 0;
    label.positionY = -8;

    const barBack = new UIContainerRect(container);
    const barFront = new UIContainerRect(barBack);
    barBack.height  = 16;
    barBack.color = new Color4(0, 0, 0, 0.5);
    barBack.width = 100;
    barFront.height = 16;    
    barFront.vAlign = "top";
    barFront.hAlign = "left";
    barFront.color = new Color4(0,1,1,0.7);
    barFront.width = progressPercentage;
    barBack.positionY = barBack.positionY = -8;

    globalStore.userData.onChange(({newValue, oldValue, prop})=>{
        const {currentLevel, progressPercentage} = getLevelInfo(newValue);
        barFront.width = progressPercentage;
        label.value = `Level ${currentLevel}`;
    }, "xp");
};



export {
    createLevelUI
};

/* 
Math.cbrt = Math.cbrt || function(x) {
    var y = Math.pow(Math.abs(x), 1/3);
    return x < 0 ? -y : y;
  };
*/