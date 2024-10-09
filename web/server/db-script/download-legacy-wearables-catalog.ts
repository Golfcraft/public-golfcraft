import fetch from "cross-fetch";
import {deserializeRecipe, serializeRecipe} from "../../../common/utils";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

const prompt = require("prompt");

(async () => {
    const legacyCatalog = await fetch(`https://service.golfcraftgame.com/golfcraft/wearables-catalog`)
        .then(r => r.json());
    const columns = [];
    const contractsAdded = [];
    Object.values(legacyCatalog).forEach((collection:any) => {
        if(!contractsAdded.find(c=>c.address === collection.contract)){
            contractsAdded.push({address:collection.contract, name:collection.name})
        }
        collection.items.forEach((item)=>{
            columns.push({
                contract:collection.contract,
                storage:item.storage,
                relay:bool2Binary(item.relay),
                itemId:item.id,
                image_url:item.image_url,
                wearableId:item.wearableId,
                price:serializeRecipe(item.price),
                position:item.position.join(","),
                rotation:item.rotation.join(","),
                maxStock:item.maxStock,
                supply:item.supply,
                minPlayerLevel:item.minPlayerLevel||null,
                maxMintsByAddress:item.maxMintsByAddress||null,
                claimed:item.sold,
                disabled:null,
                name:item.name
            })
        })
    })
    console.log(contractsAdded.map(c=>JSON.stringify(c)).join("\n\n"))
    console.log(columns.map(c=>JSON.stringify(c)).join("\n\n"))

    const {goAhead} = await prompt.get({properties:{
            goAhead:{message:"type yes to continue", required:true},
    }});
    console.log("goAhead",goAhead)

    if(goAhead.trim().toLowerCase() !== "yes") {
        console.log("exit");
        return;
    }else{
        let i = contractsAdded.length;
        while(i--){
            const column = contractsAdded[i];
            try{
                const created = await prisma.wearables_collections.create({
                    data:column
                });
                console.log("inserted collection", JSON.stringify(column));
            }catch(error){
                console.log("error creating collection", JSON.stringify(column), error);
                process.exit(1);
                return;
            }
        }
        i = columns.length;
        while(i--){
            const column = columns[i];
            console.log("inserting...", column.itemId);
            const created = await prisma.wearables_catalog.create({
                data:column
            });
            console.log(`inserted ${created.ID} ${column.id}`);
        }
    }
    console.log("\n\nDONE!!!\n\n");
})();

function bool2Binary(bool){
    return bool && 1 || 0;
}