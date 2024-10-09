import {promisify} from "util";
import {PlayFabServer} from "playfab-sdk";
import {defaultChestRewardChances, getRandomInt} from "../../common/utils";
import {ChestSchema} from "./GamePlayState";
const HALLOWEEN_WEARABLE_STATISTIC = "wearable:halloween-2022";//TODO make it dynamic set on chest_events table

export async function pushChests({PlayFabId, chestEvent, chestCollection}){
    console.log("pushChests");
    const {data} = await promisify(PlayFabServer.GetLeaderboard)({StatisticName:HALLOWEEN_WEARABLE_STATISTIC, StartPosition:0, MaxResultsCount:100});
    const gottenWearablesByPlayFabId = (data.Leaderboard.find(i=>i.PlayFabId === PlayFabId)?.StatValue || 0);
    const numberOfChests = getRandomInt(chestEvent.minChests || 0, chestEvent.maxChests || 5);

    let i = 0;

    while(i < numberOfChests){
        const x = getRandomInt(2,16*3-2);
        const y = getRandomInt(1,10);
        const z = getRandomInt(2,16*3-2);
        chestCollection.push(new ChestSchema({
            x,y,z,
            wearablesAlready:gottenWearablesByPlayFabId,
            chestRewardChances:(chestEvent.chestRewardChances?.length && chestEvent.chestRewardChances) || defaultChestRewardChances
        }))
        i++;
    }
}