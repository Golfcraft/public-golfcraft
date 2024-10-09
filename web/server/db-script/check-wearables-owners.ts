import wearables from "./wearables.json";
import { ethers } from "ethers";
const provider = new ethers.providers.InfuraProvider(process.env.PROVIDER_URL);
import wearablesAbi from "./abi/wearables.abi.json";
import namesAbi from "./abi/names.abi.json";
import * as fs from "fs";
import fetch from "cross-fetch";
type Result = {
    [wearableAddress:string]:{
        name:string,
        address:string,
        hasLegendary:boolean,
        ownersWithNames:number,
        ownersWithNameAddresses:string[],
        wearables:{
            [wearableId:string]:{
                ownersWithNameAddresses:string[],
                ownersWithNames:number,
                wearableId:string,
                wearableKey:string,
                wearableAddress:string,
                issued:number,
                owners:{
                    [owner:string]:{hasName:boolean}
                }
            }
        }

    }
}
const THEGRAPH_API_URL = "https://gateway.thegraph.com/api/ca477456f6867aa73e24582c464e4e5f/deployments/id/QmccAwofKfT9t4XKieDqwZre1UUZxuHw5ynB35BHwHAJDT";
const result:Result = {};//[wearableAddress]:{name, wearables:{[id]:{id, legendary:boolean}}}
const namesContract = new ethers.Contract("0x2A187453064356c898cAe034EAed119E1663ACb8", namesAbi as any, provider);
import report from "./.wearables-report.json";

(async()=>{
    for(let wearableDef of wearables){

        const wearableAddress = wearableDef.address;
        const wearableCollectionName:string = wearableDef.name;
        if((report as any)[wearableCollectionName]){
            continue;
        }
        console.log("checking collection",wearableCollectionName );
        const wearablesContract = new ethers.Contract(wearableAddress, wearablesAbi as any, provider);
        const wearablesCount = (await wearablesContract.wearablesCount()).toNumber();
        const collectionKey = (await wearablesContract.name()).replace("dcl://","");

        const totalSupply = (await wearablesContract.totalSupply()).toNumber();

        console.log("wearablesCount",collectionKey,wearablesCount);

        let c = 0;
        while(c < wearablesCount){
            const wearableId = await wearablesContract.wearables(c);

            const wearableKey = await wearablesContract.getWearableKey(wearableId);
            const maxIssuance = (await wearablesContract.maxIssuance(wearableKey)).toNumber();
            console.log("wearableId", wearableId,maxIssuance);

            if(maxIssuance === 100){
                result[wearableAddress] = result[wearableAddress]||{name:wearableCollectionName, address:wearableAddress, hasLegendary:true, wearables:{},ownersWithNames:0, ownersWithNameAddresses:[]};
                const issued = (await wearablesContract.issued(wearableKey)).toNumber();
                result[wearableAddress].wearables[wearableId] = {wearableId, wearableKey, wearableAddress, owners:{}, ownersWithNames:0, ownersWithNameAddresses:[], issued}
            }

            c++;
        }

        //console.log(JSON.stringify(result,null, "  "))
        for(let collectionAddress in result){

            const collection = result[collectionAddress];

            for(let wearableId in collection.wearables){
             const wearables = (await theGraph(`{
                 wearables(where:{representationId:"${wearableId}"}) {
                   id, representationId, owner {
                     id
                  },
                 }
                }`)).wearables;

             for(let wearableInstance of wearables){
                 const [,,tokenId] = wearableInstance.id.split("-")

                if(!collection.wearables[wearableId].owners[wearableInstance.owner.id]){
                    //console.log(`${wearableId} ${tokenId} ${wearableInstance.owner.id}`);
                    const ownerAddress = wearableInstance.owner.id;
                    const nameBalance = (await namesContract.balanceOf(ownerAddress)).toNumber();
                    collection.wearables[wearableId].owners[wearableInstance.owner.id] = {hasName:nameBalance};

                    if(nameBalance){
                        collection.wearables[wearableId].ownersWithNames++;
                        if(~collection.wearables[wearableId].ownersWithNameAddresses.indexOf(ownerAddress)){
                            throw Error("already owner");
                        }
                        collection.wearables[wearableId].ownersWithNameAddresses.push(ownerAddress);
                      //  collection.wearables[wearableId].ownersWithNames++;
                        if(!~result[wearableAddress].ownersWithNameAddresses.indexOf(ownerAddress)){
                            result[wearableAddress].ownersWithNameAddresses.push(ownerAddress);
                            result[wearableAddress].ownersWithNames = result[wearableAddress].ownersWithNameAddresses.length;
                        }
                        console.log(nameBalance, result[wearableAddress].ownersWithNames)
                    }
                }
             }

            }
            //console.log("collection", collection);
        }
        const summaryResult = Object.values(result).reduce((acc:any, currentCollection)=>{
            acc[currentCollection.name] = {
                ownersWithNames:currentCollection.ownersWithNames,
                wearables:Object.values(result[currentCollection.address].wearables).reduce((acc:any, w)=>{
                    acc[w.wearableId] = result[currentCollection.address].wearables[w.wearableId].ownersWithNames;
                    return acc;
                },{}),
                name:currentCollection.name};
            return acc;
        }, {});
        fs.writeFileSync(`.wearables-report.json`, JSON.stringify(result), "utf8")
    }
})();

async function theGraph(query:string){
    return await fetch(THEGRAPH_API_URL, {method:"POST", headers:{"Content-Type":"application/json"},body:JSON.stringify({
            query
        })}).then(r=>r.json()).then(r=>r.data);
}
