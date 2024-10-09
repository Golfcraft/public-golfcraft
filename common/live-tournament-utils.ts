export function getTotalResultsText(state){
    const sortedTotalResultPerPlayer = getTotalResults(state);
    const completedMaps = state.courseResults.reduce((acc,current)=>current.completed?acc+1:acc,0);
    const currentCourseResults = getCoursePlayerResults({players:state.players, courseResult:state.courseResults[completedMaps-1]});
    const title = `Maps completed: ${completedMaps}\n\n`;
    let resultText = `${title}Rank\t\tScore\tPlayer name\n`;
    resultText += sortedTotalResultPerPlayer.map((p, index)=>{
        return `#${(index+1).toString().padStart(2,"0")}\t\t${p.totalScore.toString().padStart(2,"0")}\t\t${p.displayName}\t\t(+${currentCourseResults.find(cp=>cp.address === p.address).courseScore})`;
    }).join("\n");
    return resultText;
}
export function getCoursePlayerResults({players, courseResult}){
    const playerResults = players.map((p, playerIndex)=>({
        address:p.address,
        displayName:p.displayName,
        courseScore:0,
        shots:courseResult.playersShots[playerIndex],
        time:0,
        playerIndex
    }));

    courseResult.playersShots.forEach(({shots}, playerIndex)=>{
        playerResults[playerIndex].shots = shots;
        playerResults[playerIndex].time = courseResult.playersTime[playerIndex];
    });

    const sortedPlayers = playerResults.sort((a,b) => {
        if(a.time && !b.time) return -1;
        if(b.time && !a.time) return 1;
        if(a.shots === b.shots) return a.time - b.time;
        return a.shots - b.shots;
    });
    console.log("sortedPlayers", sortedPlayers.map(s=>s?.displayName||"_x_").join(","))
    sortedPlayers.forEach((s, index) => {

        s.courseScore = s.time ? (sortedPlayers.length - index) : 0;
        console.log(`${s.displayName} courseScore:${s.courseScore}, sortedPlayers.length:${sortedPlayers.length}, index:${index}`)
    });

    return sortedPlayers;
}

export function getTotalResults(state){
    const coursePlayerResults = state.courseResults.map((courseResult) => getCoursePlayerResults({players:state.players, courseResult}));
    console.log("coursePlayerResults",coursePlayerResults)
    const playerTotalResults = state.players.map((p, playerIndex)=>({
        address:p.address,
        displayName:p.displayName,
        totalScore:0,
        playerIndex
    }));

    coursePlayerResults.forEach((courseResultsPerPlayer)=>{
        courseResultsPerPlayer.forEach((playerResult)=>{
            playerTotalResults[playerResult.playerIndex].totalScore += playerResult.courseScore;
        });
    })

    const sortedTotalResultPerPlayer = playerTotalResults.sort((a,b)=>{
        return b.totalScore - a.totalScore;
    });

    return sortedTotalResultPerPlayer;
}