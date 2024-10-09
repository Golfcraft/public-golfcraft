import {showMessage} from "../components/server-notification";

export async function getMaterialBalance(address){
    const materialStoreNames = {
        "0":"FTChain",
        "1":"FT500Chain",
        "2":"DMChain",
        "3":"DM100Chain",
        "4":"Planks",
        "5":"StoneBlocks",
        "6":"IronBars",
        "7":"GoldBars"
    };
    const graphResult = await fetch(`https://gateway-arbitrum.network.thegraph.com/api/1597c31c24fbc0bf0f8ee3ea14f2516a/subgraphs/id/Ccskr6qXCAGpb6h43rYNzQsQzmwMPgSTyPB3rwgyTYm5`, {
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            "query":`{\n  account(id:\"${address}\") { materials {  id, balance }  }}`,
            "variables":null}),
        method:"POST"
    }).then(r => r.json(), (err) => {
        showMessage({timeout:3000, message:"ERROR"});
        return Promise.reject();
    }).then(t=>t.data?.account?.materials || [], ()=>Promise.reject());

    return graphResult?.reduce((acc, materialBalance)=>{
        const id = materialBalance.id.replace(`${address}-`,``);
        const storeName = materialStoreNames[id];
        const balance = materialBalance.balance;
        acc[storeName] = balance;
        return acc;
    },{}) || {};

}