import {deserializeRecipe} from "../../../common/utils";

export function getDropChance (drop_alias, recipe) {
    const recipeObj = deserializeRecipe(recipe);
    const B3 = 1;
    const B4 = 2;
    const B5 = 6;
    const B6 = 18;
    const B7 = 54 / 90;
    const B8 = 5;
    const B32 = 200;//200;
    const B24 = recipeObj.WD || 0;
    const B25 = recipeObj.ST || 0;
    const B26 = recipeObj.IR || 0;
    const B27 = recipeObj.GD || 0;
    const B28 = recipeObj.DM || 0;
    const B29 = recipeObj.FT || 0;
    const E10 = 0.73433;//TODO this is calculated, copying value
    const I10 = 1.01748;//TODO
    const M10 = 1;//TODO
    const Q10 = 4.58384;
    const U10 = 2.36112;
    const B30 =B24*B3+B25*B4+B26*B5+B27*B6+B28*B7+B8*B29;
    const plus = (B30 > 50) ? 5 : (B30 > 60) ? 7 : (B30 > 70) ? 10 : (B30 > 80) ? 15 : 0;
    const extraFactor = 2.5;
    if(drop_alias === "woody"){
        return ((B30 / B32 * 100 / E10 + plus) * extraFactor);
    }else if(drop_alias === "stony") {
        return ((B30 / B32 * 100 / I10 + plus) * extraFactor);
    }else if(drop_alias === "goldy"){
        const GOLDY_FACTOR_BONUS = 1.1;
        return ((B30 / B32 * 100 / Q10 + plus) * extraFactor * GOLDY_FACTOR_BONUS);
    }else if(drop_alias === "irony"){
        return ((B30 / B32 * 100 / U10 + plus) * extraFactor);
    }else {//normal
        return ((B30/B32*100/M10 + plus) * extraFactor * 0.9);
    }
}
