export async function getCompleteParticipationsCount({organizer, prisma}){
    let completeParticipationsCount = 0;
    const tournaments = await prisma.tournaments.findMany({where:{organizer:organizer.toLowerCase()}});
    for(let tournament of tournaments){
        const completeParticipations = (await prisma.tournament_participant.findMany({where:{
                ID:tournament.ID,
                NOT:{
                    address:organizer
                }
            }})).filter(i=>i.playedAll);
        completeParticipationsCount += (completeParticipations?.length||0)
    }

    const liveTournamentParticipationsQueryResult = await prisma.live_tournament_participations.findMany({where:{
            organizer:organizer.toLowerCase()
        }});
    completeParticipationsCount += (liveTournamentParticipationsQueryResult[0]?.points||0);

    return completeParticipationsCount;
}

export async function getLastSentRewardPoints({organizer, prisma}){
    const tournamentOrganizerReward = await prisma.tournament_organizer_reward.findFirst({
        where:{organizer:organizer.toLowerCase()}
    });
    console.log("tournamentOrganizerReward",tournamentOrganizerReward)
    return tournamentOrganizerReward?.points || 0;
}