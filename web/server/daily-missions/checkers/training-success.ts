export const trainingSuccess = async ({PlayFabId, mission, dailyMissions, prisma, event, userData})=>{
    console.log("mission trainingSuccess");
    return true;
};

export const trainingSuccessAllModes = async ({PlayFabId, mission, dailyMissions, prisma, event, userData}) => {
    console.log("mission trainingSuccessAllModes");
    const trainingsToday = await prisma.player_game.findMany({
        where:{
            endTime:{gte:dailyMissions.date},
            PlayFabId,
            gameMode:"training"
        }
    });
    const modesPlayed = trainingsToday.reduce((acc,current)=>{
        acc[current.subType] = true
        return acc;
    },{"1":false,"2":false,"3":false,"4":false});

    const modesCompleted = Object.values(modesPlayed).filter(a=>a).length;
    console.log("modesCompleted", modesCompleted);
    if(modesCompleted === 4) return true;
    if(modesCompleted === 0) return false;
    if(userData.dailyMissionStep !== modesCompleted){
        return {step:modesCompleted};
    }
}

export const trainingSuccessSubTypeFn = (subType) => async ({PlayFabId, mission, dailyMissions, prisma, event, userData}) => {
    console.log("mission trainingSuccessSubTypeFn "+subType);
    //TODO we can just check the event.data.subType instead of asking database
    const where = {
        endTime:{gte:dailyMissions.date},
        PlayFabId,
        gameMode:"training"
    };
    const trainingsToday = await prisma.player_game.findMany({
        where
    });
    console.log("trainingsToday ",trainingsToday.length,"\n",trainingsToday.map(t=>`${t.course_alias} ${t.subType}`).join("\n"));
    return !!trainingsToday.find(training => training.subType === subType)
}