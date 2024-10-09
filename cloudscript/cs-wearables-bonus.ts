import {getDiamondsByGolfClubLevel} from "../common/calculate-golfclub-diamonds";
import {GOLF_CLUB_BONUSES} from "../common/constants";

declare const handlers:any;
declare const http:any;

const wearablesBonusPerContractToken = {
    "0x8a3448e1e5ebae5eabd47407ec5b5f508cc4f39b:0":2,//team tshirt
    "0x26294e873f69a25d6ae2321e9042118eca689112:0":2,//golf head
    "0xaca48da27e3bb65ec26c361c5fd1a672802d7320:0":3,//golfcraft 2022
    "mf_sammichgamer:mf_frogfins":5,
    "mf_sammichgamer:mf_unicornpants":5,
    "mf_sammichgamer:mf_animehair":5,
    "mf_sammichgamer:mf_unicornhelmet":5,
    "mf_sammichgamer:mf_wingsneakers":5,
    "mf_sammichgamer:mf_sammichtorso":5,
    ...getWearablesBonusDef("0x909bebffc69bab12c2ce559b74e43b50cdcafd8c", 4, 5),//ohMyGolf
    "0x5c014f91bf867c54ec335c18ba2e27066a83a0e6:0":5,//Beta-Tester
    "0x85f15ec042d64f3219a058b73ac2e459cb37e393:0":5,//Captain Cleanbeard
    "0x1aeb7d9536193a3a25c74d462ec2dc88da9e50dd:0":5,//Doki hair legendary
    "0x1aeb7d9536193a3a25c74d462ec2dc88da9e50dd:1":5,//Doki hair legendary
    ...getWearablesBonusDef("0x59d3a36754d961eca320f1b7281fe9b046b2975f",4,10),//ohMyDeluxe
    ...getWearablesBonusDef("0x9b44629ad39b417801441040c586b3debdbd1d04",20,5),//egypt
    ...getWearablesBonusDef("0x849a55b6f1769e3cd6335eb2fa09e4171e6bfb23",20,5),//space
    ...getWearablesBonusDef("0x688e5c0e65823ddf4a92dcf171b56cb476f22cbd",19,5),//urban
    ...getWearablesBonusDef("0xcdfcffe8e83cce105b60c0b3077bf5422fae1bcd",20,5),//jungle
    "0xfc96c422101e708da022ebe19037eac741024a0e:0":1,//CaddyVroom Skin
};

function getWearablesBonusDef(contract, numItems, bonus){
    return new Array(numItems).fill(null).reduce((acc, current, index)=>{
        acc[`${contract}:${index}`] = bonus;
        return acc;
    },{})
}

handlers.checkWearables = () => {
    const PlayFabId = currentPlayerId;
    const {InfoResultPayload} = server.GetPlayerCombinedInfo({
        PlayFabId,
        InfoRequestParameters:{
            "GetUserData": true,
            "GetUserReadOnlyData":true,
            "GetUserInventory": true
        }
    });

    const {UserInventory} = InfoResultPayload;
    const inventoryDiamonds = UserInventory.find(i=>i.ItemId === "Gem");

    //TODO also check migratedGolfclub on user, if not: - return diamonds for level, reset attributes.
    if(!InfoResultPayload.UserReadOnlyData?.migratedGolfclub?.Value){//TODO this is a migration: review if we can remove it some day
        const golfclub = UserInventory.find(i=>i.ItemId === "golfclub-1");

        if(golfclub){
            const totalAttributes = Number(golfclub.CustomData.attribute_power) + Number(golfclub.CustomData.attribute_aim) + Number(golfclub.CustomData.attribute_control);
            if(!isNaN(totalAttributes) && totalAttributes){
                server.UpdateUserInventoryItemCustomData({
                    PlayFabId:currentPlayerId,
                    ItemInstanceId:golfclub.ItemInstanceId,
                    Data:{
                        attribute_power:"0",
                        attribute_control:"0",
                        attribute_aim:"0"
                    }
                })

                const diamondsToReturn = getDiamondsByGolfClubLevel(1 + totalAttributes);
                server.AddUserVirtualCurrency({
                    PlayFabId:currentPlayerId,
                    Amount:diamondsToReturn,
                    VirtualCurrency:"DM"
                })
            }
            server.UpdateUserReadOnlyData({
                PlayFabId:currentPlayerId,
                Data:{
                    migratedGolfclub:"1"
                }
            })
        }
    }

    if(inventoryDiamonds?.RemainingUses){//TODO thisis a migration: review we can remove it some day
        const Amount = inventoryDiamonds.RemainingUses;
        server.RevokeInventoryItem({PlayFabId, ItemInstanceId:inventoryDiamonds.ItemInstanceId});
        server.AddUserVirtualCurrency({PlayFabId, VirtualCurrency:"DM", Amount});
    }

    const {UserData} = InfoResultPayload;

    const address = UserData.address.Value.toLowerCase();
    const response = http.request(
        `https://peer.decentraland.org/lambdas/collections/wearables-by-owner/${address}`,
        "get",
        null,
        `application/json`,
        null,
        true
    );
    const wearables = JSON.parse(response);

    const wearableKeys = Array.from(new Set(wearables.map(w=>{
        const [u,d,n,v,collection,tokenId] = w.urn.split(":");
        return `${collection}:${tokenId}`;
    })));
    let wBonus = 0;
    wearableKeys.forEach((wk:string) => {
        wBonus += (wearablesBonusPerContractToken[wk]||0);
    })
    const Data:any = {
        wearablesBonus:wBonus.toString()
    }
    let gBonus = 0;
    try{
        const response = JSON.parse(http.request(
            `https://gateway-arbitrum.network.thegraph.com/api/1597c31c24fbc0bf0f8ee3ea14f2516a/subgraphs/id/Ccskr6qXCAGpb6h43rYNzQsQzmwMPgSTyPB3rwgyTYm5`,
            "post",
            JSON.stringify({
                "query":`{\n  golfclubs(where:{player:\"${address}\"}) {\n    id, golfclubid  }\n}`,
                "variables":null}),
            `application/json`,
            null,
            true
        ));
        const golfclubs = response.data.golfclubs;

        const golfclubIds = Array.from(new Set(golfclubs.map(g=>g.golfclubid)));
        golfclubIds.forEach((gId:string)=>{
            gBonus += (GOLF_CLUB_BONUSES[gId]||1)
        });

        Data.golfclubsBonus = gBonus;
        degub.log("gBonus", gBonus)
    }catch(error){
        log.debug("error",error);
    }

    server.UpdateUserReadOnlyData({
        PlayFabId:currentPlayerId,
        Data
    });
    return wBonus + gBonus;
};