import {globalStore} from "./globalStore/globalStore";
let hideAvatarsComponent;
const modArea = new Entity();

export const hideAvatarsHandler = (hideOwn?)=>{
    modArea.addComponent(new Transform({
        position:new Vector3(24,0,24)
    }));
    hideAvatarsComponent =new AvatarModifierArea({
        area: { box: new Vector3(16*3, 40, 16*3) },
        modifiers: [AvatarModifiers.HIDE_AVATARS,AvatarModifiers.DISABLE_PASSPORTS],
        excludeIds: hideOwn?[]:[globalStore.userData.getState().userId]
    })
    modArea.addComponent(hideAvatarsComponent);
}


export const showAvatars = () => {
    log("AvatarVisibility: Show")
    engine.removeEntity(modArea);
    log("AvatarVisibility: Excluded Ids",modArea.getComponent(AvatarModifierArea).excludeIds);
}

export const hideAvatars = () => {
    log("AvatarVisibility: Hide")
    engine.addEntity(modArea);
}