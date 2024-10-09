import { checkBoostTimers } from './csBonus';

handlers.initializePlayer = ({user, signature, message}) => { //TODO also send and match signature (AddGenericID signature? or userReadOnlyData once verified signature?)
    const {publicKey, displayName, hasConnectedWeb3, userId} = user;
    server.AddGenericID({
        PlayFabId:currentPlayerId,
        GenericId: {
            "ServiceName": "address",
            "UserId": publicKey || "testUser1"
        }
    });
    
    server.GrantItemsToUser({
        PlayFabId:currentPlayerId,
        ItemIds:['golfclub-1']
    });
    const {InfoResultPayload} = server.GetPlayerCombinedInfo({//TODO review all data necessary?
        PlayFabId:currentPlayerId,
        InfoRequestParameters:{
            GetCharacterInventories: false,
            GetCharacterList: false,
            GetPlayerProfile: true,
            GetPlayerStatistics: true,
            GetTitleData: true,
            GetUserAccountInfo: true,
            GetUserData: true,
            GetUserInventory: true,
            GetUserReadOnlyData: true,
            GetUserVirtualCurrency: true
        }
    });

    let currentTrainingID = InfoResultPayload?.UserReadOnlyData?.currentTrainingID?.Value || "1";//TODO training tutorials
    let currentTrainingCourseID = InfoResultPayload?.UserReadOnlyData?.currentTrainingCourseID?.Value || "training-1-1";
    
    if(!InfoResultPayload.UserReadOnlyData.initialized?.Value 
        || !InfoResultPayload.UserReadOnlyData.currentTrainingCourseID?.Value //TODO remove, not necessary for first player login once release
        ){
        server.UpdateUserReadOnlyData({
            PlayFabId:currentPlayerId,
            Data:{
                initialized:"1",
                currentTrainingID,
                currentTrainingCourseID,
                selectedGolfclubTokenId:"0",
                migratedGolfclub:"1",//golfclub returned diamonds, for new player, it is already migrated.
            },
            Permission:"public"
        });
    }

    checkBoostTimers({PlayFabId:currentPlayerId, _UserInventory:InfoResultPayload.UserInventory});
    
    return {
        ...InfoResultPayload,
        UserReadOnlyData:{
            ...InfoResultPayload.UserReadOnlyData,
            currentTrainingID:{
                ...InfoResultPayload.UserReadOnlyData.currentTrainingID,
                "Value": currentTrainingID
            },
            currentTrainingCourseID:{
                ...InfoResultPayload.UserReadOnlyData.currentTrainingCourseID,
                "Value": currentTrainingCourseID
            },
            initialized:{
                ...InfoResultPayload.UserReadOnlyData.initialized,
                "Value": "1"
            }
        },
        error:null
    } as PlayFabServerModels.GetPlayerCombinedInfoResult    
}