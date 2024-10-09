import {getPlayerTimeBonus, getQualityBonusMultFn} from "../../../../common/resource-bonus";
import {getCourseMaterialRandomDrop} from "../../../../common/course-material-drop-calculator";
import {mapPropertiesMultInt, sleep, sumDrops} from "../../../../common/utils";
import {promisify} from "util";
import {PlayFabServer} from "playfab-sdk";
import fetch from "cross-fetch";
import {
    getParticipantScores,
    getParticipantsOrderByTotalScore,
    getParticipantsTotalScore
} from "../../../../common/tournament-results";
import {getCompleteParticipationsCount, getLastSentRewardPoints} from "../../../common/tournament-creator-report";
import {callDiscordHook} from "../../../../common/discord";
import {handleParticipationsRewards} from "./handle-tournament-organizer-rewards";
const MATERIALS_PLAYFABS = {
    WD:"DCB653CA22218FFB",
    ST:"B9C5095171696CF1",
    IR:"ADC7E078D94EFAD6",
    GD:"E57DEAB3C98BD00A",
    DM:"34779B18A42E9535",
    FT:"270EE04306C4B57D"
}

//TODO dont generate rewards when player and organizer and map creator is the same address.

export async function finishTournament(tournament, prisma){
    const participants:any = (await prisma.tournament_participant.findMany({where:{ID:tournament.ID}}))
        .filter(p => p.address.toLowerCase() !== tournament.organizer.toLowerCase());
    participants.forEach(participant => Object.assign(participant, {
        data:typeof participant.data === "object"
            ? participant.data
            : JSON.parse(participant.data)}));
    for(let participant of participants){
        if(participant?.data?.courseStates?.length === 12 && !participant?.data?.playedAll){
            await prisma.tournament_participant.update({
                where:{ participationID:participant.participationID },
                data:{ playedAll:true }
            });
            participant.data.playedAll = true;
        }
    }


    await prisma.tournaments.update({
        where:{ID:tournament.ID},
        data:{finished:1}
    });
    const courseIds = tournament.courses.split(",");

    const parts = (await prisma.parts.findMany({where:{status:2}})).map(p=>({
        ...p,
        definition:JSON.parse(p.definition),
        boundingBox:JSON.parse(p.boundingBox)
    })).filter(p=>p.alias !== null);
    const summaryDrops = {
        organizer:{WD:0,ST:0,IR:0,GD:0,FT:0,DM:0},
        creator:{WD:0,ST:0,IR:0,GD:0,FT:0,DM:0},
        players:{WD:0,ST:0,IR:0,GD:0,FT:0,DM:0}
    };
    const totalDrops = {WD:0,ST:0,IR:0,GD:0,FT:0,DM:0};
    let i = courseIds.length;
    const courses = await getCourses(courseIds);

    async function getCourses(courseIds){
        let i = courseIds.length;
        const result = [];
        while(i--){
            const courseId = courseIds[i];
            result.push(await prisma.courses.findFirst({where:{alias:courseId}}));
        }
        return result;
    }

    let [organizerPlayFabId, ...creatorPlayFabIds] = await getPlayFabIdFromAddresses([tournament.organizer, ...courses.slice(0,9).map(c=>c.createdBy)]);
    const [creator10, creator11, creator12] = await getPlayFabIdFromAddresses(courses.slice(9,12).map(c=>c.createdBy));
    creatorPlayFabIds = [...creatorPlayFabIds, creator10, creator11, creator12];
    const organizerMaterialsDrop = {WD:0,ST:0,IR:0,GD:0,FT:0,DM:0};
    const allMaterialDrops = {WD:0,ST:0,IR:0,GD:0,FT:0,DM:0};
    const playerTournamentDrops = {};//{[PlayFabId]:{...drops}}
    const mapCreatorPlayFabIdMapDrops = {};

    //TODO creator reward should be reviewed, or for now to depend on participation which are not the organizer
    while(i--){ //i = courses.length
        const course = courses[i];
        const {evaluation, timesAbandoned, timesPlayed,averageTime, isSeason} = course;
        const enoughQuality = getQualityBonusMultFn(1)(timesAbandoned, timesPlayed) >= 0.5;
        const initialMaterialsDrop = await getCourseMaterialRandomDrop(parts, JSON.parse(course.definition), true);

        const currentMapCreatorReward:any = {WD:0,ST:0,IR:0,GD:0,FT:0,DM:0};

        const numberOfPlayers = participants
            .reduce((acc,participant)=>(participant.data.courseStates && participant.data.courseStates[i]?.holeTime)?acc+1:acc,0);
        const materialsDrop:any = mapPropertiesMultInt(initialMaterialsDrop, (evaluation/100)*numberOfPlayers);
        sumDrops(materialsDrop, allMaterialDrops);
        const courseOrganizerMaterialDrops:any = {WD:0,ST:0,IR:0,GD:0,FT:0,DM:0};

        //TODO player drop should not depend on evaluation neither parts,
        //TODO think if to apply a formula where drops for creators depends on global number tournaments played per month/week
        const allPlayersMaterialsDrop:any = mapPropertiesMultInt({WD:54,ST:27,IR:10,GD:5,FT:0,DM:1}, getPlayerTimeBonus(averageTime||0) * numberOfPlayers);

        let p = participants.length;
        console.log(" participants.length", participants.length)
        while(p--){
            const participant = participants[p];
            playerTournamentDrops[participant.playfab] = playerTournamentDrops[participant.playfab] || {WD:0,ST:0,IR:0,GD:0,FT:0,DM:0};
            if(participant?.data?.courseStates[i] && participant?.data?.courseStates[i]?.holeTime){
                const playerDrop:any = mapPropertiesMultInt(allPlayersMaterialsDrop, 1/numberOfPlayers);
                playerDrop.FT++;
                const fWearables = await (promisify(PlayFabServer.GetUserReadOnlyData)({PlayFabId:participant.playfab, Keys:["wearablesBonus"] })).then(d=>{
                    return 1 + (Number(d.data.Data.wearablesBonus?.Value || 0)/100);
                }).then(n => isNaN(n)?1:n);
                sumDrops(mapPropertiesMultInt(playerDrop, fWearables), playerTournamentDrops[participant.playfab]);
            }
            if(participant?.data?.playedAll){
                console.log("course index", i, "playedAll");
                courseOrganizerMaterialDrops.FT += 1;
                currentMapCreatorReward.FT = currentMapCreatorReward.FT || 0;
                currentMapCreatorReward.FT += 2;
                sumDrops(mapPropertiesMultInt(
                    await getCourseMaterialRandomDrop(parts, JSON.parse(course.definition), true, {DM:true, GD:true}),
                    enoughQuality ? 1 : 0.5
                ), currentMapCreatorReward);
                console.log("currentMapCreatorReward",JSON.stringify(currentMapCreatorReward));
            }
        }
        sumDrops(courseOrganizerMaterialDrops, organizerMaterialsDrop);

        const creatorPlayFabId = creatorPlayFabIds[i];

        if(!isSeason){
            // i = courseIndex,
            mapCreatorPlayFabIdMapDrops[creatorPlayFabId] = mapCreatorPlayFabIdMapDrops[creatorPlayFabId] || {WD:0,ST:0,IR:0,GD:0,FT:0,DM:0};
            sumDrops(currentMapCreatorReward, mapCreatorPlayFabIdMapDrops[creatorPlayFabId]);
        }

        //TODO on each map, save the amount of rewards it has generated
        const courseRewards = {WD:0,ST:0,IR:0,GD:0,FT:0,DM:0};
        sumDrops(mapPropertiesMultInt(materialsDrop,0.2), courseRewards);//organizer rewards
        sumDrops(currentMapCreatorReward, courseRewards);
        sumDrops(allPlayersMaterialsDrop, courseRewards);
        const courseAccumulatedRewards = (typeof course.rewards === "string"?JSON.parse(course.rewards):course.rewards)||{WD:0,ST:0,IR:0,GD:0,FT:0,DM:0};
        sumDrops(courseRewards, courseAccumulatedRewards);
        await prisma.courses.update({
            where:{ID:course.ID},
            data:{rewards:JSON.stringify(courseAccumulatedRewards)}
        })
    }
    const playerPlayFabIds = Object.keys(playerTournamentDrops);
    let pp = playerPlayFabIds.length;
    while(pp--){
        const PlayFabId = playerPlayFabIds[pp];
        await giveDropsToPlayFabId(playerTournamentDrops[PlayFabId],PlayFabId, "player");
        sumDrops(playerTournamentDrops[PlayFabId], summaryDrops.players);
        sumDrops(playerTournamentDrops[PlayFabId], totalDrops);
    }
    pp = creatorPlayFabIds.length;
    console.log("giving rewards to map creators")
    while(pp--){
        const PlayFabId = creatorPlayFabIds[pp];
        console.log("giving map creator rewards to ",PlayFabId, mapCreatorPlayFabIdMapDrops[PlayFabId]);
        if(mapCreatorPlayFabIdMapDrops[PlayFabId] && Object.values(mapCreatorPlayFabIdMapDrops[PlayFabId]).some(i=>i)){
            await giveDropsToPlayFabId(mapCreatorPlayFabIdMapDrops[PlayFabId],PlayFabId,"creator");
            sumDrops(mapCreatorPlayFabIdMapDrops[PlayFabId], summaryDrops.creator);
            sumDrops(mapCreatorPlayFabIdMapDrops[PlayFabId], totalDrops);
        }
    }

    sumDrops({...mapPropertiesMultInt(allMaterialDrops, 0.2), DM:0, GD:0, FT:0}, organizerMaterialsDrop);

    if(organizerPlayFabId) await giveDropsToPlayFabId(organizerMaterialsDrop, organizerPlayFabId, "organizer");
    const starsToGive = getStarsToGive(participants);
    console.log("STARS", starsToGive);
    for(let PlayFabId in starsToGive){
        console.log(`STARS: Giving ${starsToGive[PlayFabId]} to ${PlayFabId}`)
        await promisify(PlayFabServer.AddUserVirtualCurrency)({
            PlayFabId,
            VirtualCurrency:"SR",
            Amount:starsToGive[PlayFabId]
        });
        await promisify(PlayFabServer.UpdatePlayerStatistics)({
            PlayFabId,
            Statistics:[{
                StatisticName:"won:SR",
                Value:starsToGive[PlayFabId]
            }]
        });
    }


    sumDrops(organizerMaterialsDrop, summaryDrops.organizer);
    sumDrops(organizerMaterialsDrop, totalDrops);

    notifyDiscordDrops(summaryDrops, tournament, participants);
    handleParticipationsRewards(prisma, {organizer:tournament.organizer.toLowerCase(), organizer_display_name:tournament.organizer_display_name})
    const materialKeys = Object.keys(totalDrops);
    console.log("totalDrops",totalDrops);
    let m = materialKeys.length;
    while(m--){
        const key = materialKeys[m];
        if(totalDrops[key]){
            console.log("updating material statistic", key, MATERIALS_PLAYFABS[key], totalDrops[key]);
            const materialStatisticsResult = await promisify(PlayFabServer.UpdatePlayerStatistics)({
                PlayFabId:MATERIALS_PLAYFABS[key],
                Statistics:[{StatisticName:"materials", Value:totalDrops[key]}]
            });
            console.log("materialStatisticsResult",materialStatisticsResult);
            await sleep(100);
        }
    }

    console.log("updated material statistics", totalDrops);

    function getStarsToGive(participants){
        const result = {};
        const participantsThatPlayed = participants.filter((p)=>p.data?.courseStates?.length >= 11);
        const participantResults = getParticipantsTotalScore(getParticipantScores(participantsThatPlayed));
        const participantsTotalShots = participantsThatPlayed.reduce((acc, participant) => {
            acc[participant.participationID] = participant.data.courseStates.reduce((acc, hole)=>{
                return acc + hole.shoots;
            },0);
            return acc;
        },{});
        const orderedParticipationdsByResult = getParticipantsOrderByTotalScore(participantResults, participantsTotalShots);
        let participationIndex = 0;
        while(participationIndex < orderedParticipationdsByResult.length){
            const starsAmount = orderedParticipationdsByResult.length - participationIndex;
            const participationID=orderedParticipationdsByResult[participationIndex];
            const foundParticipation = participantsThatPlayed.find(p=>p.participationID == participationID);
            if(!foundParticipation){
                console.log("NOT FOUND", participationID);
            }
            result[foundParticipation.playfab] = starsAmount;
            participationIndex++;
        }
        return result;
    }


    async function giveDropsToPlayFabId(drops, PlayFabId, topic?){
        const dropKeys= Object.keys(drops);
        let i = dropKeys.length;
        let str = `Tournamnt ${tournament.code} rewards for: ${PlayFabId} (${topic})`;
        while(i--){
            const materialCode = dropKeys[i];
            if(drops[materialCode]){
                str += ` ${materialCode}:${drops[materialCode]} `;
                await promisify(PlayFabServer.AddUserVirtualCurrency)({
                    PlayFabId,
                    Amount:drops[materialCode],
                    VirtualCurrency:materialCode
                });
            }
        }
        callDiscordPrivate(str);
    }

    function notifyDiscordDrops(summaryDrops, tournament, participants){
        const emojis = {WD:'🪵', ST:'🪨', IR:'⛓', GD:'🥇', FT:'👕', DM:'💎'};
        const participantResults = getParticipantsTotalScore(getParticipantScores(participants));
        const participantsTotalShots = participants.reduce((acc, participant) => {
            acc[participant.participationID] = participant.data.courseStates.reduce((acc, hole)=>{
                return acc + hole.shoots;
            },0);
            return acc;
        },{});
        const orderedParticipantsByResult = getParticipantsOrderByTotalScore(participantResults, participantsTotalShots);
        const resultsStr = orderedParticipantsByResult.map((participationID,index) => {
            const participant = participants.find(p=>p.participationID === Number(participationID));
            if(!participant){
                console.log(participationID, participants);
                return "";
            }
            return `${participant.displayName} : ${participantResults[participationID]}`;
        }).join(`\n`);
        if([
            summaryDrops.organizer.WD,summaryDrops.organizer.ST,summaryDrops.organizer.GD,summaryDrops.organizer.FT,summaryDrops.organizer.DM,
            summaryDrops.creator.WD,summaryDrops.creator.ST,summaryDrops.creator.GD,summaryDrops.creator.FT,summaryDrops.creator.DM,
            summaryDrops.players.WD,summaryDrops.players.ST,summaryDrops.players.GD,summaryDrops.players.FT,summaryDrops.players.DM
        ].some(i=>i)){
            callDiscordPublic(`
    Tournament ${tournament.code} Finished! 
        Resources generated:
            Organizer:
                🪵:${summaryDrops.organizer.WD} 🪨:${summaryDrops.organizer.ST} ⛓:${summaryDrops.organizer.IR} 🥇:${summaryDrops.organizer.GD} 👕:${summaryDrops.organizer.FT} 💎:${summaryDrops.organizer.DM}
            Map Creators:
                🪵:${summaryDrops.creator.WD} 🪨:${summaryDrops.creator.ST} ⛓:${summaryDrops.creator.IR} 🥇:${summaryDrops.creator.GD} 👕:${summaryDrops.creator.FT} 💎:${summaryDrops.creator.DM}
            Players:    
                🪵:${summaryDrops.players.WD} 🪨:${summaryDrops.players.ST} ⛓:${summaryDrops.players.IR} 🥇:${summaryDrops.players.GD} 👕:${summaryDrops.players.FT} 💎:${summaryDrops.players.DM}                
    `+"\n\nRESULTS:\n\n"+resultsStr);
            //TODO get totalParticipation count, it it's
        }
    }

    async function getPlayFabIdFromAddresses(addresses){
        const GenericIDsBody = {
            GenericIDs:[
                ...addresses.map(address => ({
                    ServiceName:"address",
                    UserId:address?.toLowerCase() || "notexists"
                }))
            ]
        }
        return await promisify(PlayFabServer.GetPlayFabIDsFromGenericIDs)(GenericIDsBody).then(r=>r.data.Data.map(d=>d.PlayFabId), (error)=>{
            console.error("error", error, GenericIDsBody);
            return addresses.map(m=>null);
        });
    }
}
async function callDiscordPublic(str){
    await callDiscordHook(str,"https://discord.com/api/webhooks/1009065576817229966/gufYreTUOraoUZJvf43sKi_wr15hqEQ-wnXo1lPlO91THK5q3SLFAb2t-J_1cPRXk54D")
}
async function callDiscordPrivate(str){
    await callDiscordHook(str, "https://discord.com/api/webhooks/993647590421831740/Am5YhymUTewExCEYcZ_eFnUJz_9yNFfFARuuaVa_ABBxSWf3v7W9IME9LIMQMkcX1B6g")
}