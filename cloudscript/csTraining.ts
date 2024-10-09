import {promisify} from "util";

const _apiKey = _PLAYFAB_API_KEY_;//TODO USE ANY ALGO TO AVOID SETTING PLAIN SECRET HERE
import { getLevelInfo } from "../common/utils";
import {
    checkBoostTimers,
    getBonusFromUserInventory,
    getUserBonus,
    grantTrainingBoost,
    MAX_WEARABLES_BONUS
} from "./csBonus";

handlers.getGolfClubBonus = () => {
    const {InfoResultPayload} = server.GetPlayerCombinedInfo({
        PlayFabId:currentPlayerId,
        InfoRequestParameters:{
            GetUserInventory:true,
            GetUserVirtualCurrency:true,
            GetUserReadOnlyData:true,
            GetUserData:true
        }
    });
    return getBonusFromUserInventory(InfoResultPayload.UserInventory);
};

handlers.increaseGolfclubXp = increaseGolfclubXp;

handlers.completeTraining = ({
    apiKey, 
    PlayFabId, 
    trainingID,
    success,
    playedTime,
    xp,
    PT = 0,
    GC,
    materialDrops
}) => {
    if(apiKey !== _apiKey) throw new Error("protected");   

    const {InfoResultPayload} = server.GetPlayerCombinedInfo({
        PlayFabId,
        InfoRequestParameters:{
            GetUserInventory:true,
            GetUserVirtualCurrency:true,
            GetUserReadOnlyData:true
        }
    });
    const StatisticName = success?'training_success':'training_failed';
    const oldCourseId = InfoResultPayload.UserReadOnlyData.currentTrainingCourseID.Value;
    const oldDataValue = Number(InfoResultPayload.UserReadOnlyData[StatisticName]?.Value || 0);
    const oldXpValue = Number(InfoResultPayload.UserReadOnlyData.xp?.Value || 0);
    const oldPlayedTimeValue = Number(InfoResultPayload.UserReadOnlyData[`training_playedTime`]?.Value || 0);   
   // const currentTrainingID = getRandomFromList([1,1,2,2,2,3,4,4,4,4]).toString();
    const baseXpReward = (xp || 10);
    const bonusMultiplier = getUserBonus({PlayFabId}).training;
    const xpReward = success && Math.floor(Number(baseXpReward)*bonusMultiplier) || 0;//TODO
    const newXpValue = oldXpValue + xpReward;
    const DataToWrite = {
        [StatisticName]: oldDataValue + 1,
        training_playedTime:oldPlayedTimeValue+playedTime,
    //    currentTrainingID,
    //    currentTrainingCourseID:pinkTrainingCourseIdForLevel(currentTrainingID, getLevelInfo(newXpValue).currentLevel)
    };
    if(getLevelInfo(newXpValue).currentLevel > getLevelInfo(oldXpValue).currentLevel && getLevelInfo(newXpValue).currentLevel % 3 === 0){
        grantTrainingBoost({
            apiKey:_apiKey,
            PlayFabId:currentPlayerId,
            Amount:1,
            _UserInventory:InfoResultPayload.UserInventory
        })
    } 
    const STANDARD_GOLFCLUB_ITEM_ID = "golfclub-1";
    if(success) {
        DataToWrite.xp = newXpValue;
        increaseGolfclubXp({
            xpReward,
            UserInventory:InfoResultPayload.UserInventory,
            PlayFabId:currentPlayerId})
    }
    server.UpdateUserReadOnlyData({
        PlayFabId,
        Data: DataToWrite,
        Permission:"public"
    });
    
    server.UpdatePlayerStatistics({
        PlayFabId,        
        CustomTags:{"courseId":oldCourseId},
        Statistics:[
            {
                StatisticName,                
                Value:1,
            },
            {
                StatisticName:`training_playedTime`,
                Value:playedTime
            }
        ]
    });
    const gcReward = success && Math.floor((GC || 5)*bonusMultiplier) || 0;//TODO move to course metadata? or per training minLevel?
    const ptReward = success && PT || 0;
    server.AddUserVirtualCurrency({
        PlayFabId,
        VirtualCurrency:"GC",
        Amount:gcReward
    });
    server.AddUserVirtualCurrency({
        PlayFabId,
        VirtualCurrency:"PT",
        Amount:ptReward
    });
    materialDrops && Object.keys(materialDrops).forEach((materialKey)=>{
        server.AddUserVirtualCurrency({
            PlayFabId,
            VirtualCurrency:materialKey,
            Amount:materialDrops[materialKey]
        });
    });

    checkBoostTimers({PlayFabId, _UserInventory:undefined});

    server.UpdatePlayerStatistics({
        PlayFabId,
        Statistics:[
            {
                "StatisticName": "GC",
                "Value": InfoResultPayload.UserVirtualCurrency.GC + gcReward
            }
        ]
    });

    return {
        xp:xpReward||0,
        GC:gcReward,
        PT:ptReward||0
    };
}
handlers.completeSeasonMap = completeSeasonMap;

function completeSeasonMap({
                               PlayFabId = currentPlayerId,
                               UserInventory = server.GetUserInventory({PlayFabId}).Inventory,
                               xpReward = 10,
                               rewards,
                               tierSub = 0,
                               playerTierSub = 0,
                               UserReadOnlyData = server.GetUserReadOnlyData({PlayFabId}).Data,
    apiKey
}){
    if(apiKey !== _apiKey) throw new Error("protected");
    const oldXpValue = Number(UserReadOnlyData.xp?.Value || 0);
    const newXpValue = oldXpValue + xpReward;

    if(tierSub){
        let Statistics = [{
            StatisticName: "season-game-completed",
            Value: 1
        }];
        if ((playerTierSub + tierSub) >= 0) {
            Statistics = [{
                StatisticName: "season-game-completed",
                Value: 1
            },
                {
                    StatisticName: "tier-sub",//leaderboard method:sum
                    Value: tierSub,
                }, {
                    StatisticName: "tier-sub-max",//leaderboard method:max
                    Value: playerTierSub + tierSub
                }
            ];
        }
        server.UpdatePlayerStatistics({
                PlayFabId, Statistics,
             CustomTags:{"completed-season-game":"yes"}
            }
        );
    }

    for( let currencyKey in rewards){
        server.AddUserVirtualCurrency({PlayFabId, VirtualCurrency:currencyKey,Amount:rewards[currencyKey]});
    }

    increaseGolfclubXp({xpReward, UserInventory, PlayFabId});

    server.UpdateUserReadOnlyData({
        PlayFabId,
        Data: {
            xp:newXpValue
        },
        Permission:"public"
    });

    return {done:true}
}
handlers.completeMission = completeMission;

function completeMission({PlayFabId, currentMission}){
    const _PlayFabId = PlayFabId || currentPlayerId;
    const UserInventory = server.GetUserInventory({PlayFabId});

    increaseGolfclubXp({xpReward:3, UserInventory, PlayFabId});

    return server.UpdatePlayerStatistics({
        PlayFabId,
        Statistics:[{StatisticName:"current_mission", Value:1 + currentMission}]
    });
}

function increaseGolfclubXp({xpReward, UserInventory, PlayFabId}) {
    const _PlayFabId = PlayFabId || currentPlayerId;
    const STANDARD_GOLFCLUB_ITEM_ID = "golfclub-1";
    const activeGolfClub = (UserInventory.Inventory||UserInventory).find(i=>i.ItemId === STANDARD_GOLFCLUB_ITEM_ID);//TODO review if find by tokenId (0)
    const currentGolfclubXp = Number(activeGolfClub.CustomData?.xp || 0);
    const nextGolfclubXp = currentGolfclubXp + xpReward;

    server.UpdateUserInventoryItemCustomData({
        PlayFabId:_PlayFabId,
        ItemInstanceId:activeGolfClub.ItemInstanceId,
        Data:{
            xp:nextGolfclubXp.toString()
        }
    });

}