import { SpriteDefiniton } from "../SpriteRepo";
import { getImageSrc } from "../utils";

const createSprite = (parent = new UICanvas(), spriteDefinition) => {
    const image = new UIImage(parent, new Texture(getImageSrc(`parts_spritesheet_01`), {hasAlpha:true, samplingMode:0}));
    Object.assign(image, spriteDefinition);    
    image.hAlign = "left";
    image.vAlign = "top";
    return image;
};

export type TabDefinition = {
    id:string,
    label?:string,
    maxSlots?:number,
    elements:any[],
    selected?:boolean
}
type TabOptions = {
    tabDefinition:TabDefinition, 
    active?:boolean, 
    tabDefaultSize:number
};

const createTab = (parent = new UICanvas(), options:TabOptions) => {
    const {tabDefinition, active, tabDefaultSize} = options;
    const tab = new UIContainerRect(parent);
    const callbacks = {
        onClick:null
    }
    const state = { active };
    tab.height = 24;
    tab.positionY = 10;
    tab.width = tabDefaultSize || 100;
    tab.adaptWidth = false;
    tab.adaptHeight = false;                        
    tab.color = Color4.White();
    tab.opacity = active ? 1 : 0.66;

    if(tabDefinition.label){
        const text = new UIText(tab);
        text.font = new Font(Fonts.LiberationSans);
        text.fontSize = 12;
        text.positionY = 30;
        text.paddingLeft = tabDefinition.spriteDefinition?26:10;
        text.value = tabDefinition.label;
        text.vAlign = "top";
        text.hAlign = "left";  
        text.color = Color4.Black();              
    }
    if(tabDefinition.spriteDefinition){
       const icon = createSprite(tab, tabDefinition.spriteDefinition);
       icon.positionX = 6;
       icon.vAlign = "center";
    }
    const handler = new UIContainerRect(tab);
    handler.height = 24;
    handler.width = 100;
    handler.opacity = 0;
    handler.color = Color4.Yellow()
    const handlerImg = new UIImage(handler, new Texture(``));
    handlerImg.opacity = 0;
    handlerImg.onClick = new OnClick(()=>{
        callbacks.onClick && callbacks.onClick();
    });

    return {
        onClick:(fn)=>{
            callbacks.onClick = fn;
            return () => callbacks.onClick = null;
        },
        isActive:()=>state.active,
        setActive:(active)=>{
            tab.opacity = active ? 1 : 0.66;
            state.active = active;
        },
        getDefinition:()=>tabDefinition,
        dispose:()=>{
            callbacks.onClick = null;
        }
    }
}

export {
    createTab
}