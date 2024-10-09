require("dotenv").config();

if(!process.env.PLAYFAB_SECRET_KEY || !process.env.PLAYFAB_TITLE_ID){
    throw Error("missing env PLAYFAB_SECRET_KEY")
}
const {promisify} = require("util")
const PlayFabServer = require('playfab-sdk/Scripts/PlayFab/PlayFabServer');
const fs = require("fs");

const myArgs = process.argv.slice(2);
let Version = myArgs?.length && (myArgs[0]) || undefined;

PlayFabServer.settings.titleId = process.env.PLAYFAB_TITLE_ID;
PlayFabServer.settings["DeveloperSecretKey"] = PlayFabServer.settings.developerSecretKey = process.env.PLAYFAB_SECRET_KEY;

(async ()=> {
    console.log("requesting leaderboard for version", Version)
    const {Leaderboard} = await promisify(PlayFabServer.GetLeaderboard)({
        StatisticName:"competition_points_event_hour",
        StartPosition:0,
        MaxResultsCount:100,
        Version
    }).then(r=>r.data, (err) => {
        console.error(JSON.stringify(err));
        process.exit(1);
    });
    console.log("Leaderboard.length", Leaderboard.length)
    console.log("------------------");
    const PlayFabIds = Leaderboard.map(i=>i.PlayFabId);
    const addresses = [];
    let i = 0;
        while(i < PlayFabIds.length){
        const {Data} = await promisify(PlayFabServer.GetUserData)({
            PlayFabId:PlayFabIds[i],
            Keys:["address"]
        }).then(r=>r.data)
        
        console.log(`${Leaderboard[i].DisplayName} ${Leaderboard[i].PlayFabId} ${Data.address.Value}`)
        addresses.push(Data.address.Value); 
        await sleep(50);
        i++;
    }
    console.log("addresses\n",addresses.join("\n"))
    fs.writeFileSync('addresses.log', addresses.join("\n"), "utf8");
    

})();

async function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}