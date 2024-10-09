import {getCanvas} from "../../golfplay/services/canvas";
import {globalStore} from "../services/globalStore/globalStore";
import {formatTime} from "../../../common/utils";

const state = {
    room:null
};
let gameplayUi;
let uiText;

export function createOrGetLiveTournamentGameplayUI(playingRoom){
    const userAddress = globalStore.userData.getState().user.userId.toLowerCase();
    state.room = playingRoom;
    state.room.onStateChange(updateViewFromState)
    
    uiText = uiText || new UIText(getCanvas());
    uiText.fontSize = 10;
    uiText.paddingRight = 50;
    uiText.positionY = 0;
    uiText.hAlign = uiText.hTextAlign = "right";
    uiText.vAlign = uiText.vTextAlign = "top";
    uiText.visible = true;
    uiText.color = Color3.White();

    updateViewFromState();

    gameplayUi = gameplayUi || {
        show,hide,updateViewFromState,disposeRoom
    };
    return gameplayUi;

    function show(){
        uiText.visible = true;
    }
    function hide(){
        uiText.visible = false;
    }

    function updateViewFromState(){
        const room = state.room;
        const txt = room.state.players.map(({displayName, address},playerIndex)=>{
            return {
                displayName,
                shots:room.state.courseResults[room.state.currentMapIndex].playersShots[playerIndex],
                time:room.state.courseResults[room.state.currentMapIndex].playersTime[playerIndex],
                isCurrentPlayer:userAddress === address, playerIndex
            };
        })
            .sort((a,b)=> {
                if(a.time && !b.time) return -1;
                if(b.time && !a.time) return 1;
                if(a.shots === b.shots) return a.time - b.time;
                return a.shots - b.shots;
            })
            .map(({displayName, shots, isCurrentPlayer, time})=>`<color=${isCurrentPlayer?"yellow":"white"}>${displayName.padStart(20," ")} ${formatTime(time||0,false)} ${shots}</color>`)
            .join("\n");
        uiText.value = txt;
    }

    function disposeRoom(){
        state.room = null;
    }
}