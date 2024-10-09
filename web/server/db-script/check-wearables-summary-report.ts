import wearables from "./wearables.json";
import { ethers } from "ethers";
const provider = new ethers.providers.InfuraProvider(process.env.PROVIDER_URL);
import wearablesAbi from "./abi/wearables.abi.json";
import namesAbi from "./abi/names.abi.json";
import * as fs from "fs";
import fetch from "cross-fetch";
const THEGRAPH_API_URL = "https://gateway.thegraph.com/api/ca477456f6867aa73e24582c464e4e5f/deployments/id/QmccAwofKfT9t4XKieDqwZre1UUZxuHw5ynB35BHwHAJDT";
const namesContract = new ethers.Contract("0x2A187453064356c898cAe034EAed119E1663ACb8", namesAbi as any, provider);
import _report from "./.wearables-report.json";
const report:any = _report;
for(let collectionAddress in (report as any)){
    const collectionName =  report[collectionAddress].name;
    report[collectionAddress].score =  report[collectionAddress].ownersWithNames / Object.keys(report[collectionAddress].wearables).length;
    // @ts-ignore
    const totalIssued:number = Object.values(report[collectionAddress].wearables).reduce((acc:number, current:any)=>(acc + (current.issued||0)) as number, 0)
    const avgIssued =  totalIssued / Object.values(report[collectionAddress].wearables).length;
    report[collectionAddress].projectionScore = report[collectionAddress].score / avgIssued * 100;
    console.log(collectionName, report[collectionAddress].score, report[collectionAddress].score / avgIssued * 100);
}

console.log(
    `Absolute\n`,
    Object.values(report).map((c:any) => ({name:c.name, score:c.score, wearables:Object.keys(c.wearables).length, ownersWithNames:c.ownersWithNames}))
        .sort((a:any,b:any)=>b.score-a.score)
        .map(c=>`\t${c.name.padStart(25," ")}  ${Math.floor(c.score)}`).join("\n")
);
console.log(
    `Projection\n`,
    Object.values(report).map((c:any) => ({name:c.name,projectionScore:c.projectionScore, score:c.score, wearables:Object.keys(c.wearables).length, ownersWithNames:c.ownersWithNames}))
        .sort((a:any,b:any)=>b.projectionScore-a.projectionScore)
        .map(c=>`\t${c.name.padStart(25," ")}  ${Math.floor(c.projectionScore)}`).join("\n")
);
