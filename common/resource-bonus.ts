import {callDiscordHook} from "./discord";

export function getQualityBonusMultFn(mult){
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
    const points = [45,120,180,250];
    const [a1,a2,a3,a4] = points;
    if(timeAverage <= a1) return 0;
    if(timeAverage <= a2) return (timeAverage - a1) / (a2 - a1);
    if(timeAverage <= a3) return 1;
    if(timeAverage <= a4) return (a4 - timeAverage) / (a4 - a3);
    return 0;
}

function getFadeInMult(timesPlayed){
    var a1 = 0; var a2 = 100;
    if(!timesPlayed) return 0;
    return Math.min(1, (timesPlayed - a1)/(a2-a1));
}

function getFadeInMult2(timesPlayed){
    var a1 = 100; var a2 = 200;
    if(!timesPlayed) return 0;
    return Math.max(0, Math.min(1, (timesPlayed - a1)/(a2-a1)));
}

function getFadeInMult3(timesPlayed){
    var a1 = 200; var a2 = 300;
    if(!timesPlayed) return 0;
    return Math.max(0, Math.min(1, (timesPlayed - a1)/(a2-a1)));
}

export function getBonusByAreaShoots(area, shoots){
    const MAX_SCORE = 50;

    return Math.max(0, Math.min((area/shoots)/5, MAX_SCORE));
}

export function getBonusByDistanceShoots(distance, shoots){
    const MAX_SCORE = 50;
    return Math.max(0, Math.min((distance/shoots)*2, MAX_SCORE));
}


export function getFinalMaterials (abandoned, played, time) {
    const scale = 100;
    const result = (
            scale + (scale * getFadeInMult(played)/2) +(scale*6*getTimeBonus(time))
        ) * getQualityBonusMultFn(4)(abandoned, played)
        + (scale * getFadeInMult(played)/4)
        + (scale * getTimeBonus(time)) ;
    return (result/2)/100;
}

export function getPlayerTimeBonus(averageTime){
    return Math.min(2.5, Math.max(1, (averageTime/60)* 3/5));
}

function getPartTypesBonus(partTypes){
    return Math.floor((partTypes||[]).length * 1.7);
}

export function getFinalMaterials2 (abandoned, played, time, area= 0, shoots, distance, partTypes) {
    const _100 = 100;
    const bonusByArea = getBonusByAreaShoots(area, shoots);
    const bonusByDistanceShoots = getBonusByDistanceShoots(area, shoots);
    const qualityBonus = getQualityBonusMultFn(5)(abandoned, played);
    const calculatedQualityBonus = (
        _100 + (_100 * getFadeInMult(played)/2) +(_100*6*getTimeBonus(time))
    ) * qualityBonus;
    const partTypesBonus = getPartTypesBonus(partTypes);

    const result = calculatedQualityBonus
        + (_100 * getFadeInMult(played) / 4)
        + (_100 * getFadeInMult2(played) / 8)
        + (_100 * getFadeInMult3(played) / 16)
        + (_100 * getTimeBonus(time) / 2)
        + partTypesBonus
        + bonusByArea
        + bonusByDistanceShoots;

    callDiscordHook(`
        played/abandoned bonus:${qualityBonus}
        calculated bonus: ${calculatedQualityBonus}
        bonusByArea: ${bonusByArea}
        bonusByAreaShoots: ${bonusByDistanceShoots}
        partTypesBonus: ${partTypesBonus}
        
        area:${area}
        shots:${shoots}
        abandoned:${abandoned}
        played:${played}
        partTypes:${partTypes.length}
        
        getFadeInMult:${(_100 * getFadeInMult(played) / 4)}
        getFadeInMult2:${(_100 * getFadeInMult2(played) / 8)}
        getFadeInMult3:${(_100 * getFadeInMult3(played) / 16)}
        
        result:${result}
    `)
    return (result/2)/100;
}