export function getParticipantScores(participants){ //returns {[ID]:[]12}
    const result = {};
    let holeIndex = 0;

    while(holeIndex < 12){
        const holeParticipants = [...participants].sort((a,b)=>{
            const aHoles =  a.data?.courseStates
            const bHoles =  b.data?.courseStates;
            if(isMissingHole(aHoles, holeIndex) && !isMissingHole(bHoles, holeIndex)) return +1;
            if(!isMissingHole(aHoles, holeIndex) && isMissingHole(bHoles, holeIndex)) return -1;
            if(isMissingHole(aHoles, holeIndex) && isMissingHole(bHoles, holeIndex)) return 0;
            const aHole = aHoles[holeIndex];
            const bHole = bHoles[holeIndex];
            if(aHole.shoots === bHole.shoots){
                return holeDuration(aHole) - holeDuration(bHole);
            }
            return aHole.shoots - bHole.shoots;
        });
        holeParticipants.forEach((participant, index)=>{
            result[participant.participationID] = result[participant.participationID] || [];
            const holeTime = participant.data?.courseStates[holeIndex] && participant.data?.courseStates[holeIndex].holeTime;
            const holeResult = holeTime ? (holeParticipants.length - index) : ( participant.data?.courseStates[holeIndex] ? 1 : 0 );
            result[participant.participationID].push(
                holeResult
            );
        });

        holeIndex++;
    }
    return result;

    function holeDuration(hole){
        return hole.holeTime - hole.startTime;
    }
    function isMissingHole(holes, holeIndex){
        return !holes || !holes[holeIndex] || !holes[holeIndex].holeTime;
    }
}

export function getParticipantsTotalScore(participantScores){
    return Object.keys(participantScores).reduce((acc, participationID)=>{
        acc[participationID] = participantScores[participationID].reduce((acc,current)=>acc+current,0);
        return acc;
    },{});
}

export function getParticipantsOrderByTotalScore(participantTotalScores, participantTotalShots){
    return Object.keys(participantTotalScores).sort((a,b)=>{
        return (participantTotalScores[b]*1000- participantTotalShots[b]) - (participantTotalScores[a]*1000 - participantTotalShots[a]);
    })
}
