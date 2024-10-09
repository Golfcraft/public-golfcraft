import {sleep} from "../../../common/utils";

require("dotenv").config();
import leaderboardData from "./resources/leaderboard-xmax-wearable-2023.json";
import {PlayFabServer} from "playfab-sdk";
import {promisify} from "util";
import * as fs from "fs";

PlayFabServer.settings.titleId = process.env.PLAYFAB_TITLE_ID;
PlayFabServer.settings["DeveloperSecretKey"] = PlayFabServer.settings.developerSecretKey = process.env.PLAYFAB_SECRET_KEY;
console.log("process.env.PLAYFAB_SECRET_KEY",!!process.env.PLAYFAB_SECRET_KEY);
const DATA_FILE = "./resources/list.json";
const fsData = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
console.log("leaderboardData",leaderboardData);
(async()=>{
    try{
        const playfabAddressMap:any = {};
        let result = [];
        let i = leaderboardData.length;
        while(i--){
            const current = leaderboardData[i];
       //     if(current.Value < 20 || fsData[current.PlayerId]) continue;
            console.log("current",current)
            const PlayFabId = current.PlayerId;
            await sleep(100);
            const address = (await promisify(PlayFabServer.GetUserData)({PlayFabId, Keys:["address"]})).data.Data.address.Value;
            console.log("address",address)
            result = [...result, ...new Array(current.Value).fill(address)];
            fsData[PlayFabId] = {...current, address};
            fs.writeFileSync(DATA_FILE, JSON.stringify(fsData, null, "  "), "utf8");
        }

        console.log("RESULT:\n\n", `[${result.join(",")}]\n\n[${result.map(i=>0)}]`);
    }catch(error){
        console.log("error",error)
    }


})();
