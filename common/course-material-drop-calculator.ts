import {CURRENCY} from "./currency-codes";
import fetch from "cross-fetch";
import {getDropChance} from "../web/server/db-script/calculate-drop-chance";
import {callDiscordHook} from "./discord";
// sumDrops was imported from watch-finished-tournaments
// instead of from ./utils for some reason?
//import {sumDrops} from "../web/tournament-watcher/watch-finished-tournaments";
import {sumDrops} from "./utils";
const cache = {
    data:null,
    lastTime:0
};
const MATERIAL_DROPS_URL = `https://golfcraftgame.com/api/get-material-drops`;

const loadMaterialDrops = async () => {
    if(cache.data && (cache.lastTime + 1000*60*5) > Date.now()) return cache.data;

    const materialDrops = await fetch(MATERIAL_DROPS_URL, {
        method:"GET"
    }).then( r => r.json());
    cache.data = materialDrops;
    cache.lastTime = Date.now();
    return materialDrops;
}
const DEFAULT_DROP_ALIASES = ["stony", "woody", "normal", "goldy", "irony"];
const DEFAULT_PART_DROP_CHANCE = 20;
export async function getCourseMaterialRandomDrop (parts, courseDefinition, useDrops2?, exclude = {}) {
    const partsMap = parts.reduce((acc, part)=>{
        acc[part.alias] = part;
        return acc;
    },{});

    const materialDrops = await loadMaterialDrops();
    const materialDropsMap = materialDrops.reduce((acc, current)=>{
        acc[current.alias] = current;
        return acc;
    },{});
    return useDrops2
        ? sumDrops(getDrops2(Math.random(), exclude), getDrops2(Math.random(), exclude))
        : getDrops(Math.random());

    function getDrops(randomNum){
        return courseDefinition.parts.reduce((acc, coursePart) => {
            const part = partsMap[coursePart.subtype];
            const partMaterialDrops =  (part && materialDropsMap[part.drop_alias]) || materialDropsMap["normal"];
            const applyDropToPart = (1+randomNum*100) < (part?.drop_chance||DEFAULT_PART_DROP_CHANCE);
            if(applyDropToPart && partMaterialDrops){
                const droppedMaterialCode = getDroppedMaterial(partMaterialDrops);
                if(droppedMaterialCode){
                    acc[droppedMaterialCode]++;
                }
            }
            return acc;
        },{
            [CURRENCY.GOLD]:0,
            [CURRENCY.IRON]:0,
            [CURRENCY.STONE]:0,
            [CURRENCY.WOOD]:0,
            [CURRENCY.DIAMOND]:0,
            [CURRENCY.FASHION_TICKETS]:0,
        })
    }
    function getDrops2(randomNum, exclude){
        return courseDefinition.parts.reduce((acc, coursePart) => {
            const part = partsMap[coursePart.subtype];
            if(!part){
                return acc;
            }
            const partMaterialDrops =  (part && materialDropsMap[part.drop_alias]) || materialDropsMap[DEFAULT_DROP_ALIASES[Math.floor(Math.random()*3)]];
            let drop_chance = getDropChance(part?.drop_alias || "normal", part.recipe) || DEFAULT_PART_DROP_CHANCE;
            let applyDropToPart = (1+randomNum*100) < drop_chance;
            if(applyDropToPart && partMaterialDrops){
                let droppedMaterialCode = getDroppedMaterial(partMaterialDrops, exclude);
                if(droppedMaterialCode){
                    acc[droppedMaterialCode]++;
                    while(drop_chance > 100){
                        drop_chance -= 100;
                        if((1+randomNum*100) < drop_chance){
                            droppedMaterialCode = getDroppedMaterial(partMaterialDrops, exclude);
                            acc[droppedMaterialCode]++;
                        }
                    }
                }
            }
            return acc;
        },{
            [CURRENCY.GOLD]:0,
            [CURRENCY.IRON]:0,
            [CURRENCY.STONE]:0,
            [CURRENCY.WOOD]:0,
            [CURRENCY.DIAMOND]:0,
            [CURRENCY.FASHION_TICKETS]:0,
        })
    }
}

function getDroppedMaterial(dropTable, exclude?){
    const {WD, ST, IR, GD, DM ,FT} = dropTable;
    const weights = [WD, ST, IR, GD, DM, FT];
    const ranges = weights.reduce((acc, current, index)=>{
        acc[index] = (acc[index-1]||0) + current;
        return acc;
    },[]);
    const max = ranges[ranges.length - 1];
    const result = Math.floor(1 + Math.random() * max);
    if(result <= ranges[0]){
        return CURRENCY.WOOD;
    }else if(result <= ranges[1]){
        return CURRENCY.STONE;
    }else if(result <= ranges[2]){
        return CURRENCY.IRON;
    }else if(result <= ranges[3]){
        return CURRENCY.GOLD;
    }else if(result <= ranges[4]){
        if(exclude?.DM) return getDroppedMaterial(dropTable, exclude);
        return CURRENCY.DIAMOND;
    }else /*if(result <= ranges[5])*/{
        return CURRENCY.FASHION_TICKETS;
    }
}