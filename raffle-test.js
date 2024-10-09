function executeRaffle(tickets, prizes, totalTicket){
    let hasPrize = false;
    while(prizes--){
        let winner = Math.floor(Math.random()*(totalTicket - prizes));
        hasPrize = hasPrize || ((tickets-1) >= winner);
    }
    return hasPrize;
}

let executions = 10000000;
let i = executions;
let won = 0;
while(i--){
    if(executeRaffle(6, 6, 59)){
        won++
    }
}
console.log("won",won, (won/executions * 100))