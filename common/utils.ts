import {TIER_CATEGORIES, TIER_COLORS} from "./constants";
import {seasonTierDefinitions} from "./season-tier-definitions";

export function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}
export function getDifferentRandomInts(min, max, numResults) {
    let results = (new Array(numResults)).fill(null);
    results = results.map(i=> {
        let result = getRandomInt(min, max)
        while(results.indexOf(result)>=0) {
            result = getRandomInt(min, max);
        }
        return result;
    });
    return results;
}
export function isEqual(o1,o2){
    return JSON.stringify(o1) === JSON.stringify(o2);
}
export function deserializeRecipe(recipe:any){ //returns object {WD:1, ST:2, ...}
    if(!recipe || !recipe.trim()) return {};
    return recipe.replace(/\s+/g," ").split(" ").reduce((acc, declaration)=>{
        const [material, amount] = declaration.split(":");
        acc[material] = Number(amount);
        return acc;
    },{});
}

export function serializeRecipe(recipeObj:any){
    if(!recipeObj) return null;

    return Object.keys(recipeObj).map((material)=>{
        return recipeObj[material]?`${material}:${recipeObj[material]}`:"";
    },'').join(" ").trim();
}

export function tryFn(fn, errFn?){
    try{return fn()}catch(err){if(errFn) return errFn(err)}
}
export function getRandom(min, max) {
    return min + (Math.random() * (max - min));
}
export function removeValueFromArray(array, value){
    const index = array.indexOf(value);
    array.splice(index, 1);
    return ~index;
}
export function getDistance(v1:number[],v2:number[]){
  const distance = Math.pow(
    Math.pow(v1[0]-v2[0],2)/2 
    + Math.pow(v1[1]-v2[1],2)/2 
    + Math.pow(v1[2]-v2[2],2), 0.5);
  return distance;
}

export function gfl(...args){
  console.log("gfl", ...args);
}

export function getLevelInfo(xp){    
  const xpNum = Number(xp||0);
  if(!xpNum){
      return {
          currentLevel:1,
          progressPercentage:1
      }
  }
  const level = Math.floor(Math.cbrt(xp/10));
  const levelMinExp = Math.pow(level, 3)*10;
  const nextLevelExp = Math.pow(level+1,3)*10;
  const wholeLevelExp = nextLevelExp - levelMinExp;
  const restExpFromCurrentLevel = xpNum - levelMinExp;

  return {
      currentLevel: Math.min(level+1,80),
      progressPercentage: level >= 80 ? 100 : Math.floor((100*restExpFromCurrentLevel)/wholeLevelExp)
  };
}
export async function waitFor(conditionFn, timeInterval = 100, logFn?){
  while(!conditionFn()){
      logFn && logFn();
    await sleep(timeInterval);
  }
  return true;
}

export function getRandomFromList(list, exclude?:(()=>any)|any[]|any){
    if(!list?.length) return undefined;
    let iterations;//TODO to implement infinite loop protection,
    //TODO check if all items are excluded
    let index = getRandomInt(0,list.length-1);
    if(list.every(item=>{
        if(exclude && exclude instanceof Array) {
            return ~exclude.indexOf(item)
        } else if(typeof exclude === 'function'){
            return exclude(item);
        }else if(exclude !== undefined){
            return exclude === item;
        }
    })){
        throw Error("All items on list are excluded");
    }
    if(exclude && exclude instanceof Array) {
        while (~exclude.indexOf(list[index])) {
            index = getRandomInt(0, list.length - 1);
        }
    }else if(typeof exclude === 'function'){
        while(exclude(list[index])){
            index = getRandomInt(0, list.length - 1)
        }

    }else if(exclude !== undefined){
        while(list[index] === exclude){
            index = getRandomInt(0,list.length-1);
        }
    }

    return list[index];
}

export function getUvsFromSprite(sourceWidth, sourceHeight, x,y,w,h){
    const B = x/sourceWidth;
    const A = x/sourceWidth + w/sourceWidth;
    const C = 1 - (y/sourceHeight);
    const D = 1 - (y/sourceHeight + h/sourceHeight);

    return [
        B, //b
        C, //c
        A, //a
        C, //c

        A, //a
        D, //d
        B, //b
        D, //d
        0,0,0,0,0,0,0,0
    ];
}

export function getRandomIntDifferentThan(num, min, max){
    let result = getRandomInt(min, max);
    while(result === num){
        result = getRandomInt(min, max);
    }
    return result;
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function getNumberOfFrames(ms, fps){
    return ms / (1000/fps);
}

export function formatTime(ms, includeMs = false){
    const hours = Math.floor(ms/1000/60/60);
    const minutes = Math.floor((ms - hours*1000*60*60)/1000/60);
    const seconds = Math.floor((ms - minutes*1000*60)/1000);
    const milliseconds = ms%1000;
    
    const rest = seconds%60;
    let minutesStr = minutes<10 ? `0${minutes}`:minutes;
    let secondsStr = rest<10 ? `0${rest}`:rest;
    let hoursStr = hours
      ? `${hours}:`
      : '' ;
    return `${hoursStr}${minutesStr}:${secondsStr}${includeMs?"."+milliseconds.toString().padStart(4, '0'):""}`;
}

export async function tryFetchJSON(url, options?){
  try{
    return await globalThis["fetch"](url, options).then(r => r.json());
  }catch(err){
    console.error(err);
    return undefined;
  }
}

export const compose = (...fns) => (initialVal) => fns.reduceRight((val, fn) => fn(val), initialVal);
export const pipe = (...fns) => (initialVal) => fns.reduce((val, fn) => fn(val), initialVal);

export const deepFreeze = obj => {
    Object.keys(obj).forEach(prop => {
      if (typeof obj[prop] === 'object' && !Object.isFrozen(obj[prop])) deepFreeze(obj[prop]);
    });
    return Object.freeze(obj);
};
export const cloneJSON = (a)=>JSON.parse(JSON.stringify(a));

export function lerp(a,b,t){
  return {
    x:a.x + (b.x - a.x) * t,
    y:a.y + (b.y - a.y) * t,
    z:a.z + (b.z - a.z) * t
  }
}
export function i(fn){
  return fn();
}
export function idReductor(acc, current){
  acc[current.id] = current;
  return acc;
}

export function slerp (a, b, t) {
    const out:any = {};
    var ax = a.x, ay = a.y, az = a.z, aw = a.w,
      bx = b.x, by = b.y, bz = b.z, bw = b.w
    var omega, cosom, sinom, scale0, scale1
    cosom = ax * bx + ay * by + az * bz + aw * bw
    if (cosom < 0.0) {
      cosom = -cosom
      bx = -bx
      by = -by
      bz = -bz
      bw = -bw
    }

    if ((1.0 - cosom) > 0.000001) {
      omega = Math.acos(cosom)
      sinom = Math.sin(omega)
      scale0 = Math.sin((1.0 - t) * omega) / sinom
      scale1 = Math.sin(t * omega) / sinom
    } else {
      scale0 = 1.0 - t
      scale1 = t
    }

    return {
        x:scale0 * ax + scale1 * bx,
        y:scale0 * ay + scale1 * by,
        z:scale0 * az + scale1 * bz,
        w:scale0 * aw + scale1 * bw
    };
  }

  export function isInsideBox(box_position: Array<number>, box_scale: Array<number>, obj_position: {x: number, y: number, z: number}) {
      const [ wp_x, wp_y, wp_z ] = box_position;
      const [ ws_x, ws_y, ws_z ] = box_scale;
      const { x, y, z } = obj_position;

      let inside_x = false;
      let inside_y = false;
      let inside_z = false;
      if (x < (wp_x + ws_x) && x > (wp_x - ws_x)) inside_x = true;
      if (y < (wp_y + ws_y) && y > (wp_y - ws_y)) inside_y = true;
      if (z < (wp_z + ws_z) && z > (wp_z - ws_z)) inside_z = true;

      if (inside_x && inside_y && inside_z) return true;

      return false;
  }

export const shuffle = _array => {
  const array = JSON.parse(JSON.stringify(_array))
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

export function mapPropertiesMultInt(obj, num){
    const result = {};
    Object.keys(obj).forEach(key=>{
        result[key] = Math.floor((obj[key]||0) * (num||0));
    });
    return result;
}

export function sumDrops(source, target){
    Object.keys(source).forEach(VirtualCurrencyName => {
        target[VirtualCurrencyName] = target[VirtualCurrencyName] || 0;
        target[VirtualCurrencyName] += source[VirtualCurrencyName]
    });
    return target;
}

/**
 * Wood 5 is tier 0 (min:0, max:5)
 * Wood 1 is tier 4 (min:8, max:10)
 * Stone 1 is tier 5
 * Master 1 is tier 49 (min:98 , max:100)
 */
export function getTierPercentiles (tier) {
    if(tier >= 0 && tier <= 4) return [0, 1];//wood
    if(tier >= 5 && tier <= 9) return [0, 4];//stone
    if(tier >= 10 && tier <= 14) return [0, 10];//iron
    if(tier >= 15 && tier <= 19) return [5, 25];//bronze
    if(tier >= 20 && tier <= 24) return [10, 50];//silver
    if(tier >= 25 && tier <= 29) return [10, 60];//gold
    if(tier >= 30 && tier <= 34) return [10, 75];//diamond
    if(tier >= 35 && tier <= 39) return [30+tier%5, 80];//master
    if(tier >= 40 && tier <= 44) return [55+tier%5, 100];//grand master
    if(tier >= 45 && tier <= 50) return [70+tier%5, 100];//supreme
}

export function getTierColor(tier){
    const catIndex = getCatFromTier(tier);
    return TIER_COLORS[catIndex];
}
export const seasonPointsPerCategory = [
    5,5,5,5,5,
    6,7,8,9,10
]

function logAllWearablesSeasonPoints(){
    for(let tier in seasonTierDefinitions){
        console.log(seasonTierDefinitions[tier].name, " ANTES ", Number(tier)*5 ," AHORA ", getPointsToTier(tier));
    }
}

export function getPointsToTier(tier){
    const maxFirsts = 5*5*5 - 1;
    const maxGold = (maxFirsts + 5*6 );
    const maxDiamond = (maxGold + 5*7 );
    const maxMaster = (maxDiamond + 5*8 );
    const maxGrandMaster = (maxMaster + 5*9 );
    const maxSupreme = (maxGrandMaster + 5*10 );

    if(tier >= 0 && tier <= (5*5-1)){//wood to silver
        return tier * 5;
    }else if(tier >= (5*5) && tier <= (5*6-1)) {//gold
        return maxFirsts + 1 + (tier%5*6);
    }else if(tier >= (5*6) && tier <= (5*7-1)) {//diamond
        return maxGold + 1 + (tier%5*7);
    }else if(tier >= (5*7) && tier <= (5*8-1)) {//master
        return maxDiamond + 1 + (tier%5*8);
    }else if(tier >= (5*8) && tier <= (5*9-1) ){//grand master
        return maxMaster + 1 + (tier%5*9);
    }else if(tier >= (5*9) && tier <= (5*10-1) ) {//supreme
        return maxGrandMaster+1 + + (tier%5*10);
    }
}

export function getPointsOnCurrentTier(tierSub){
    const tier = getTierFromSub(tierSub);
    return tierSub - getPointsToTier(tier);
}

export function getTierFromSub(tierSub){
    const maxFirsts = 5*5*5 - 1;
    const maxGold = (maxFirsts + 5*6 );
    const maxDiamond = (maxGold + 5*7 );
    const maxMaster = (maxDiamond + 5*8 );
    const maxGrandMaster = (maxMaster + 5*9 );
    const maxSupreme = (maxGrandMaster + 5*10 );

    const _tierSub = Math.min( Math.max(tierSub, 0), 324);
    if(_tierSub <= maxFirsts){//5 points to promote
        // 0 - 124 (0-24)
        return _tierSub !== undefined && Math.min(Math.floor(_tierSub/5), 49) || 0;
    }else if(_tierSub > maxFirsts && _tierSub <= maxGold) { // 6 points to promote
        // 125 - 154 (25-29)
        //125,126,127,128,129,130
        //131,
        //137,
        //143,
        //149,150,151,152,153,154
        // ---> 29
        let rest = _tierSub - maxFirsts - 1;
       return 5*5 + Math.floor(rest/6);
    }else if(_tierSub > maxGold && _tierSub <= maxDiamond){ // 7 points to promote
        //155 - 189 (30 - 34)
        //155,156,157,158,159,160,161
        //162
        //169
        //176
        //183,...189
        // ---> 34 diff
        let rest = _tierSub - maxGold - 1;
        return 6*5 + Math.floor(rest/7);
    }else if(_tierSub > maxDiamond && _tierSub <= maxMaster){
        //190 - 119 (35 - 39)
        //190, ... 197
        //198
        //206
        //214
        //222 ... 229
        // ---> 39 diff
        let rest = _tierSub - maxDiamond - 1;
        return 7*5 + Math.floor(rest/8);
    }else if(_tierSub > maxMaster && _tierSub <= maxGrandMaster){
        //230 - 274 (40 - 44)
        //230 .. 238
        //239
        //248
        //257
        //266 .. 274
        // ---> 44 diff
        let rest = _tierSub - maxMaster - 1;
        return 8*5 + Math.floor(rest/9);
    }else if(_tierSub > maxGrandMaster){
        //275 ... 284
        //285
        //295
        //305
        //315 ... 324
        // ---> 49 diff
        let rest = _tierSub - maxGrandMaster - 1;
        return 9*5 + Math.floor(rest/10);
    }
}

export function getSubFromTier(tier){
    let c = 0;
    while(c <= 324){
        if(getTierFromSub(c) === tier){
            return c
        }
        c++;
    }
}

export function getSubFromName(name){
    const tier = seasonTierDefinitions.findIndex(i=>i.name === name);
    let c = 0;
    while(c <= 324){
        if(getTierFromSub(c) === tier){
            return c
        }
        c++;
    }
}

export function getCatFromTier(tier){
    return Math.min(Math.floor(tier/5), 9)
}

export const defaultChestRewardChances = [
    {WD:1, weight:   100*60},
    {ST:1, weight:   100*40},
    {IR:1, weight:   100*10},
    {GD:1, weight:   100*3},
    {DM:1, weight:   100*1},
    {FT:1, weight:   100*10},
    {WD:10, weight:  10*60},
    {ST:10, weight:  10*40},
    {IR:10, weight:  10*10},
    {GD:10, weight:  10*3},
    {DM:10, weight:  10*1},
    {FT:10, weight:  10*10},
    {WD:100, weight: 1*60},
    {ST:100, weight: 1*40},
    {IR:100, weight: 1*10},
    {GD:100, weight: 1*3},
    {DM:100, weight: 1*1},
    {FT:100, weight: 1*10},
    {wearable:1, weight:80}
];