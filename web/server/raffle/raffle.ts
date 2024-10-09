import seedrandom = require('seedrandom');

type Tickets = {
    [ID:string]:number
};

export const raffle = (seed:string, prizes:number, tickets:Tickets) => {
    let random = seedrandom(seed, {});
    const winners = [];
    const scores = Object.keys(tickets).map(a=>({name:a,score:tickets[a]}));

    let names = scores
        .reduce((acc,current) => [...acc, ...new Array(current.score).fill(current.name)], [])
        .sort((a,b)=>a.localeCompare(b));

    let i = prizes;

    while(i--){
        const winnerIndex = Math.floor(random() * names.length);
        const winnerName = names[winnerIndex];

        winners.push(winnerName);
        names = names.filter(name=>name!==winnerName);
    }

    return winners;
}