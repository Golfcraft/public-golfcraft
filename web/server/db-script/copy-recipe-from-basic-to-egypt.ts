import { PrismaClient } from '@prisma/client'
import {getDropChance} from "./calculate-drop-chance";
const prisma = new PrismaClient();

(async ()=>{
    console.log("Fetching basic parts");
    const basicParts = await prisma.parts.findMany({
        where:{
            alias:{contains:"basic_"},
            status:2
        }
    });
    console.log("basic parts", basicParts.length);

    const egyptParts = await prisma.parts.findMany({
        where:{
            alias:{contains:"egypt_"}
        }
    });
    console.log("egypt parts", egyptParts.length);

    let i = basicParts.length;
    while(i--){
        const basicPart = basicParts[i]
        console.log(`copying ${basicPart.alias}`);
        const egyptPart = egyptParts.find(i => i.alias === `egypt_${basicPart.alias.replace("basic_",'')}`)
        if(egyptPart){
            console.log("to ", egyptPart.alias);
            if(basicPart.recipe && basicPart.drop_alias && basicPart.drop_chance){
                try{
                    await prisma.parts.update({
                        where:{ID:egyptPart.ID},
                        data:{
                            recipe:basicPart.recipe,
                            drop_alias: basicPart.drop_alias,
                            drop_chance: getDropChance(basicPart.drop_alias, basicPart.recipe)
                        }
                    })
                }catch(e){
                    console.log(`ERROR UPDATING ${egyptPart?.alias} `, e);
                }
            }else{
                console.log("MISSING DATA ON "+ basicPart?.alias);
            }

        }else{
            console.log(`NOT FOUND in egypt: ${basicPart.alias} !!!!!!`)
        }


    }
})();