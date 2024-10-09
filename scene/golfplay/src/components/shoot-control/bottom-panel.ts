import {getCanvas} from "../../../services/canvas";
import {getTexture} from "../../../services/resource-repo";

export const createControlHint = () => {
    const canvas = getCanvas();
    const image = new UIImage(canvas, getTexture(`images/spritesheet.png`));
    image.vAlign = "bottom";
    image.hAlign = "right";
    image.positionX = -20;
    image.positionY = 70;

    const stepSprites = [{
        sourceLeft:0,
        sourceTop:235,
        width:308/1.5,
        height:200/1.5,
        sourceWidth:308,
        sourceHeight:200
    },{
        sourceLeft:309,
    }];
    Object.assign(image,stepSprites[0]);

    image.isPointerBlocker = false;
    image.visible = false;
    return {
        show:()=>image.visible = true,
        hide:()=>image.visible = false,
        setStep:(value)=>{
            Object.assign(image,stepSprites[value]);
        },
    }
}