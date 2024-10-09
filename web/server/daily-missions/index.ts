import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();
import fs = require("fs");
import {deserializeRecipe, getRandomInt} from "../../../common/utils";
import {callDiscordHook} from "../../../common/discord";
import {PlayFab, PlayFabServer} from "playfab-sdk";
import {promisify} from "util";
import missionCheckers from "./checkers/mission-checkers";
import {giveRewards} from "./give-rewards";
const MISSIONS_JSON_FILE = `.daily-missions.json`;
const MINUTE = 1000*60;
const HOUR = MINUTE*60;
const RENEW_CHECK_INTERVAL = MINUTE*10;
const HOURS24 = HOUR*24;//1000*60*60*24;

if(!fs.existsSync(MISSIONS_JSON_FILE)){
    fs.writeFileSync(MISSIONS_JSON_FILE, JSON.stringify({}), "utf8");
}
export async function dailyMissionsApi(router, PROD){
    const missionCollection = await prisma.daily_missions.findMany();
    let state:{missions:any[], date:string, missionLevels:number[], missionCollection:any[]} = {
        missionLevels:Array.from(new Set(missionCollection.map(m=>m.difficulty))).sort((a,b)=>a-b),
        missionCollection,
        ...JSON.parse(fs.readFileSync(MISSIONS_JSON_FILE,'utf8'))
    };
    if(!state.missions?.length){
        console.log("RENEWING MISSIONS")
        await renewMissions();
    }
    console.log("daily-missions state",state);

    router.get(`/api/leaderboard/:StatisticName/:page`, async (req, res) => {
        try{
            const {page, StatisticName} = req.params;
            const list = await promisify(PlayFabServer.GetLeaderboard)({
                StatisticName,
                MaxResultsCount:page*100,
                StartPosition:(page-1)*100
            }).then(r=>r.data.Leaderboard);
            return res.send(
                list.map(({PlayFabId, DisplayName, StatValue}) => {
                    return `${StatValue} ${PlayFabId} ${DisplayName}`;
                }).join('<br>')
            );
        }catch(e){
            return res.send({});
        }

    });

    router.post(`/api/check-npc-mission`, async(req, res)=>{
        const {PlayFabId} = req.body;
        let current_mission = await promisify(PlayFabServer.GetPlayerStatistics)
            ({PlayFabId, StatisticNames:["current_mission"]})
            .then(r=>r.data?.Statistics[0]?.Value || 0);

        if(current_mission === 7){
            const UserInventory = await promisify(PlayFabServer.GetUserInventory)({PlayFabId}).then(r=>r.data.Inventory);
            const golfclub = UserInventory.find(i=>i.ItemId === "golfclub-1");
            const aim = Number(golfclub?.CustomData?.attribute_aim||0);
            if(aim > 0 || !golfclub?.CustomData?.xp || !Number(golfclub?.CustomData?.xp)){
                current_mission = 8;
                await promisify(PlayFabServer.UpdatePlayerStatistics)({PlayFabId, Statistics:[{StatisticName:"current_mission", Value:current_mission}]})
            }
        }else if(current_mission === 8){
            let tierSubMax = await promisify(PlayFabServer.GetPlayerStatistics)
            ({PlayFabId, StatisticNames:["tier-sub-max"]})
                .then(r=>r.data?.Statistics[0]?.Value || 0);
            if(tierSubMax >= 25){
                current_mission = 9;
                await promisify(PlayFabServer.UpdatePlayerStatistics)({PlayFabId, Statistics:[{StatisticName:"current_mission", Value:current_mission}]})
            }
        }
        return res.send({current_mission});
    });

    router.post(`/api/event`, async (req, res) => {
        //TODO protect with apiKey

        const {data, type} = req.body;
        if(!data || !type){
            console.log("/api/event Missing event type or data");
            return res.status(500).send({error:"Missing event type or data"});
        }
        const {PlayFabId} = data;
        if(!PlayFabId){
            console.log("/api/event Missing PlayFabId");
            return res.status(500).send({error:"Missing PlayFabId"});
        }

        let {userDailyMissionIndex, userDailyMissionDate, userDailyMissionStep} = await handleAndGetUserDailyMissionData({PlayFabId});

        const userCurrentMission = state.missions[userDailyMissionIndex];
        if(userCurrentMission && ~userCurrentMission?.events?.indexOf(type)){
            const missionChecker = missionCheckers[userCurrentMission.alias];
            if(!missionChecker){
                console.log("MISSING MISSION CHECKER", userCurrentMission?.alias);
                return res.status(500).send({error:"MISSING MISSION "+userCurrentMission?.alias})
            }

            const missionCheckResult = await missionChecker({
                PlayFabId,
                mission:userCurrentMission,
                dailyMissions:state,
                prisma,
                event:{data,type},
                userData:{dailyMissionIndex:userDailyMissionIndex, dailyMissionDate:userDailyMissionDate, dailyMissionStep:userDailyMissionStep}
            });

            if(missionCheckResult?.step){
                console.log(`Mission step for ${PlayFabId} ${JSON.stringify(missionCheckResult)}`)
                await promisify(PlayFabServer.UpdateUserReadOnlyData)({Data:{
                        dailyMissionStep:missionCheckResult.step.toString(),
                    }, PlayFabId, Permission:"private"});
            }else if(missionCheckResult === true){
                console.log("giving mission rewards to " + PlayFabId + ` ${data.displayName}`);
                //TODO review this, to maybe create a queue, this calls to PlayFab are so slow to retain the http request open
                await giveRewards({PlayFabId, mission:userCurrentMission});
                userDailyMissionIndex = userDailyMissionIndex+1;
                userDailyMissionStep = 0;
                userDailyMissionDate = new Date();

                try{
                    console.log("Mission complete, updating next mission",userDailyMissionIndex,userDailyMissionDate)
                    await promisify(PlayFabServer.UpdateUserReadOnlyData)({Data:{
                            dailyMissionIndex:userDailyMissionIndex.toString(),
                            dailyMissionDate:userDailyMissionDate.toISOString(),
                            dailyMissionStep:userDailyMissionStep.toString()
                        }, PlayFabId, Permission:"private"});
                    if(userDailyMissionIndex === state.missions.length){
                        console.log(`User ${data.displayName} completed all daily missions`);
                        let displayName = data.displayName;
                        if(!data.displayName){
                            displayName = await promisify(PlayFabServer.GetUserAccountInfo)({PlayFabId}).then(r => r?.data?.UserInfo?.TitleInfo?.DisplayName);
                            callDiscordMissions(`Congrats ${displayName} for completing all daily missions 🙌`);
                        }

                        await prisma.raffle.create({
                            data:{
                                PlayFabId,
                                created:new Date().toISOString(),
                                displayName
                            }
                        });
                    }
                }catch(error){
                    console.log("error updating user daily-mission data", PlayFabId)
                }
            }else{
                console.log("mission checked false for ", !!missionChecker, missionChecker.name, PlayFabId, missionCheckResult )
            }
        }else{
            console.log("not matched mission for event "+type+" on mission index "+userDailyMissionIndex, PlayFabId);
        }
        return res.send({ok:true});
    });

    router.get(`/api/get-daily-missions/:PlayFabId`, async (req,res)=>{
        const {PlayFabId} = req.params;
        const {userDailyMissionIndex, userDailyMissionDate, userDailyMissionStep} = await handleAndGetUserDailyMissionData({PlayFabId});

        res.send({state,dailyMissionIndex:userDailyMissionIndex, dailyMissionDate:userDailyMissionDate, dailyMissionStep:userDailyMissionStep});
    });

    if(PROD){
        setInterval(async ()=>{
            if((new Date(state.date).getTime() + HOURS24) < Date.now()){
                console.log("renewing missions");
                await renewMissions();
                console.log("renewed missions");
                callDiscordMissions(`**New missions available:**\n\n${state.missions.map((m,i)=>`${i+1} - ${m.description}`).join("\n")}`);
            }
        }, RENEW_CHECK_INTERVAL);
    }

    async function handleAndGetUserDailyMissionData({PlayFabId}){
        console.log("handleAndGetUserDailyMissionData", PlayFabId);
        if(!PlayFabId){
            console.log("missing PlayFabId", PlayFabId);
            return;
        }
        const userData = await promisify(PlayFabServer.GetUserReadOnlyData)({PlayFabId, Keys:["dailyMissionIndex", "dailyMissionDate", "dailyMissionStep"]}).then(r=>{
            return r.data.Data
        });
        let userDailyMissionIndex = userData?.dailyMissionIndex?.Value ? Number(userData.dailyMissionIndex.Value) : 0;
        let userDailyMissionStep = userData?.dailyMissionStep?.Value ? Number(userData.dailyMissionStep.Value) : 0;
        let userDailyMissionDate = userData?.dailyMissionDate?.Value ? new Date(userData.dailyMissionDate.Value) : new Date();

        if((state.date > userDailyMissionDate.toISOString()) || !userData?.dailyMissionDate?.Value){
            userDailyMissionIndex = 0;
            userDailyMissionDate = new Date();
            userDailyMissionStep = 0;
            const Data = {
                dailyMissionIndex:userDailyMissionIndex.toString(),
                dailyMissionDate:userDailyMissionDate.toISOString(),
                dailyMissionStep:userDailyMissionStep.toString()
            }
            try{
                await promisify(PlayFabServer.UpdateUserReadOnlyData)({PlayFabId, Permission:"Private",Data});
            }catch (error){
                console.log("handleAndGetUserDailyMissionData UpdateUserReadOnlyData error",error, Data);
            }

        }
        return {userDailyMissionIndex, userDailyMissionDate, userDailyMissionStep} as {userDailyMissionIndex:number, userDailyMissionDate:Date, userDailyMissionStep:number }
    }

    async function getDailyMissions(){
        const missionCollection = await prisma.daily_missions.findMany({where: {
                "OR":[{"disabled":null},{"disabled":0}]
            }});
        state.missionCollection = missionCollection;
        state.missionLevels = Array.from(new Set(missionCollection.map(m=>m.difficulty))).sort((a,b)=>a-b);

        return state.missionLevels.map(level => {
            const levelMissions = missionCollection.filter(m=>m.difficulty === level);
            const selectedMission = levelMissions[getRandomInt(0,levelMissions.length-1)];
            return {
                ...selectedMission,
                events:selectedMission.events.split(","),
                rewards:deserializeRecipe(selectedMission.rewards)
            };
        })
    }

    async function renewMissions(){
        Object.assign(state, {
            missions:await getDailyMissions(),
            date:new Date().toISOString()
        });

        console.log("MISSIONS", JSON.stringify(state, null, "  "));

        writeStateToFile();
    }

    function writeStateToFile(){
        fs.writeFileSync(MISSIONS_JSON_FILE, JSON.stringify(state), 'utf8');
    }

    function callDiscordMissions(str){
        callDiscordHook(str,"https://discord.com/api/webhooks/1014142966220201984/RASfP-jItLI-94LxVbFKP17i0DSdjgNeRSK_nqDCXg81DwugdZInu0RkTa8dk4ep5VFd")
    }
}