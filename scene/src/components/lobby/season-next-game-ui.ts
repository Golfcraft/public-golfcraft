import {getCanvas} from "../../../golfplay/services/canvas";
import {fadeInOverlay, fadeOutOverlay} from "../ui/overlay";
import {formatTime, getTierFromSub, sleep} from "../../../../common/utils";
import {TIER_CATEGORIES, TIERS} from "../../../../common/constants";
import {CURRENCY, CURRENCY_NAMES} from "../../../../common/currency-codes";
//import {atlasAnalytics} from "../../atlas-analytics-service";

const canvas = getCanvas();
let container, title, results, timeLabel;

export const createOrShowNextGameUi = async (user, currentGame, resultData, tierSub, newTierSub, callback = ()=>{}, timeout = 5000, rewards = null, rewardsBonus) => {
    console.log("createOrShowNextGameUi tierSub, newTierSub,rewardsBonus",tierSub, newTierSub, rewardsBonus);

    if(!container){
        container = new UIContainerRect(canvas);
        title = new UIText(container);
        results = new UIText(container);
        timeLabel = new UIText(container);

        title.fontSize = 40;
        results.fontSize = 16;
        container.vAlign = "top";
        container.hAlign = "center";
        title.vAlign = title.vTextAlign = "top";
        title.hAlign = title.hTextAlign = "center";
        results.positionY = -150;
        results.hAlign = results.hTextAlign = "left";
        results.vAlign = results.vTextAlign = "top";
        results.positionX = -60;
    }

    container.visible = true;

    title.value = currentGame === 4 ? `End results` : `Round ${currentGame+1}/4`;
    console.log("createOrShowNextGameUi", currentGame,JSON.stringify(resultData,null, "  "), formatTime(Date.now(),true), tierSub, newTierSub, rewardsBonus, rewards, timeout);
    const sortedResult = [...resultData].sort((a,b)=>{
        return b.score.reduce(sumAcc,0) - a.score.reduce(sumAcc,0);
    });

    results.value = sortedResult.map(playerResults => {
        let str = playerResults?.name && `${playerResults.name.padEnd(26,"_")}| ${playerResults.score[0]} | ${playerResults.score[1]} | ${playerResults.score[2]} | ${playerResults.score[3]} |     <b>${playerResults.score.reduce(sumAcc, 0).toString().padStart(2,"0")}</b>` || "";
        if(playerResults.address === user.userId){
            str = `<color=#ffff00>${str}</color>`
        }
        return str;
    }).join( "\n\n");
    console.log("RESULTS_\n",rewards,`\n`+results.value);

    if(currentGame === 4){//END RESULTS

        const tierPoints = newTierSub - tierSub;
        const currentTier = Math.max(0,getTierFromSub(newTierSub)||0);
        const previousTier = Math.max(0,getTierFromSub(tierSub)||0);
        debugger;
        const currentTierWord = TIERS[currentTier].split(" ")[0];
        const previousTierWord = TIERS[previousTier].split(" ")[0];
        const currentTierWordIndex = TIER_CATEGORIES.indexOf(currentTierWord);
        const previousTierWordIndex = TIER_CATEGORIES.indexOf(previousTierWord);
        const nextCategoryWord = TIER_CATEGORIES[currentTierWordIndex+1];

        results.value += `\n\nYou get ${tierPoints} <color=#ffff00>season points</color>`;

        if(Object.values(rewards).some(i=>i)){
            results.value += Object.keys(rewards).map(currencyKey => CURRENCY_NAMES[currencyKey] && rewards[currencyKey] && (`\n+${rewards[currencyKey]} <color=#ffff00>${CURRENCY_NAMES[currencyKey]}</color>`) || '').join("");

            results.value += `\n\nTier bonus: x${rewardsBonus.tier.toFixed(2)}`;
            results.value += `\nWearables bonus: x${rewardsBonus.wearables.toFixed(2)}`;
            results.value += `\nGolfclubs bonus: x${rewardsBonus.golfclubs.toFixed(2)}\n`;
        }


        if(currentTier > previousTier){
            results.value += `\nCONGRATS! You have promoted from ${TIERS[previousTier]}(${previousTier}) to ${TIERS[currentTier]}(${currentTier})`;
        }else if(currentTier === previousTier && tierPoints > 0){
            results.value += `\nNICE! keep playing, you are closer to the next Tier <color=#ffff00><b>${TIERS[currentTier+1]}.</b></color>`;
            //TODO if the word is different, say "you will receive a wearable"
        }else if(tierPoints < 0){
            results.value += `\n Oops!`
        }

        if(currentTier < previousTier){
            results.value += `\nYou have been demoted to lower Tier. ${currentTier} -> ${previousTier}`
            results.value += `\nBut Don't worry! I'm sure you will do better next time.`
        }

        if(currentTierWordIndex === previousTierWordIndex){//TODO
            if(currentTier > previousTier){
                results.value += "\n\nNow you have won some resources !!";
            }
            if(tierPoints >= 0){
                //results.value += `\nYou will receive a <color=#ff00ff>wearable</color> once you promote to <color=#ffff00>${nextCategoryWord}</color>`;
            }

        }

        // Not working due to bizarre errors
        //atlasAnalytics.submitGenericEvent(`gbc-results-season`);

    } else {
        if(rewards) results.value += Object.keys(rewards).map(currencyKey => rewards[currencyKey]>0 && `\n+${rewards[currencyKey]===2?"+":""} <color=#ffff00>${CURRENCY_NAMES[currencyKey]}</color>` || '').join("");
    }
console.log("WAIT TIMEOUT",timeout);
    await sleep(timeout);
    container.visible = false;

    function sumAcc(acc, current){
        return acc + current;
    }
}

export const hideNextGameUi = async () => {
    container.visible = false;
    await fadeOutOverlay(1);
}

/*
createOrShowNextGameUi(1,[
    {name:"Player 1", time:[1,1,1,1], shots:[2,4,3,6], score:[1,2,0,0]},
    {name:"Player 2",time:[1,1,1,1], shots:[2,4,3,6], score:[2,3,0,0]}
]);*/