
function getQualityBonusMultFn(mult){
    const _mult = mult || 1;
    return function getQualityBonus(timesAbandoned, timesPlayed){
        if(!timesPlayed) return 1;
        return Math.max(
            Math.abs(1-Math.min(1,
                timesAbandoned*_mult/timesPlayed
            )),
            0.1
        );
    }
}

function getTimeBonus(timeAverage){
    const points = [30,120,180,250];
    const [a1,a2,a3,a4] = points;
    if(timeAverage <= a1) return 0;
    if(timeAverage <= a2) return (timeAverage - a1) / (a2 - a1);
    if(timeAverage <= a3) return 1;
    if(timeAverage <= a4) return (a4 - timeAverage) / (a4 - a3);
    return 0;
}

function getFadeInMult(timesPlayed){
    var a1 = 0; var a2 = 100;
    if(!timesPlayed) return 0.1;
    return Math.min(1, (timesPlayed - a1)/(a2-a1));
}

const samples = [
    //abandoned, played, time
    [1,1,5],
    [0,1,5],
    [1,10,5],
    [40,50,5],
    [5,50,5],
    [5,50,40],
    [0,1,150],
    [0,100,100],
    [0,100,150],
    [0,100,250],
    [1,100,150],

    [10,100,150],
    [20,100,150],
    [30,100,150],
    [60,100,150],

    [0,100,5],
    [10,100,5],
    [20,100,5],
    [30,100,5],
    [60,100,5],
];

function getFinalMaterials (abandoned, played, time, materials) {
    const result = materials
        + (((materials * getQualityBonusMultFn(1)(abandoned, played)) + (materials * getTimeBonus(time))) * getFadeInMult(played));
    return Math.floor(result);
}

function getFinalMaterials2 (abandoned, played, time, materials) {
    const result = ((materials*getFadeInMult(played)/3) + (materials*getTimeBonus(time))/2)  * getQualityBonusMultFn(2)(abandoned, played);
    return Math.floor(result);
}
function getFinalMaterials3 (abandoned, played, time, materials) {
    const result = (
            materials + (materials * getFadeInMult(played)/2) +(materials*6*getTimeBonus(time))
        ) * getQualityBonusMultFn(4)(abandoned, played)
        + (materials * getFadeInMult(played)/4)
        + (materials*getTimeBonus(time)) ;
    return Math.floor(result/2);
}
const functions = [getFinalMaterials, getFinalMaterials2, getFinalMaterials3];

functions.forEach((fn)=>{
    console.log(`\n\n\n${fn.name}\t abandoned \t played \t time \n--------------------------`);
    console.log(getSamplesResults(samples, fn))
})

function getSamplesResults(samples, fn){
    return samples.map(sample => {
        const [abandoned, played, time, materials] = sample;
        const abandonedStr = `${abandoned}`.padEnd(10);
        const playedStr = `${played} (${getFadeInMult(played).toString().slice(0,3)})`.padEnd(13);
        const timeStr = `${time} (${getTimeBonus(time).toString().slice(0,3)})`.padEnd(10);
        let str = `      \t\t\t\t ${abandonedStr} ${playedStr}${timeStr}`;
        str += `\t\t${fn(abandoned, played, time, 100)}%`;
        return str;
    }).join(`\n\n`)
}

