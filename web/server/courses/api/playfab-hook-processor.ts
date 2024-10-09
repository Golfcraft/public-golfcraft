import {PlayFabServer} from "playfab-sdk";
import {promisify} from "util";
import {callDiscordHook} from "../../../../common/discord";

export async function processHookRequest(req){
    if(req.body.EventName === "title_statistic_version_changed"){
        return await processStatisticVersionChange(req);
    }
}

async function processStatisticVersionChange(req){
    const {StatisticName, StatisticVersion} = req.body;
     if(StatisticName === `competition_points_event_hour`){
        const result = await promisify(PlayFabServer.GetLeaderboard)({
            StartPosition:0,
            MaxResultsCount:10,
            StatisticName,
            Version:StatisticVersion-1
        }).then(r=>r.data);
        const {Leaderboard} = result;
        const str = `Hourly TOP 10 result

${Leaderboard.map(l=>`${l.DisplayName} - ${l.StatValue}`).join(`\n`)}


        `;

        callDiscordPublicLeaderboard(str);

        return result;
    }
}

async function callDiscordPublicLeaderboard(str){
    await callDiscordHook(str,"https://discord.com/api/webhooks/1013779369350672445/YAhspdt_5JTl-n50o0MUEx1QPwbR71eIrNzWUd-Tcl_sBLTvz4F9sukSL2uzbBKRFKCx")
}