import {getCanvas} from "../../../golfplay/services/canvas";
import {sleep, tryFn} from "../../../../common/utils";
import {getTexture} from "../../../golfplay/services/resource-repo";

const canvas = getCanvas();
let container =  new UIContainerRect(canvas);
container.visible = false;
const title = new UIText(container);
const sub = new UIText(canvas);
sub.vAlign = "bottom";
sub.vTextAlign = "bottom";
sub.positionY = sub.positionX = 20;
sub.hAlign = sub.hTextAlign = "left";
const timeLabel = new UIText(container);
const playerList = new UIText(container);
playerList.vAlign = playerList.vTextAlign = "top";
playerList.positionY = -120;
timeLabel.positionY = -30;
title.fontSize = 16;
timeLabel.fontSize = 24;
playerList.fontSize = 14;
title.hTextAlign = timeLabel.hTextAlign = "center";
const avatarTexture0 = new Texture("");
const avatarTexture1 = new Texture("");
const avatarTexture2 = new Texture("");
const avatarTexture3 = new Texture("");
const avatarImage0 = new UIImage(container, avatarTexture0);
const avatarImage1 = new UIImage(container, avatarTexture1);
const avatarImage2 = new UIImage(container, avatarTexture2);
const avatarImage3 = new UIImage(container, avatarTexture3);
avatarImage0.positionY = -100;
avatarImage1.positionY = -180;
avatarImage2.positionY = -260;
avatarImage3.positionY = -340;
avatarImage0.width = avatarImage1.width = avatarImage2.width = avatarImage3.width = 64;
avatarImage0.height = avatarImage1.height = avatarImage2.height = avatarImage3.height = 64;
avatarImage0.visible = avatarImage1.visible = avatarImage2.visible = avatarImage3.visible = false;
avatarImage0.width = avatarImage0.height = avatarImage1.width = avatarImage1.height = avatarImage2.width = avatarImage2.height = avatarImage3.width = avatarImage3.height =64;
avatarImage0.hAlign = avatarImage1.hAlign = avatarImage2.hAlign = avatarImage3.hAlign = "left";
avatarImage0.vAlign = avatarImage1.vAlign = avatarImage2.vAlign = avatarImage3.vAlign = "top";
avatarImage0.sourceTop = avatarImage0.sourceLeft = avatarImage1.sourceTop = avatarImage1.sourceLeft = avatarImage2.sourceTop = avatarImage2.sourceLeft = avatarImage3.sourceTop = avatarImage3.sourceLeft = 0;
avatarImage0.sourceHeight = avatarImage0.sourceWidth = avatarImage1.sourceHeight = avatarImage1.sourceWidth =avatarImage2.sourceHeight = avatarImage2.sourceWidth =avatarImage3.sourceHeight = avatarImage3.sourceWidth =256;
avatarImage0.positionX = avatarImage1.positionX =avatarImage2.positionX =avatarImage3.positionX =-80;
avatarImage0.visible = avatarImage1.visible = avatarImage2.visible = avatarImage3.visible = false;
container.isPointerBlocker = false;playerList.isPointerBlocker = false;
container.vAlign = "top";
title.isPointerBlocker = timeLabel.isPointerBlocker = false;
const MULT = -80;
const BASE = -110;
const FAKE_GHOST_ADDRESS = ["0x0e81a534096a7aaaa1ba647f95397e47dafe7054","0x1a74ab8a1fda05a03c0e43fc06dd2c7a12668d04","0xD677743FFa24B738c252d88E5d9A2910b7BCE69a"];

avatarImage0.positionY = BASE;
avatarImage1.positionY = BASE + (MULT);
avatarImage2.positionY = BASE + (MULT*2);
avatarImage3.positionY = BASE + (MULT*3);

const cancelButton = new UIImage(canvas, getTexture("images/spritesheet.png"));
cancelButton.width = 60;
cancelButton.height = 24;
cancelButton.positionY = 60;
cancelButton.positionX = 0;
cancelButton.hAlign = "center";
cancelButton.vAlign = "top";
Object.assign(cancelButton, {
    sourceWidth:128,
    sourceHeight:64,
    sourceLeft:0,
    sourceTop:32
});
const callbacks ={
    cancel:function noop(){}
}
cancelButton.onClick = new OnPointerDown(()=>{
    console.log("cancel onClick",callbacks.cancel)
    callbacks.cancel();
})
cancelButton.visible = false;

export const showWaitForPlayers = (timeToStart, ghosts, userData, currentGame, onCancel?) => {
    const state = {
        cancelled:false,
        countdown:10,
        joinedPlayers:1
    };

    const _onCancel = onCancel;
    const currentUserName = userData.displayName;
    console.log("showWaitForPlayers userData", timeToStart, userData, onCancel);

    return new Promise(async (resolve, reject)=>{
        console.log("onCancel set",!!_onCancel, _onCancel);
        if(_onCancel){
            callbacks.cancel = function cancelCallback(){
                console.log("cancelled = true")
                state.cancelled = true;
                _onCancel();
                console.log("REJECT")
                reject(state);
                tryFn(()=>clearInterval(countdownInterval));
                tryFn(()=>clearInterval(confessionInterval));
            };
        }

        playerList.value = `${currentUserName}`;
        container.visible = true;
        cancelButton.visible = true;
        title.value = "Waiting players to join ...";
        avatarImage0.source = new AvatarTexture(userData.userId);
        avatarImage0.visible = true;
        let confessions;
        let confessionInterval;

        (async ()=>{
            sub.visible = true;
            let i = 0;
            confessions = await fetch(`https://golfcraftgame.com/api/get-random-confessions`).then(r=>r.json());
            sub.value = `Anonymous confession: <color=#ff00ff>${confessions[i]}</color>`;
            confessionInterval = setInterval(()=>{
                i++;
                if(i>=confessions.length){
                    i = 0;
                }
                sub.value = `Anonymous confession: <color=#ff00ff>${confessions[i]}</color>`;


            },10000);
        })();


        if(ghosts?.length && !state.cancelled){
           // timeLabel.value = state.countdown.toString();
            timeLabel.value = "";
            avatarImage1.source = new AvatarTexture(ghosts[0].address==="fake"?FAKE_GHOST_ADDRESS[0]:ghosts[0].address);
            avatarImage2.source = new AvatarTexture(ghosts[1].address==="fake"?FAKE_GHOST_ADDRESS[1]:ghosts[1].address);
            avatarImage3.source = new AvatarTexture(ghosts[2].address==="fake"?FAKE_GHOST_ADDRESS[2]:ghosts[2].address);

            const countdownInterval = setInterval(async ()=>{
                if(state.countdown <= 0) return;
                state.countdown--;
                timeLabel.value = "";//state.countdown.toString();
                if(state.cancelled) {
                    tryFn(()=>clearInterval(countdownInterval));
                    tryFn(()=>clearInterval(confessionInterval));
                    resolve(state);
                }
                if(state.countdown === 8 && ghosts[0]){
                    playerList.value = `${currentUserName}\n\n\n\n\n${ghosts[0].displayName}`;
                    avatarImage1.visible = true;
                }else if(state.countdown === 7 && ghosts[1]){
                    playerList.value = `${currentUserName}\n\n\n\n\n${ghosts[0].displayName}\n\n\n\n\n${ghosts[1].displayName}`;

                    avatarImage2.visible = true;
                }else if(state.countdown === 6 && ghosts[2]){
                    playerList.value = `${currentUserName}\n\n\n\n\n${ghosts[0].displayName}\n\n\n\n\n${ghosts[1].displayName}\n\n\n\n\n${ghosts[2].displayName}`;
                    avatarImage3.visible = true;
                }
                if(state.countdown === 0 || state.countdown === 6){

                    await sleep(2000);
                    container.visible = false;
                    cancelButton.visible = false;
                    sub.visible = avatarImage0.visible = avatarImage1.visible = avatarImage2.visible = avatarImage3.visible = false;
                    tryFn(()=>clearInterval(countdownInterval));
                    tryFn(()=>clearInterval(confessionInterval));
                    resolve(state);
                }

            }, 1000);
            playerList.value = `${currentUserName}`;
        }else{
            title.value = "Joining game ...";
            playerList.value = userData.displayName;
            timeLabel.value = "";

            resolve(state);
        }
    })

}

export async function hideWaitPlayers(){
    container.visible = false;
    cancelButton.visible = false;
}