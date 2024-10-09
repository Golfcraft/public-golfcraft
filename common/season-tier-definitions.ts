//TODO also on each gameplay you get X prize per points, e.g. FT or GC, etc.

//prizes for reaching a new tier
//type 0 is chest, type 1 is wearable

const tierCarDoublePrizeChance = [ //TODO REVIEW: create a logarithmic function?
    0.1,0.2
];

const seasonTierDefinitions = [
    {
        "prize": null,
        "name": "WOOD 5",
        "sprite":[803+43, 107, 103, 106]//x,y,w,h

    },
    {
        "prize": {
            "VirtualCurrency": "WD",
            "Amount": 20
        },
        "name": "WOOD 4"
    },
    {
        "prize": {
            "VirtualCurrency": "ST",
            "Amount": 20
        },
        "name": "WOOD 3"
    },
    {
        "prize": {
            "VirtualCurrency": "IR",
            "Amount": 20
        },
        "name": "WOOD 2"
    },
    {
        "prize": {
            "VirtualCurrency": "FT",
            "Amount": 20
        },
        "name": "WOOD 1"
    },
    {
        "prize": {
            "wearable": 1
        },
        "sprite":[177,550,172,143],
        "name": "STONE 5"
    },
    {
        "prize": {
            "VirtualCurrency": "WD",
            "Amount": 30
        },
        "sprite":[444,541,172,143],
        "name": "STONE 4"
    },
    {
        "prize": {
            "VirtualCurrency": "ST",
            "Amount": 30
        },
        "sprite":[711,543,172,143],
        "name": "STONE 3"
    },
    {
        "prize": {
            "VirtualCurrency": "IR",
            "Amount": 30
        },
        "sprite":[988,543,172,143],
        "name": "STONE 2"
    },
    {
        "prize": {
            "VirtualCurrency": "DM",
            "Amount": 5
        },
        "sprite":[1244,543,172,143],
        "name": "STONE 1"
    },
    {
        "prize": {
            "wearable": 1
        },
        "sprite":[179,817,172,143],
        "name": "IRON 5"
    },
    {
        "prize": {
            "VirtualCurrency": "WD",
            "Amount": 40
        },
        "sprite":[445,817,172,143],
        "name": "IRON 4"
    },
    {
        "prize": {
            "VirtualCurrency": "ST",
            "Amount": 40
        },
        "sprite":[712,817,172,143],
        "name": "IRON 3"
    },
    {
        "prize": {
            "VirtualCurrency": "IR",
            "Amount": 40
        },
        "sprite":[993,817,172,143],
        "name": "IRON 2"
    },
    {
        "prize": {
            "VirtualCurrency": "FT",
            "Amount": 40
        },
        "sprite":[1251,817,172,143],
        "name": "IRON 1"
    },
    {
        "prize": {
            "wearable": 1
        },
        "sprite":[911,560,110,109],
        "name": "BRONZE 5"
    },
    {
        "prize": {
            "VirtualCurrency": "WD",
            "Amount": 50
        },
        "sprite":[911,560,110,109],
        "name": "BRONZE 4"
    },
    {
        "prize": {
            "VirtualCurrency": "ST",
            "Amount": 50
        },
        "sprite":[911,560,110,109],
        "name": "BRONZE 3"
    },
    {
        "prize": {
            "VirtualCurrency": "IR",
            "Amount": 50
        },
        "sprite":[988,1389,172,143],
        "name": "BRONZE 2"
    },
    {
        "prize": {
            "VirtualCurrency": "DM",
            "Amount": 10
        },
        "sprite":[1245,1389,172,143],
        "name": "BRONZE 1"
    },
    {
        "prize": {
            "wearable": 1
        },
        "sprite":[171,1099,172,143],
        "name": "SILVER 5"
    },
    {
        "prize": {
            "VirtualCurrency": "WD",
            "Amount": 70
        },
        "sprite":[171,1099,172,143],
        "name": "SILVER 4"
    },
    {
        "prize": {
            "VirtualCurrency": "ST",
            "Amount": 70
        },
        "sprite":[713,1101,172,143],
        "name": "SILVER 3"
    },
    {
        "prize": {
            "VirtualCurrency": "IR",
            "Amount": 70
        },
        "sprite":[996,1101,172,143],
        "name": "SILVER 2"
    },
    {
        "prize": {
            "VirtualCurrency": "FT",
            "Amount": 70
        },
        "sprite":[1244,1101,172,143],
        "name": "SILVER 1"
    },
    {
        "prize": {
            "wearable": 1
        },
        "sprite":[180,1670,172,143],
        "name": "GOLD 5"
    },
    {
        "prize": {
            "VirtualCurrency": "WD",
            "Amount": 100
        },
        "sprite":[445,1670,172,143],
        "name": "GOLD 4"
    },
    {
        "prize": {
            "VirtualCurrency": "ST",
            "Amount": 100
        },
        "name": "GOLD 3"
    },
    {
        "prize": {
            "VirtualCurrency": "IR",
            "Amount": 100
        },
        "name": "GOLD 2"
    },
    {
        "prize": {
            "VirtualCurrency": "DM",
            "Amount": 20
        },
        "name": "GOLD 1"
    },
    {
        "prize": {
            "wearable": 1
        },
        "name": "DIAMOND 5"

    },
    {
        "prize": {
            "VirtualCurrency": "WD",
            "Amount": 120
        },
        "name": "DIAMOND 4"
    },
    {
        "prize": {
            "VirtualCurrency": "ST",
            "Amount": 120
        },
        "name": "DIAMOND 3"
    },
    {
        "prize": {
            "VirtualCurrency": "IR",
            "Amount": 120
        },
        "name": "DIAMOND 2"
    },
    {
        "prize": {
            "VirtualCurrency": "FT",
            "Amount": 120
        },
        "name": "DIAMOND 1"
    },
    {
        "prize": {
            "wearable": 1
        },
        "name": "MASTER 5"
    },
    {
        "prize": {
            "VirtualCurrency": "WD",
            "Amount": 150
        },
        "name": "MASTER 4"
    },
    {
        "prize": {
            "VirtualCurrency": "ST",
            "Amount": 150
        },
        "name": "MASTER 3"
    },
    {
        "prize": {
            "VirtualCurrency": "IR",
            "Amount": 150
        },
        "name": "MASTER 2"
    },
    {
        "prize": {
            "VirtualCurrency": "DM",
            "Amount": 50
        },
        "name": "MASTER 1"
    },
    {
        "prize": {
            "wearable": 1
        },
        "name": "GRAND MASTER 5"
    },
    {
        "prize": {
            "VirtualCurrency": "WD",
            "Amount": 300
        },
        "name": "GRAND MASTER 4"
    },
    {
        "prize": {
            "VirtualCurrency": "ST",
            "Amount": 300
        },
        "name": "GRAND MASTER 3"
    },
    {
        "prize": {
            "VirtualCurrency": "IR",
            "Amount": 300
        },
        "name": "GRAND MASTER 2"
    },
    {
        "prize": {
            "VirtualCurrency": "FT",
            "Amount": 300
        },
        "name": "GRAND MASTER 1"
    },
    {
        "prize": {
            "wearable": 1
        },
        "name": "SUPREME 5"
    },
    {
        "prize": {
            "VirtualCurrency": "WD",
            "Amount": 600
        },
        "name": "SUPREME 4"
    },
    {
        "prize": {
            "VirtualCurrency": "ST",
            "Amount": 600
        },
        "name": "SUPREME 3"
    },
    {
        "prize": {
            "VirtualCurrency": "IR",
            "Amount": 600
        },
        "name": "SUPREME 2"
    },
    {
        "prize": {
            "VirtualCurrency": "DM",
            "Amount": 100
        },
        "name": "SUPREME 1"
    }
]
const [spriteBaseX,spriteBaseY,spriteWidth, spriteHeight] = seasonTierDefinitions[0].sprite;
seasonTierDefinitions.forEach((def,index) => {
    if(index){

        def.sprite = [spriteBaseX + ((10+spriteWidth) * (index%5)),spriteBaseY+ ((7+spriteHeight)*Math.floor(index/5)),spriteWidth,spriteHeight]
        console.log("seasonTierDefinitions index",index, def.sprite);
        if(~def.name.indexOf("GRAND")){
            def.sprite = [914,902,110,114];
        }else if(~def.name.indexOf("MASTER")){
            def.sprite = [796,905,110,114];
        }else if(~def.name.indexOf("SUPREME")){
            def.sprite = [1027,902,119,112];
        }
    }
});
console.log("seasonTierDefinitions",seasonTierDefinitions)
export {
    seasonTierDefinitions
}