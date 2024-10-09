import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

(async ()=>{
    const updated = await prisma.parts.updateMany({
        where:{
            alias:{contains:"egypt_"},
            NOT:{recipe:null}
        },
        data:{
            status:2
        }
    });
   console.log(updated)
})();