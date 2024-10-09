const fs = require("fs");
const catalog = JSON.parse(fs.readFileSync("catalog.json", "utf8"));

console.log(getPrizeDropRates(catalog));

module.exports = {
    getPrizeDropRates
};


function getPrizeDropRates(catalog){
    const result = [];
    const crates = Object.keys(catalog);

    crates.forEach(crate => {
        const prizeNames = Object.keys(catalog[crate].subcrates);
        const totalWeight = Object.values(catalog[crate].subcrates).reduce((acc, prize)=>{
            return acc + prize.weight;
        },0);
    
        prizeNames.forEach(prizeName => {
            const prize= catalog[crate].subcrates[prizeName];
            console.log(`  ${prizeName} - ${prize.weight} - ${ (prize.weight * 100 / totalWeight).toFixed(2) }%`)
            result.push({
                name:prize.name,
                weight:prize.weight,
                rate: Number((prize.weight * 100 / totalWeight).toFixed(2))
            });
        });
    });
  
    return result;
}