import { getLevelInfo } from "../common/utils";
import { checkBoostTimers } from "./csBonus";

handlers.checkCorruptedGolfClub = (params, context)=>{
    const _PlayFabId = (params||{}).PlayFabId;
    const PlayFabId = (context && currentPlayerId) || _PlayFabId || context?.playerProfile?.PlayerId;
    let UserInventory = server.GetUserInventory({PlayFabId:_PlayFabId}).Inventory;
    const golfClubs = UserInventory.filter(i=>i.ItemClass === "Golfclub").filter(i=>i?.CustomData?.tokenId);
    const golfClubTokenIds = golfClubs.filter(i=>i.CustomData?.tokenId).map(i=>i.CustomData?.tokenId);
    const findDuplicates = arry => arry.filter((item, index) => arry.indexOf(item) !== index);
    const duplicates = findDuplicates(golfClubTokenIds)
    const duplicatedGolfClubs = golfClubs.filter(i=>~duplicates.indexOf(i.CustomData.tokenId));

    let corrupteds = [];
    if (duplicates?.length) {
        duplicatedGolfClubs.forEach((g)=>{
            if(
                !corrupteds.find(c=>c===g)
                && (
                    (!g.CustomData.attribute_power || Number(g.CustomData.attribute_power) !== 5) ||
                    (!g.CustomData.attribute_control || Number(g.CustomData.attribute_control) !== 5) ||
                    (!g.CustomData.attribute_aim || Number(g.CustomData.attribute_aim) !== 5)
                )
            ){
                corrupteds.push(g);
            }
        });
        corrupteds.forEach((corruptedGolfclub)=>{
            const xp = corruptedGolfclub.CustomData.xp;
            const totalAttr =   Number(corruptedGolfclub.CustomData.attribute_power)
                                + Number(corruptedGolfclub.CustomData.attribute_control)
                                + Number(corruptedGolfclub.CustomData.attribute_aim);

            const freeGolfClub = UserInventory.find(i=>i.ItemId==="golfClub-1");
            server.UpdateUserInventoryItemCustomData({
                ItemInstanceId:freeGolfClub.ItemInstanceId,
                Data:{
                    xp:(Number(freeGolfClub?.CustomData.xp) + Number(corruptedGolfclub.CustomData.xp)).toString()
                },
                PlayFabId
            });
            server.AddUserVirtualCurrency({
                PlayFabId,
                VirtualCurrency:"DM",
                Amount:sumUntil(totalAttr+1)
            })
            //TODO give diamonds

            function sumUntil(num){
                var c =0; var i = num;
                while(i--){
                    c += i;
                }
                return c;
            }
        });
    }
};

handlers.selectGolfClubTokenId = ({tokenId})=>{
    if(tokenId){
        server.UpdateUserReadOnlyData({
            PlayFabId:currentPlayerId,
            Data:{
                activeGolfClubTokenId:tokenId
            }
        })
    }else{
        server.UpdateUserReadOnlyData({
            PlayFabId:currentPlayerId,
            KeysToRemove:["activeGolfClubTokenId"]
        })
    }
};

handlers.upgradeGolfclub = ({ItemInstanceId, attribute}) => {
    const upgradeMaterials = {power:"IR",control:"ST",aim:"WD"};

    const PlayFabId = currentPlayerId;
    const {Inventory, VirtualCurrency} = server.GetUserInventory({
        PlayFabId
    });
    const golfclub = Inventory.find(item=>item.ItemInstanceId === ItemInstanceId);
    log.debug("golfclub.CustomData",golfclub.CustomData);
    const playerMaterialAmount = VirtualCurrency[upgradeMaterials[attribute]] || 0;
    const enoughMaterials = playerMaterialAmount >= getMaterialCost();
    const attributesLevel = getLevelFromAttributes(golfclub);
    const xpLevel = getLevelInfo(Number(golfclub.CustomData?.xp||0)).currentLevel;
    log.debug("attributesLevel", attributesLevel);
    const upgradeAvailable = Number(golfclub.CustomData?.xp||0) && xpLevel > attributesLevel && attributesLevel < 16 && enoughMaterials;
    if(upgradeAvailable){
        server.SubtractUserVirtualCurrency({
            PlayFabId,
            Amount:getMaterialCost(),
            VirtualCurrency:upgradeMaterials[attribute]
        })
        
        server.UpdateUserInventoryItemCustomData({
            PlayFabId,
            ItemInstanceId,
            Data:{
                [`attribute_${attribute}`]:(Number(golfclub.CustomData[`attribute_${attribute}`] || 0) + 1).toString()
            }
        });
    }else{
        throw Error("Golfclub upgrade not available on " + ItemInstanceId);
    }

    checkBoostTimers({PlayFabId:currentPlayerId, _UserInventory:Inventory});

    function getMaterialCost(){
        const upgradeCosts = [10,20,30,60,120];
        return upgradeCosts[golfclub.CustomData[`attribute_${attribute}`] || 0];
    }
}

function getLevelFromAttributes(golfClub){
    return  1 + Number(golfClub.CustomData?.attribute_power || 0) +
            Number(golfClub.CustomData?.attribute_control || 0) +
            Number(golfClub.CustomData?.attribute_aim || 0);
}