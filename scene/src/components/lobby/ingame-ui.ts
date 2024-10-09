import {getCanvas} from "../../../golfplay/services/canvas";
import {formatTime} from "../../../../common/utils";

let inGameResultsContainer;

export const createInGameTime = () => {
    //TODO analysis, should be smart or dumb, better, first as a dumb component, just a UI element on top
    let inGameClockContainer = new UIContainerRect(getCanvas());
    let inGameClockText = new UIText(inGameClockContainer);

    inGameClockContainer.vAlign = "top";
    inGameClockText.vAlign = "top";
    inGameClockContainer.hAlign = "center";
    inGameClockContainer.positionY = 70;
    inGameClockText.value = "00:00";
    inGameClockText.hAlign = "center";
    inGameClockText.hTextAlign = "center";
    inGameClockText.fontSize = 40;
    return {
        updateMs:(ms) => {
            inGameClockText.value = formatTime(ms);
        },
        show:()=>inGameClockContainer.visible = true,
        hide:()=>inGameClockContainer.visible = false
    };
}


export const createInGameResultsUi = (results) => {
    inGameResultsContainer = inGameResultsContainer || new UIContainerRect(getCanvas());
    inGameResultsContainer.vAlign = "top";
    inGameResultsContainer.hAlign = "right";
    inGameResultsContainer.color = new Color4(0,0,0,0.2);
    inGameResultsContainer.width = 200;
    inGameResultsContainer.height = 70;
    inGameResultsContainer.visible = true;
    const rows = [];
    results.forEach((playerResult, index)=>{
        // console.log("result", playerResult.toJSON(), index);
        //const textContainer = new UIContainerRect(container);
        const row = new UIText(inGameResultsContainer);
        rows.push(row);
        row.hAlign = "right";
        row.vAlign = "top";
        row.positionY = -6 + -index*15;
        row.positionX = -10;
        row.hTextAlign = "right";
        row.vTextAlign = "top";

        // @ts-ignore
    });
    updateView(results);

    return {
        updateView,
        hide:()=>inGameResultsContainer.visible = false,
        show:()=>inGameResultsContainer.visible = true,
        resetView:()=>{
            results.forEach((playerResult, index)=>{
                rows[index].value = (playerResult.name||playerResult.displayName||"_player_").padEnd(20," ").slice(0,20)
                    + formatTime(0,true)
                    + "   0";
            })
        }
    }

    function updateView(results, currentGame = 0){
        results.forEach((playerResult, index)=>{
            rows[index].value = (playerResult.name||playerResult.displayName||"_player_").padEnd(20," ").slice(0,20)
                + formatTime(playerResult.time[currentGame||0]||0,true)
                + "   " + (playerResult.shots[currentGame||0]||0);
        })
    }
}