import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

import wearables from "./cocobay-wearables.json";
const bonusPerRarity = {
    epic:2,
    legendary:5,
    mythic:10
};

(async()=>{
/*
    const result = await prisma.wearables_catalog.deleteMany({
        where:{
            itemId:{startsWith:"cocobay_"}
        }
    })
    console.log(result);

    process.exit(0);
    return;
*/

    await prisma.wearables_catalog.createMany({
        data:wearables.map(wearable => ({
            name:wearable.name,
            itemId:wearable.wId,
            wearableId:Number(wearable.itemId),
            contract:wearable.contractAddress,
            tierReward:wearable.tierReward,
            maxStock:wearable.available,
            supply:wearable.available,
            minPlayerLevel:0,
            maxMintsByAddress:0,
            claimed:0,
            trainingBonus:bonusPerRarity[wearable.rarity]||0,
            tierEnabled:1,
            disabled:1
        }))
    });
})();