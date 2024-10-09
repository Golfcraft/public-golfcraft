import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

(async ()=>{
    const egyptParts = await prisma.parts.findMany({
        where:{
            alias:{contains:"egypt_"}
        }
    });
    let i = egyptParts.length;
    while(i--){
        const currentPart = egyptParts[i];
        console.log("checking", currentPart.alias);
        const modificationPart = await prisma.part_modification.findFirst({where:{
            part_ID:currentPart.ID
        }});
        if(modificationPart){
            console.log("applying modification for ", currentPart.alias);
            await prisma.parts.update({
                where:{
                    ID:currentPart.ID
                },
                data:{
                    thumbnail64:modificationPart.thumbnail64,
                    boundingBox: modificationPart.boundingBox,
                    definition: modificationPart.definition,
                    updated: new Date().toISOString()
                }
            });
            console.log("applied modification to ", currentPart.alias);
        }else{
            console.log("not found modification for ", currentPart.alias);
        }
    }
    console.log("COMPLETED!");

})();