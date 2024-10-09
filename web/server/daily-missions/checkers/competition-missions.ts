export const playCompetition = async ({PlayFabId, mission, dailyMissions, prisma, event, userData})=>{
    console.log("mission playCompetition");
    return true;
};

export const playCompetitionTimesFn = (times) => async ({PlayFabId, mission, dailyMissions, prisma, event, userData}) => {
    console.log("mission playCompetition Times "+times);
    const competitionsToday = await prisma.player_game.findMany({
        where:{
            endTime:{gte:dailyMissions.date},
            PlayFabId,
            gameMode:"competition"
        }
    });
    const {dailyMissionStep} = userData;
    if(competitionsToday?.length >= times) return true;
    if(competitionsToday?.length === dailyMissionStep) return false;
    if(competitionsToday?.length) return {step:competitionsToday?.length};
}
