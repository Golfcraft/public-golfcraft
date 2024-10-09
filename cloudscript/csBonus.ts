import {GOLF_CLUB_BONUSES, MAX_BONUS_GOLFCLUB} from "../common/constants";
const _apiKey = _PLAYFAB_API_KEY_;

export const MAX_WEARABLES_BONUS = 50;
const MS_HOUR = 1000 * 60 * 60;

export function getGolfClubIdFromItemId(ItemId){
    return ItemId.replace('golfclub-','');
}

export function getGolfClubBonus(golfClubId){
    return GOLF_CLUB_BONUSES[golfClubId] && (GOLF_CLUB_BONUSES[golfClubId]/100) || 0;
}

export function getBonusFromUserInventory(UserInventory, excludeBoost?){//includes 1.x for multiplication and training bonus
    const golfclubsWithBonus = UserInventory
        .filter(i=>i.ItemClass==="Golfclub" && GOLF_CLUB_BONUSES[getGolfClubIdFromItemId(i.ItemId)])
    const uniqItemIds = Object.keys(golfclubsWithBonus.reduce((acc, current)=>{
        acc[current.ItemId] = true;
        return acc;
    },{}));

    const golfClubBonus = uniqItemIds
        .reduce((acc, ItemId)=>{
            const golfClubId = getGolfClubIdFromItemId(ItemId);
            const golfClubBonus = getGolfClubBonus(golfClubId);//0.x
            return golfClubBonus?(acc + golfClubBonus):acc;
        },0);
    const hasTrainingBoost = !excludeBoost && UserInventory.find(i=>i.ItemClass === "TrainingBoost");
    return 1 + Math.min(MAX_BONUS_GOLFCLUB, golfClubBonus) + (hasTrainingBoost?1:0);
}

export function getUserBonus({PlayFabId}){
    const {InfoResultPayload} = server.GetPlayerCombinedInfo({
        PlayFabId,
        InfoRequestParameters:{
            GetUserInventory:true,
            GetUserVirtualCurrency:true,
            GetUserReadOnlyData:true
        }
    });
    const inventoryBonusWithBoost = getBonusFromUserInventory(InfoResultPayload.UserInventory);//includes 1.x
   // const inventoryBonusWithoutBoost = getBonusFromUserInventory(InfoResultPayload.UserInventory, true);//includes 1.x
    const wearableBonusDataValue = InfoResultPayload.UserReadOnlyData.wearablesBonus?.Value && Number(InfoResultPayload.UserReadOnlyData.wearablesBonus?.Value) || 0;
    const wearablesBonus = (Number(Math.min(wearableBonusDataValue, MAX_WEARABLES_BONUS))/100);//0.x
    const resultBonus = inventoryBonusWithBoost+wearablesBonus

    return {
        training: resultBonus,
        materials: 1 + ((resultBonus-1)/5)
    }
}



handlers.getUserBonus = getUserBonus;
handlers.grantTrainingBoost = grantTrainingBoost;
handlers.executeTrainingBoostDropTable = executeTrainingBoostDropTable;
handlers.checkBoostTimers = checkBoostTimers;
handlers.getBonusFromUserInventory = ({PlayFabId, excludeBoost})=>{
    const {InfoResultPayload} = server.GetPlayerCombinedInfo({
        PlayFabId,
        InfoRequestParameters:{
            GetUserInventory:true,
            GetUserVirtualCurrency:true,
            GetUserReadOnlyData:true
        }
    });
    return getBonusFromUserInventory(InfoResultPayload.UserInventory, excludeBoost);
};

export function checkBoostTimers(params, context?){
    const {PlayFabId, _UserInventory} = params || {};
    const _PlayFabId = (context && currentPlayerId) || PlayFabId || context?.playerProfile?.PlayerId;
    log.debug("PlayFabId", {currentPlayerId, PlayFabId, contextPlayerId:context?.playerProfile?.PlayerId});

    let UserInventory = _UserInventory || server.GetUserInventory({PlayFabId:_PlayFabId}).Inventory;
    let trainingBoostItem = UserInventory.find(i=>i.ItemClass === "TrainingBoost");
    if(trainingBoostItem){
        const amount = trainingBoostItem.RemainingUses||0;
        const fallbackExpirationTime =  new Date(trainingBoostItem.PurchaseDate).getTime() + amount*MS_HOUR;
        const currentDateISO = new Date().toISOString();
        const expirationDate = (trainingBoostItem.CustomData?.Expiration || trainingBoostItem.Expiration || new Date(fallbackExpirationTime).toISOString())
        if(currentDateISO > expirationDate){
            server["RevokeInventoryItem"]({
                PlayFabId:_PlayFabId,
                ItemInstanceId:trainingBoostItem.ItemInstanceId
            })
        }
    }
}
type executeTrainingBoostDropTableParams = {
    apiKey:string
    PlayFabId:string,
    TableId?:string,
    _UserInventory?:any
}
export function executeTrainingBoostDropTable({apiKey, PlayFabId, _UserInventory, TableId}:executeTrainingBoostDropTableParams){
    if(apiKey !== _apiKey) throw Error("protected");
    const ResultItemId = server["EvaluateRandomResultTable"]({TableId:TableId || "Tier1BoostSecond"})?.ResultItemId;
    if(ResultItemId && ResultItemId !== "Null"){
        return grantTrainingBoost({apiKey:_apiKey, PlayFabId, Amount:1, _UserInventory:_UserInventory});
    }else{
        return false;
    }
}

export function executeDiamondDropTable({apiKey, PlayFabId, _UserInventory, TableId}:executeTrainingBoostDropTableParams):number{
    if(apiKey !== _apiKey) throw Error("protected");
    const ResultItemId = server["EvaluateRandomResultTable"]({TableId:TableId || "Tier1GemSecond"})?.ResultItemId;
    if(ResultItemId && ResultItemId !== "Null"){
        server.AddUserVirtualCurrency({
            PlayFabId,
            VirtualCurrency:"DM",
            Amount:1
        });
        return 1;
    }else{
        return 0;
    }
}


export function grantTrainingBoost({apiKey, PlayFabId, Amount, _UserInventory}){
    if(apiKey !== _apiKey) throw Error("protected");
    //TODO check if user already have item
        //TODO if has CustomData?.Expiration, add Amount in hours
        //TODO if CustomData?.Expiration is not defined, get Expiration data and add Amount in hours
    let UserInventory = _UserInventory || server.GetUserInventory({PlayFabId}).Inventory;
    let trainingBoostItem = UserInventory.find(i=>i.ItemClass === "TrainingBoost");

    if(trainingBoostItem){
        //TODO PurchaseDate
        let Expiration = trainingBoostItem.CustomData?.Expiration || trainingBoostItem.Expiration || undefined;
        const newExpirationDateISO = getNewExpirationISO(Amount, Expiration);
        server.UpdateUserInventoryItemCustomData({
            PlayFabId,
            ItemInstanceId:trainingBoostItem.ItemInstanceId,
            Data:{
                Expiration:newExpirationDateISO
            }
        });
    }else{
        const newExpirationDateISO = getNewExpirationISO(Amount);
        trainingBoostItem = server.GrantItemsToUser({
            PlayFabId,
            ItemIds:["trainingBoost"]
        }).ItemGrantResults[0];
        server.UpdateUserInventoryItemCustomData({
            PlayFabId,
            ItemInstanceId:trainingBoostItem.ItemInstanceId,
            Data:{
                Expiration:newExpirationDateISO
            }
        });
    }
    return trainingBoostItem;

    function getNewExpirationISO(Amount, Expiration?){
        const baseExpirationTime = (Expiration && Expiration > new Date().toISOString())
                                    ? new Date(Expiration).getTime()
                                    : new Date().getTime();

        return new Date(baseExpirationTime + Amount * MS_HOUR ).toISOString();
    }

}