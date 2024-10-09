import {showMessage} from "../components/server-notification";

export const getUserLands = async (address) => {
    return await fetch(`https://gateway-arbitrum.network.thegraph.com/api/1597c31c24fbc0bf0f8ee3ea14f2516a/subgraphs/id/Ccskr6qXCAGpb6h43rYNzQsQzmwMPgSTyPB3rwgyTYm5`, {
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            "query":`{\n  golfLands(where:{owner:\"${address}\"}) {\n    id,\n    parts {\n      id,\n      balance\n    }\n  }\n}`,
            "variables":null}),
        method:"POST"
    }).then(r => r.json(), (err) => {
        showMessage({timeout:3000, message:"ERROR"});
        return Promise.reject();
    }).then(t=>t.data.golfLands, ()=>Promise.reject());
}

export const getUserPristineLands = async (address)=>{
    const userLands = await getUserLands(address);
}