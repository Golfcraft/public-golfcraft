import {getLevelInfo} from "./utils";

export function getDiamondsByGolfClubLevel(level){
    let diamonds = 0;
    let i = 1;
    while(i < level){
        diamonds += i;
        i++;
    }
    return diamonds;
}

export function getDiamondsByGolfClubXp(xp){
    const {currentLevel} = getLevelInfo(xp);
    return getDiamondsByGolfClubLevel(Math.min(16, currentLevel));
}