import courseMockTrainingHole from "../../../../common/course-definitions/courseMockTrainingHole";
import {formatTime, getLevelInfo, sleep} from "../../../../common/utils";
import { globalStore } from "../../services/globalStore/globalStore";
import {getTexture} from "./ui-texture";
declare const setTimeout;
let centerPopup;
export const getCenterPopup = () => centerPopup;
const canvas = new UICanvas();
export const createPopup = () => {
    if(centerPopup) throw Error("Center popup is already created");
    const uiTexture = getTexture("images/ui-spritesheet.png")
    const readyImg = new UIImage(canvas, uiTexture);
    readyImg.isPointerBlocker = false;
    readyImg.sourceLeft = 295;
    readyImg.sourceTop = 67;
    readyImg.sourceWidth = 727;
    readyImg.sourceHeight = 245;
    readyImg.width = 727/2;
    readyImg.height = 245/2;
    readyImg.visible = false;
    readyImg.positionY = 200;
    const golfClubImages = {
        "1":new UIImage(canvas, new Texture(`images/golfClub1.png`)),
        "2":new UIImage(canvas, new Texture(`images/golfClub2.png`)),
        "3":new UIImage(canvas, new Texture(`images/golfClub3.png`)),
    };
    const authorLabel = new UIText(canvas);
    authorLabel.visible = false;
    authorLabel.positionY = 130;
    authorLabel.fontSize = 20;
    authorLabel.isPointerBlocker = false;

    Object.values(golfClubImages).forEach(golfClubImage => {
        golfClubImage.isPointerBlocker = false;
        golfClubImage.visible = false;
        golfClubImage.positionY = -50;
        golfClubImage.sourceHeight = 612;
        golfClubImage.sourceWidth = 800;
        golfClubImage.width = 800/2;
        golfClubImage.height = 612/2;
    });

    const goImg = new UIImage(canvas, uiTexture);
    goImg.isPointerBlocker = false;
    goImg.sourceLeft = 354;
    goImg.sourceTop = 316;
    goImg.sourceWidth = 534;
    goImg.sourceHeight = 290;
    goImg.width = 534/2;
    goImg.height = 290/2;
    goImg.visible = false;

    globalStore.game?.onChange(({newValue, oldValue, prop}) => {
            if(!oldValue && newValue){//is starting
                //TODO start black fade
                readyImg.visible = true;
                //golfClubImages[globalStore.game.getState().golfClub.id].visible = true;

                //TODO show "ready"
            }else if(oldValue && !newValue){//was starting and game goes
                readyImg.visible = false;
                //golfClubImages[globalStore.game.getState().golfClub.id].visible = false;
                goImg.visible = true;

                //TODO show "go!" and hide after while
                setTimeout(() => {
                    goImg.visible = false;
                }, 1000);
            }
    }, "starting");
    globalStore.game?.onChange(({newValue, oldValue, prop})=> {
        if(prop === "courseAuthor" || prop === "courseName" || prop === "courseIsSeason"){
            console.log("courseName_",globalStore.game.getState().courseName)
            if (globalStore.game.getState().courseAuthor) {

                authorLabel.visible = true;
                authorLabel.value = `${globalStore.game.getState().courseName || globalStore.game.getState().courseId}\nby ${globalStore.game.getState().courseAuthor}`;
                setTimeout(() => {
                    authorLabel.visible = false;
                }, 3000)
            }else{
                authorLabel.value = `${globalStore.game.getState().courseName || globalStore.game.getState().courseId}`;
            }
            if(globalStore.game.getState().courseIsSeason){
                authorLabel.visible = false;
            }
        }

    });
    globalStore.userData.onChange(async ({ newValue, oldValue, prop }) => {
        const oldNum = Number(oldValue);
        const newNum = Number(newValue);
        const oldLevel = getLevelInfo(oldNum).currentLevel;
        const newLevel = getLevelInfo(newNum).currentLevel;
        if(newLevel !== oldLevel){
            await sleep(1000);
            showLevelUp(newLevel);
        }
    }, "xp");

    const textContainer = new UIContainerRect(canvas);
    textContainer.visible = false;
    textContainer.color = new Color4(0,0,0,0.7);
    textContainer.width = 300;
    textContainer.height = 200;
    const text = new UIText(textContainer);

    text.value = `...`;
    text.fontSize = 20;
    text.vAlign = text.hAlign = "center";
    text.hTextAlign = "center";
    text.vTextAlign = "center";
    text.paddingBottom = text.paddingLeft = text.paddingRight = text.paddingTop = 10;

    const successImg = new UIImage(canvas, uiTexture);
    successImg.isPointerBlocker = false;
    successImg.sourceLeft = 1023;
    successImg.sourceTop = 80;
    successImg.sourceWidth = 686;
    successImg.sourceHeight = 139;
    successImg.width = 686/2;
    successImg.height = 139/2;
    successImg.visible = false;
    successImg.positionY = 140;
    successImg.positionX = 10;


    const failedImg = new UIImage(canvas, uiTexture);
    failedImg.isPointerBlocker = false;
    failedImg.sourceLeft = 1023;
    failedImg.sourceTop = 219;
    failedImg.sourceWidth = 500;
    failedImg.sourceHeight = 146;
    failedImg.width = 500/2;
    failedImg.height = 146/2;
    failedImg.visible = false;
    failedImg.positionY = 200;
    failedImg.hAlign = failedImg.vAlign = "center";

    const timeoutImg = new UIImage(canvas, uiTexture);
    timeoutImg.isPointerBlocker = false;
    timeoutImg.sourceLeft = 1023;
    timeoutImg.sourceTop = 367;
    timeoutImg.sourceWidth = 610;
    timeoutImg.sourceHeight = 140;
    timeoutImg.width = 610/2;
    timeoutImg.height = 140/2;
    timeoutImg.visible = false;
    timeoutImg.positionY = 200;

    const levelUp = new UIImage(canvas, uiTexture);
    levelUp.isPointerBlocker = false;
    levelUp.sourceLeft = 1023;
    levelUp.sourceTop = 504;
    levelUp.sourceWidth = 661;
    levelUp.sourceHeight = 136;
    levelUp.width = 661/2;
    levelUp.height = 136/2;
    levelUp.visible = false;
    levelUp.positionY = 140;

    function showLevelUp(level){
        textContainer.visible = true;
        levelUp.visible = true;
        text.value = "Congrats for reaching level "+ level;
        //TODO also add rewards for level up
        setTimeout(()=>{
            textContainer.visible = false;
            text.value = ":/"
            levelUp.visible = false;
        }, 3000);
    }

    centerPopup =  {
        dispose:()=>{},
        showPlayResult:({xp, GC, PT,failed, timeout, time, shoots, materialDrops}:any)=>{
            if (xp || GC) {
                textContainer.visible = true;
                successImg.visible = true;
                let textValue = `Time: ${formatTime(time)}\nShots: ${shoots}\nExperience: ${xp||0}\nGold coins:${GC||0}`
                if(PT){
                    textValue += `\nSurprise tickets: ${PT}`
                }
                if(materialDrops && Object.keys(materialDrops).length){
                    Object.keys(materialDrops).forEach((materialKey)=>{
                        textValue += `\n${materialKey}: ${materialDrops[materialKey]}`;
                    });
                }
                text.value = textValue;
            } else if(failed){
                failedImg.visible = true;
            } else if(timeout){
                timeoutImg.visible = true;
            }

            setTimeout(()=>{
                successImg.visible = false;
                failedImg.visible = false;
                timeoutImg.visible = false;
                textContainer.visible = false;
                text.value = ":/";
            },3000);

        }
    };
    return centerPopup;
}
