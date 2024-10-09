import {getCompleteParticipationsCount, getLastSentRewardPoints} from "../../../common/tournament-creator-report";
import {callDiscordHook} from "../../../../common/discord";

export async function handleParticipationsRewards(prisma, {organizer, organizer_display_name}){
    const TOURNAMENT_PARTICIPATION_MILESTONES = [
        0,
        100,
        250,
        500,
        1000
    ];
    const completeParticipationsCount = await getCompleteParticipationsCount({organizer, prisma});
    callDiscordHook(`Tournament organizer ${organizer_display_name}: ${completeParticipationsCount} points`, "https://discord.com/api/webhooks/1009065576817229966/gufYreTUOraoUZJvf43sKi_wr15hqEQ-wnXo1lPlO91THK5q3SLFAb2t-J_1cPRXk54D");
    const lastSentRewardPoints = await getLastSentRewardPoints({organizer:organizer.toLowerCase(), prisma});
    const currentParticipationMilestoneIndex = TOURNAMENT_PARTICIPATION_MILESTONES.reduce((acc, current, index)=> completeParticipationsCount >= current ? index:acc, 0);
    const lastSentRewardMilestoneIndex = TOURNAMENT_PARTICIPATION_MILESTONES.reduce((acc, current, index)=> lastSentRewardPoints === current ? index:acc, 0);
    const nextRewardMilestone = TOURNAMENT_PARTICIPATION_MILESTONES[lastSentRewardMilestoneIndex+1];

    console.log("handleParticipationsRewards", organizer_display_name, completeParticipationsCount, lastSentRewardPoints, currentParticipationMilestoneIndex, lastSentRewardMilestoneIndex);
    if(currentParticipationMilestoneIndex > lastSentRewardMilestoneIndex){
        const actionDefinition = {
            address:organizer,
            preKey:"preClaimTournamentOrganizerReward",
            preRevertKey:"preClaimTournamentOrganizerRewardRevert",
            preData:{
                organizer,
                organizer_display_name,
                completeParticipationsCount,
                nextRewardMilestone
            },
            postKey:"notifyTournamentOrganizerReward",
            simulateTx:false,
            contractName:"emotes",
            contractAddress:"0x0ac8a8b8bb1426ee15b6ab1048117d96e4fd66a6",
            contractMethod:"issueTokens",
            contractParams:[[organizer.toLowerCase()], [lastSentRewardMilestoneIndex]]
        }
        try{

            const body = JSON.stringify({
                actionDefinition,
                apiKey:process.env.GOLF_API_KEY
            });
            console.log("queuing tournament participoation rewards ",actionDefinition)
            await fetch("https://golfcraftgame.com/bridge/queue-action",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body
            });
        }catch(error){
            console.error(error);
        }

    }

    return {
        completeParticipationsCount,
        lastSentRewardPoints,
        currentParticipationMilestoneIndex,
        lastSentRewardMilestoneIndex,
        nextRewardMilestone
    }
}