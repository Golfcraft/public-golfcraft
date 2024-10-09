import { PrismaClient } from '@prisma/client'
import {getDropChance} from "./calculate-drop-chance";
const prisma = new PrismaClient();

(async ()=>{
    console.log("Fetching basic parts");
    const parts = await prisma.parts.findMany({
        where:{
            NOT:{recipe:null}
        }
    });
    let i = parts.length;
    while(i--){
        const part = parts[i];
        await prisma.parts.update({where:{ID:part.ID}, data:{drop_chance:getDropChance(part.drop_alias, part.recipe)}})
    }
    console.log(`${parts.length} parts updated\n`);
    console.log(`${parts.map(p=>p.alias).join(" ")}`);
})();