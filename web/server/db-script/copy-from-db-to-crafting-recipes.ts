import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();
//TODO should take private key from .env
import { ethers } from "ethers";
const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
import craftingAbi from "./crafting.abi.json";
console.log("craftingAbi",!!craftingAbi)

const GWEI = Math.pow(10,9);
import fetch from "cross-fetch";
const BLOCK_MAX_GAS_LIMIT = 3000000;
const materialTokenIds = {
    WD:4,
    ST:5,
    IR:6,
    GD:7,
    DM:2
};

let [,,...ids] = process.argv.map(i=>Number(i));
console.log("argIDs",ids);

(async ()=>{
    const parts = await prisma.parts.findMany({
        where:{
            OR:ids.map(ID=>({ID:ID}))
        }
    });
    console.log("parts", parts?.length);
    console.log("parts aliases", parts.map(p=>p.alias).join(","));

    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const craftingContract = new ethers.Contract("0x8e1e2bbf6dfae62a1988d5a12969ebd057597e4a", craftingAbi, provider);

    let i = parts.length;
    const gasInfo = await fetch(`https://gasstation.polygon.technology/v2`).then(r => r.json());
console.log("gasInfo",gasInfo);
    while(i--){
        const part = parts[i];
        //TODO check if the recipe is already added in the contract
        if(part && part.recipe){
            const recipeObj = deserializeRecipe(part.recipe);
            const materialIDs = Object.keys(recipeObj).map(key=>materialTokenIds[key]);
            const materialAmounts = Object.keys(recipeObj).map(key=>recipeObj[key]);
            console.log("setting up recipe",part.alias,part.ID,part.recipe,materialIDs,materialAmounts);
            try {
                let estimatedGasAmount = await craftingContract.connect(signer).estimateGas.addRecipe(part.ID, materialIDs, materialAmounts);
                if(!estimatedGasAmount){

                    console.log("not estimate", estimatedGasAmount)
                    process.exit(1);
                }


                console.log(`Deploying recipe for part ${part.alias}(${part.ID})`);
                console.log("estimatedGasAmount",estimatedGasAmount)
                const tx = await craftingContract.connect(signer).addRecipe(part.ID, materialIDs, materialAmounts, {
                    gasLimit:Math.ceil(estimatedGasAmount.toNumber()),// (estimatedGasAmount && Math.ceil(estimatedGasAmount?.toNumber() * 1.5) || undefined),
                    maxFeePerGas:process.env.MAX_FEE ?(Number(process.env.MAX_FEE)* GWEI) : Math.ceil(gasInfo.fast.maxFee * GWEI * (process.env.REPLACE_TX?1.2:1)),
                    maxPriorityFeePerGas:process.env.MAX_FEE_PRIORITY?(Number(process.env.MAX_FEE_PRIORITY)* GWEI) : Math.ceil(gasInfo.fast.maxPriorityFee * GWEI)
                });
                console.log("TRANSACTION EXECUTED", !!tx);
            }catch(e){
                console.log("FAILED TX, EXITING", e);
                process.exit(1);
            }
        }else{
            console.log("MISSING RECIPE ON PART ", part.alias);
        }
    }

    console.log("COMPLETE !!!")

})();


function deserializeRecipe(recipe:any){ //returns object {WD:1, ST:2, ...}
    if(!recipe || !recipe.trim()) return {};
    return recipe.replace(/\s+/g," ").split(" ").reduce((acc, declaration)=>{
        const [material, amount] = declaration.split(":");
        acc[material] = Number(amount);
        return acc;
    },{});
}