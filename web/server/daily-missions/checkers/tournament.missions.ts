export const playTournamentTimesFn = (times) => async ({PlayFabId, mission, dailyMissions, prisma, event, userData}) => {
    console.log("mission playTournamentTimesFn "+times);
    const competitionsToday = await prisma.player_game.findMany({
        where:{
            endTime:{gte:dailyMissions.date},
            PlayFabId,
            gameMode:"tournament"
        }
    });
    return competitionsToday?.length >= times;
}

export const finishedTournamentFn = (times) => async ({PlayFabId, mission, dailyMissions, prisma, event, userData}) => {
    const lastTournamentGames = await prisma.player_game.findMany({
        where:{
            PlayFabId,
            gameMode: "tournament",
            endTime:{gte:dailyMissions.date}
        },
        "orderBy": {"ID": "desc"}
    });
    const lastTourneyGamesMap = lastTournamentGames.reduce((acc,g)=>{
        const data = JSON.parse(g.data);
        if(data.playedMaps >= 12){
            acc[data.tournamentID] = true;
        }
        return acc;
    },{});
    console.log("lastTourneyGamesMap", JSON.stringify(lastTourneyGamesMap));
    const tournaments = Object.keys(lastTourneyGamesMap)?.length || 0;
    if( tournaments >= times) return true;
    if( tournaments != (userData.dailyMissionStep||0)) return {step:tournaments};
    return false;
}

export const createTournament4Players = async ({PlayFabId, mission, dailyMissions, prisma, event})=>{
    //TODO
}

let PlayFabIdAddressMap = {};
async function getAddressFromPlayFabId({PlayFabId}){

}