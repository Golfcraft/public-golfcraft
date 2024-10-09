import wearables from "./cocobay-wearables.json";
import {getSubFromName} from "../../../common/utils";



wearables.forEach((wearable:any)=>{
    const tierSub = getSubFromName(wearable.tierRewardName);
    wearable.tierReward = tierSub;
    const wId = wearable.name.toLowerCase().replace(/\s/g,"_").replace("golfcraft_x_","");
    wearable.wId = wId;

    console.log(wId)
});

console.log(JSON.stringify(wearables))
//TOOD get the list of the 20 tierReward