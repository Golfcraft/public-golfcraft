import {getTexture} from "../../../../services/resource-repo";
import {getSpriteDefinition} from "../SpriteRepo";
import {SPRITE} from "../sprites";

const createSlot = (parent, options) => {
    const baseUrl = (<any>engine)["__COURSE_MODELS_BASE__"]||"";
    const {slotSize, x, y, onClick} = options;
    let background = new UIContainerRect(parent);
    
    background.width = slotSize;
    background.height = slotSize;
    background.vAlign = "top";
    background.hAlign = "left";
    background.positionX = x;
    background.positionY = -y;     
    background.color = Color4.Black();
    background.opacity = 0.5;

    const spriteImage = new UIImage(parent, getTexture(baseUrl+'images/parts_spritesheet_01.png'));
    spriteImage.positionY = -y;
    spriteImage.positionX = x;
    spriteImage.vAlign = "top";
    spriteImage.hAlign = "left";
    spriteImage.width = spriteImage.height = slotSize;
    spriteImage.visible = false;

    const callbacks = {
        onClick
    };
    let thumbnailImages = {};

    const getImage = (alias, url?)=>{
        if(thumbnailImages[alias]){
            return thumbnailImages[alias];
        }else{
            const image = new UIImage(parent, getTexture({alias, url}));
            image.positionY = -y-4;
            image.positionX = x+2;
            image.sourceWidth = image.sourceHeight = 64;
            image.vAlign = "top";
            image.hAlign = "left";
            image.width = image.height = slotSize - 8;
            image.visible = false;
            thumbnailImages[alias] = image;
            if(callbacks.onClick){
                image.onClick = new OnClick(()=>{
                    callbacks.onClick && callbacks.onClick({alias});
                })
            }
            return image;
        }
    };
    const state = {
        alias:null,
        id:null,
        x, y
    };

    return {
        setVisible:(value)=>{
            background.visible = value;
        },
        onClick: (fn) => {
            callbacks.onClick = fn;
            return () => callbacks.onClick = null;
        },
        dispose:() => {
            callbacks.onClick = null;
            background.visible = false;
            //TODO we cannot remove UI elements, so we should create a pool and disabled/hide the necessary            
        },
        setElement:({id, sprite, thumbnail, data})=>{
            const {alias} = data;
            state.alias = alias;
            state.id = id;
            if(thumbnail){
                const image = getImage(alias, `data:image/png;base64,` + thumbnail);
                image.visible = true;
            }else if(sprite){
                spriteImage.visible = true;
                Object.assign(spriteImage, sprite);
                spriteImage.width = spriteImage.height = slotSize;
            }
        },
        getState:()=>state,
        reset:()=>{
            if(state.alias){
                try{
                    getImage(state.alias).visible = false;
                }catch(err){
                    console.error("not found image with alias "+state.alias);
                }
            }else{
                spriteImage.visible = false;
            }
            state.id = null;
            state.alias = null;
        }
    };
};

const createSlotPanel = (parent = new UICanvas(), options ) => {
    const background = new UIContainerRect(parent);
    const container = new UIContainerRect(parent);
    const parentWidthNum = Number(parent.width.toString().replace("px",""));
    const parentHeightNum = Number(parent.height.toString().replace("px",""));
    const slotSize = options.slotSize || 64;
    const padding = 2;
    const columns = Math.floor(parentWidthNum / (slotSize + padding));
    const rows = Math.floor(parentHeightNum / (slotSize + padding));
    const MAX_SLOTS = columns * rows;

    const selectionFrame = new UIContainerRect(container);
    selectionFrame.width = selectionFrame.height = slotSize;
    selectionFrame.color = new Color4(0,0.5,1,0.5);
    selectionFrame.thickness = 2;
    selectionFrame.vAlign = "top";
    selectionFrame.hAlign = "left";
    selectionFrame.visible = false;

    const component = {
        slots:Array(MAX_SLOTS).fill(null).map((_,index)=>{
            const currentRow = getCurrentRow(columns, index);
            const currentColumn = index%columns;
            return createSlot(container, {
                slotSize,
                x:padding+currentColumn*(slotSize+padding),
                y:padding+currentRow*(slotSize+padding),
                onClick:(item)=>{
                    callbacks.onClickItem && callbacks.onClickItem(item);
                }
            });
        })
    };
    background.width = container.width = parentWidthNum;
    background.height = container.height = parentHeightNum - 30;
    background.hAlign = container.hAlign = "left";
    background.vAlign = container.vAlign = "top";
    background.positionY = container.positionY = -30;
    background.color = Color4.White();
    background.opacity = 0.2;
    const callbacks = {
        onClickItem:null
    }

    return {
        setElements:(elements)=>{
            component.slots.forEach(slot=>slot.reset());
            elements.forEach(({sprite, thumbnail, data, id}, index) => {
               component.slots[index].setElement({
                   sprite:sprite && getSpriteDefinition(SPRITE[sprite]),
                   thumbnail,
                   data,
                   id
               });
            });
        },
        onClickItem:(fn)=>{
            callbacks.onClickItem = fn;
        },
        setMaxSlots:(num:number)=>{
            if(!num){
                component.slots.forEach((slot,index)=>{
                    slot.setVisible( true)
                });
            }else{
                component.slots.forEach((slot,index)=>{
                    slot.setVisible( (index) < Math.min(num, MAX_SLOTS) )
                });
            }

           /*  console.log("component", component);
            component.slots.forEach(slot=>slot.dispose());
            component.slots = (new Array(num)).fill(null).map((_,index)=>{
                const currentRow = getCurrentRow(columns, index);
                const currentColumn = index%columns;
                return createSlot(container, {
                    slotSize,
                    x:padding+currentColumn*(slotSize+padding),
                    y:padding+currentRow*(slotSize+padding)
                });
            });
            console.log("component2", component); */
        },
        select:(id)=>{
            const selectedSlot = component.slots.find(s=>s.getState().id === id);

            if(selectedSlot){
                selectionFrame.visible = true;
                selectionFrame.positionY = -selectedSlot.getState().y;
                selectionFrame.positionX = selectedSlot.getState().x;
            }else{
                selectionFrame.visible = false;
            }
        }
    }
}

function getCurrentRow(maxPerRow, index){
    let num = index+1;
    let row = 0;
    while(num--){
        if(num % maxPerRow === 0){
            row++;
        }
    }
    return row-1;
}

export {
    createSlotPanel
};

/* const withCallbacks =  (keys:string[]) => (...params) => (fn) => { //TODO
    const source = fn(...params);
    const _dispose = source.dispose;    
    const callbacks = source.callbacks || {};
    
    keys.forEach(key=>callbacks[key] = null);

    Object.assign(source, {
        dispose:()=>{
            _dispose();
            keys.forEach(key=>{
                callbacks[key] = null;
            })
        }
    })
}; */