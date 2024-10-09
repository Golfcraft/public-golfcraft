import {tryFetch} from "./tryFetch";

export async function getNFTGolfClubs({address}){
    const golfclubs = await tryFetch(1,`https://gateway-arbitrum.network.thegraph.com/api/1597c31c24fbc0bf0f8ee3ea14f2516a/subgraphs/id/Ccskr6qXCAGpb6h43rYNzQsQzmwMPgSTyPB3rwgyTYm5`, {
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            "query":`{\n  golfclubs(where:{player:\"${address}\"}) {\n    id, golfclubid  }\n}`,
            "variables":null}),
        method:"POST"
    }).then(r => r.json(), (err) => {
        return Promise.reject();
    }).then(t=>t?.data?.golfclubs, ()=>Promise.reject());
console.log("golfclubCatalog",golfclubCatalog)
    const result = (golfclubs||[]).map(g=>({
        ItemId:`golfclub-${g.golfclubid}`,
        ItemClass:`GolfClub`,
        DisplayName:golfclubCatalog[g.golfclubid].defaultName,//TODO
        CustomData:{
            tokenId:g.id,
            attribute_aim:"5",
            attribute_power:"5",
            attribute_control:"5",
            xp:9999999
        }
    }));
    return result;
}

var golfclubCatalog = {
    "0":{
        "defaultName":"Star trail",
        "description":"Exclusive golf club edition for golfcraft game",
        "maxSupply":10,
        "bonus":25
    },
    "2":{
        "defaultName":"Star",
        "description":"Golcraft play to earn golf club first edition",
        "maxSupply":100,
        "bonus": 1
    },
    "3":{
        "defaultName":"Eye wide shot",
        "description":"Golf club by Polygonal Mind",
        "maxSupply":50,
        "bonus":5
    },
    "5":{
        "defaultName":"Pink Star",
        "description":"Golcraft play to earn golf club second edition",
        "maxSupply":100,
        "bonus": 1
    },
    "6":{
        "defaultName": "Poti club by Tobik",
        "description": "Life is wood",
        "maxSupply": 20,
        "bonus": 15
    },
    "7": {
        "defaultName": "Vampire bait",
        "description": "Golfer blood is delicatessen",
        "maxSupply": 100,
        "bonus": 1
    },
    "8": {
        "defaultName": "MC2 Golf club",
        "description": "Golf raised to the cube power",
        "maxSupply": 100,
        "bonus": 1
    },
    "9": {
        "defaultName": "CocoBay",
        "description": "Cocreated golfclub",
        "maxSupply": 70,
        "bonus": 1
    }
}
