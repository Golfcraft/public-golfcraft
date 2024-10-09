import {getCanvas} from "../../golfplay/services/canvas";
import {getTotalResultsText} from "../../../common/live-tournament-utils";
let liveTournamentResult;
let totalResultText
export function createOrGetLiveTournamentResultsUI(state){
    console.log("createOrGetLiveTournamentResultsUI");
    totalResultText = totalResultText || new UIText(getCanvas());
    totalResultText.hAlign = "left";
    totalResultText.vAlign = "top";
    totalResultText.fontSize = 16;
    totalResultText.positionX = 300;
    totalResultText.positionY = -140;
    totalResultText.hAlign = totalResultText.hTextAlign = "left";
    totalResultText.vAlign = totalResultText.vTextAlign = "top";
    totalResultText.visible = true;
    totalResultText.color = Color3.White();

    liveTournamentResult = liveTournamentResult || {
      update,
        show,
        hide
    };
    
    if(state) update(state);
    show();
    
    return liveTournamentResult;

    function update(state){
        totalResultText.value = getTotalResultsText(state);
    }

    function show(state?){
        if(state) update(state);
        totalResultText.visible = true;
    }

    function hide(){
        totalResultText.visible = false;
    }
}