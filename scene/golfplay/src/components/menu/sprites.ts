import {registerSpriteDefinition} from "./SpriteRepo";

const SPRITE = {
    BASIC:"basic",
    DESERT:"desert",
    Part2:"Part2",
    Part6:"Part6"
}

const registerAllSprites  = () => {
    registerSpriteDefinition(SPRITE.BASIC, {
        sourceHeight:64,
        sourceWidth:64,
        sourceLeft:0,
        sourceTop:0,
        width:32,
        height:32,
     });
    registerSpriteDefinition(SPRITE.DESERT, {
        sourceHeight:64,
        sourceWidth:64,
        sourceLeft:64,
        sourceTop:0,
        width:32,
        height:32,
    });
    registerSpriteDefinition(SPRITE.Part2, {
        sourceHeight:64,
        sourceWidth:64,
        sourceLeft:0,
        sourceTop:0,
        width:32,
        height:32,
    });
    registerSpriteDefinition(SPRITE.Part6, {
        sourceHeight:64,
        sourceWidth:64,
        sourceLeft:64,
        sourceTop:0,
        width:32,
        height:32,
    });
}

export {
    registerAllSprites,
    SPRITE
}