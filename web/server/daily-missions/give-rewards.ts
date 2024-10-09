import {promisify} from "util";
import {PlayFabServer} from "playfab-sdk";
import {sleep} from "../../../common/utils";

export async function giveRewards({PlayFabId, mission}){
    const currencies = Object.keys(mission.rewards);
    let i = currencies.length;
    while(i--){
        console.log(`Giving ${currencies[i]}:${mission.rewards[currencies[i]]} to ${PlayFabId}`)
        await promisify(PlayFabServer.AddUserVirtualCurrency)({
            PlayFabId,
            VirtualCurrency:currencies[i],
            Amount:mission.rewards[currencies[i]]
        });
        await sleep(200);
    }
}