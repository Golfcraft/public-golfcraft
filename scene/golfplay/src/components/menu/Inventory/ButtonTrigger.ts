import { getImageSrc } from "../utils";

const canvas = new UICanvas();
type Sprite = {
    src:string
    offsetX:number,
    offsetY:number,
    width:number,
    height:number
};
interface ButtonTriggerParams {
    parent?:UICanvas|UIContainerRect|UIContainerStack,
    sprite?:Sprite,
    backgroundColor?:Color4
}



const createButtonTrigger = ({parent = canvas, sprite, backgroundColor}:ButtonTriggerParams) => {  
    const image = new UIImage(parent, new Texture(getImageSrc('parts_spritesheet_01'), {samplingMode:0}))
    image.sourceHeight = 32;
    image.sourceWidth = 32;
    image.sourceLeft = 0;
    image.sourceTop = 0;
    image.width = 32;
    image.height = 32;
    image.hAlign = "right";
    image.vAlign = "bottom";
    image.onClick = new OnClick(()=>{
        callbacks.onClick && callbacks.onClick();
    })
    const callbacks = {
        onClick:null
    };

    return {
        onClick: (fn) => {
            callbacks.onClick = fn;
            return () => callbacks.onClick = null;
        },
        dispose:()=>{
            image.onClick = null;
            Object.keys(callbacks).forEach((callbackKey)=>callbacks[callbackKey] = null);
        }
    }
};

export {
    createButtonTrigger
}