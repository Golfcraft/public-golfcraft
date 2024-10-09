export const playSeasonTimesFn = (times) => async ({PlayFabId, mission, dailyMissions, prisma, event, userData}) => {
    const gamesToday = await prisma.player_game.findMany({
        where:{
            endTime:{gte:dailyMissions.date},
            PlayFabId,
            gameMode:"season"
        }
    });
    const {dailyMissionStep} = userData;
    if(gamesToday?.length >= times) return true;
    if(gamesToday?.length === dailyMissionStep) return false;
    if(gamesToday?.length) return {step:gamesToday?.length};
}