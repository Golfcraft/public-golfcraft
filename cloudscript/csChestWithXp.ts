import { getLevelInfo } from "../common/utils";
import {checkBoostTimers, executeDiamondDropTable, executeTrainingBoostDropTable, grantTrainingBoost} from "./csBonus";
declare const http:any;
const _apiKey = _PLAYFAB_API_KEY_;//TODO USE ANY ALGO TO AVOID SETTING PLAIN SECRET HERE
const catalogCache:{Catalog?:any} = {};

handlers.unlockAll = ({apiKey, DisplayName, PlayFabId}) => {
    if(apiKey !== _apiKey) throw Error("protected");
    const {InfoResultPayload} = server.GetPlayerCombinedInfo({
        PlayFabId,
        InfoRequestParameters:{
            GetUserInventory:true,
            GetUserVirtualCurrency:true,
        }
    });
    const UserInventory = InfoResultPayload.UserInventory;
    const chests = UserInventory.filter(i=>i.ItemClass === "Chest");
    const {Catalog} = catalogCache.Catalog
                        ? ({Catalog:catalogCache.Catalog})
                        : server.GetCatalogItems({
                            CatalogVersion:"GolfCraft"
                        });
    catalogCache.Catalog = Catalog;   

    let allGrantedItems = [];
    let allVirtualCurrency:any = {};
    let allXp = 0;
    let allReceivedTrainingBoost = [];

    chests.forEach(chest=>{
        const ContainerItem = Catalog.find(i => i.ItemId === chest.ItemId);
        const xp = Number(JSON.parse(ContainerItem.CustomData || null)?.xp || 0);//CustomData is always string
        const {GrantedItems, VirtualCurrency} = server.UnlockContainerInstance({
            PlayFabId,
            ContainerItemInstanceId:chest.ItemInstanceId
        });
        log.debug("unlock result", {GrantedItems, VirtualCurrency});
        const receivedDiamonds = executeDiamondDropTable({apiKey:_apiKey, PlayFabId, _UserInventory:undefined, TableId:getDiamondTableIdFromChestInstance(chest)});
        const receivedTrainingBoost = executeTrainingBoostDropTable({apiKey:_apiKey, PlayFabId, _UserInventory:undefined});
        
        allGrantedItems = [...allGrantedItems, ...GrantedItems];
        VirtualCurrency && Object.keys(VirtualCurrency).forEach(key=>{
            allVirtualCurrency[key] = Number(allVirtualCurrency[key] || 0) + VirtualCurrency[key]
        });
        if(receivedDiamonds){
            allVirtualCurrency.DM = (allVirtualCurrency.DM||0) + receivedDiamonds;
        }
        allXp += xp;
        if(receivedTrainingBoost) allReceivedTrainingBoost = [...allReceivedTrainingBoost, receivedTrainingBoost]
    });

    server.UpdatePlayerStatistics({
        PlayFabId,
        Statistics:Object.keys(InfoResultPayload.UserVirtualCurrency).map((StatisticName)=>{
            return {
                StatisticName,
                Value:Number(InfoResultPayload.UserVirtualCurrency[StatisticName])
            }
        })
    })

    return {
        GrantedItems:[...allGrantedItems, ...allReceivedTrainingBoost],
        VirtualCurrency:allVirtualCurrency,
        xp:allXp
    }
};

handlers.unlockWithXp = unlockWithXp;
handlers.increaseXp = increaseXp;

function unlockWithXp ({apiKey, DisplayName, PlayFabId, ContainerItemId}) {
    if(apiKey !== _apiKey) throw Error("protected");
    const {Catalog} = catalogCache.Catalog
                        ? ({Catalog:catalogCache.Catalog})
                        : server.GetCatalogItems({
                            CatalogVersion:"GolfCraft"
                        });
    catalogCache.Catalog = Catalog;                        
    
    const ContainerItem = Catalog.find(i => i.ItemId === ContainerItemId);
    const xp = Number(JSON.parse(ContainerItem.CustomData || null)?.xp || 0);//CustomData is always string
    const {InfoResultPayload} = server.GetPlayerCombinedInfo({
        PlayFabId,
        InfoRequestParameters:{
            GetUserInventory:true,
            GetUserVirtualCurrency:true,
        }
    });
    const Inventory = InfoResultPayload.UserInventory;
    const chests = Inventory.filter(c=>c.ItemId === ContainerItemId);
    if(!chests?.length) throw Error("not found");

    increaseXp({PlayFabId, Amount:xp});

    const {GrantedItems, VirtualCurrency} = server.UnlockContainerInstance({
        PlayFabId,
        ContainerItemInstanceId:chests[0].ItemInstanceId
    });
    const receivedDiamonds = executeDiamondDropTable({apiKey:_apiKey, PlayFabId, _UserInventory:undefined, TableId:getDiamondTableIdFromChestInstance(chests[0])})
    const receivedTrainingBoost = executeTrainingBoostDropTable({apiKey:_apiKey, PlayFabId, _UserInventory:undefined});

    /* if(DisplayName && GrantedItems.find(g=>g.ItemId === "Gem")){
        http.request(
            "https://discord.com/api/webhooks/898352390481252373/3zgQ4HZ_iVnK2_ra31N0JmsTolllHo9b-NRFNCpV4huButPp5srYkp52qqy4lu6cNMFB",
            "post",
            JSON.stringify({username:"Bot", content:`${DisplayName} got a diamond 💎`}),
            `application/json`,
            null,
            true
        );
    } */
    checkBoostTimers({PlayFabId, _UserInventory:undefined});

    server.UpdatePlayerStatistics({
        PlayFabId,
        Statistics:Object.keys(InfoResultPayload.UserVirtualCurrency).map((StatisticName)=>{
            return {
                StatisticName,
                Value:Number(InfoResultPayload.UserVirtualCurrency[StatisticName])
            }
        })
    })

    return {
        GrantedItems:receivedTrainingBoost?[...GrantedItems, receivedTrainingBoost]:GrantedItems,
        VirtualCurrency:{...VirtualCurrency, DM: receivedDiamonds||undefined},
        xp
    };
}

function getDiamondTableIdFromChestInstance(chest){
    if(chest.ItemId === "ChestTier1Winner1"){
        return "Tier1GemWinner"
    }else if(chest.ItemId === "ChestTier1Winner2"){
        return "Tier1GemSecond"
    }else if(chest.ItemId === "ChestTier1Winner3"){
        return "Tier1GemThird"
    }
}

function increaseXp({PlayFabId, Amount}) {
    const {Data} = server.GetUserReadOnlyData({
        PlayFabId
    });
    const oldXpValue = Number(Data?.xp?.Value || 0);
    const newXp = oldXpValue + Amount;
    if(getLevelInfo(newXp).currentLevel > getLevelInfo(oldXpValue).currentLevel){
        grantTrainingBoost({
            PlayFabId,
            Amount:1,
            _UserInventory:undefined,
            apiKey:_apiKey
        })
    }
    server.UpdateUserReadOnlyData({
        PlayFabId,
        Data:{
            xp:newXp
        },
        Permission:"public"
    });
}

