import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

import wearables from "./cocobay-wearables.json";
const bonusPerRarity = {
    epic:2,
    legendary:5,
    mythic:10
};

(async()=>{

        const result = await prisma.wearables_catalog.deleteMany({
            where:{
                itemId:{startsWith:"cocobay_"}
            }
        })
        console.log(result);

        process.exit(0);
        return;

})();