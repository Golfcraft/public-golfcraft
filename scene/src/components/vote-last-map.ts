import {getTexture} from "./ui/ui-texture";
import {globalStore} from "../services/globalStore/globalStore";
const noop = (...args:any)=>{};
const canvas= new UICanvas();
export const createVoteLastMap = () => {

    const container = new UIContainerRect(canvas)
    const starContainer = new UIContainerStack(container);
    container.alignmentUsesSize = false;
    container.width = 320 + 20;
    container.color = new Color4(0,0,0,0.2)
    container.vAlign = "bottom";
    container.positionY = 100;
    container.height = 36;

    starContainer.hAlign = "left";
    starContainer.stackOrientation =UIStackOrientation.HORIZONTAL
    starContainer.adaptWidth  =false;
    starContainer.spacing = -16;
    starContainer.adaptHeight = true;
    const label1 = new UIText(container);
    const label2 = new UIText(container);
    label1.hAlign = "left";
    label2.hAlign = "left";
    label1.value = "1";
    label2.value = "10";
    label1.positionX = 15;
    label1.positionY = 17;
    label2.positionX = 315;
    label2.positionY = 17;
    label1.isPointerBlocker = false;
    label2.isPointerBlocker = false;
    const stars = new Array(10).fill(null).map((item, index)=>{
        const star = new UIImage(starContainer, getTexture(`images/ui-spritesheet.png`));
        star.sourceHeight = star.sourceWidth = 64;
        star.width = star.height = 32;
        star.sourceTop = 146;
        star.hAlign = "left";
        star.onClick = new OnClick(()=>{
            const voteValue = index+1;
            fetch(`https://golfcraftgame.com/api/vote-map`, {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    course_alias:globalStore.game.getState().lastMap,
                    address:globalStore.userData.getState().userId,
                    PlayFabId:globalStore.userData.getState().PlayFabId,
                    vote:voteValue
                })
            })
            globalStore.game.getState().votedLastMap = true;
        });

        return star;
    });

   const title = new UIText(container);
    title.isPointerBlocker = false;
    title.positionY = 50;
    title.value = "Vote last map";
    title.vAlign = "top";
    title.hAlign = "left";

    const show = ()=>container.visible = true;
    const hide = ()=>container.visible = false;
    container.visible = false;
    globalStore.game.onChange(({newValue, oldValue, prop})=>{
        //console.log("GAME CHANGED", prop, JSON.stringify(globalStore.game.getState()[prop]));

        if(
            !globalStore.game.getState().playing
            && !globalStore.game.getState().votedLastMap
            && globalStore.game.getState().lastMap
        ){
            title.value = `Vote last map: ${globalStore.game.getState().lastMap}`
            container.visible = true;
        } else {
            container.visible = false;
        }
    });
    return {
        hide,
        show
    }
}