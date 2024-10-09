export type SpriteDefiniton = {
    sourceHeight:number,
    sourceWidth:number,
    sourceLeft:number,
    sourceTop:number,
    width:number,
    height:number,
};

export default {
    fishing:{
        sourceHeight:16,
        sourceWidth:16,
        sourceLeft:32,
        sourceTop:0,
        width:16,
        height:16,
    }
};

const repo = {};

const registerSpriteDefinition = (key, defintion) => {
    repo[key] = defintion;
};

const getSpriteDefinition = (key) => {
    return repo[key];
}

export {
    registerSpriteDefinition,
    getSpriteDefinition
};