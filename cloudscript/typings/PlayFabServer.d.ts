/// <reference path="./PlayFabServerModels.d.ts" />
type Log = {
    debug:(key:string, value:any)=>any
}
declare const handlers:any;
declare const currentPlayerId:string;
declare const server:PlayFabServerModule.IPlayFabServer;
declare const log:Log;

declare module PlayFabServerModule {
    export interface IPlayFabServer {
        // Returns whatever info is requested in the response for the user. Note that PII (like email address, facebook id) may be
        // returned. All parameters default to false.
        // https://docs.microsoft.com/rest/api/playfab/server/player-data-management/getplayercombinedinfo
        GetPlayerCombinedInfo(
            request: PlayFabServerModels.GetPlayerCombinedInfoRequest
        ): PlayFabServerModels.GetPlayerCombinedInfoResult;

         // Updates the title-specific custom data for the user which can only be read by the client
        // https://docs.microsoft.com/rest/api/playfab/server/player-data-management/updateuserreadonlydata
        UpdateUserReadOnlyData(
            request: PlayFabServerModels.UpdateUserDataRequest          
        ): PlayFabServerModels.UpdateUserDataResult;
        
        // Retrieves the title-specific custom data for the user which can only be read by the client
        // https://docs.microsoft.com/rest/api/playfab/server/player-data-management/getuserreadonlydata
        GetUserReadOnlyData(
            request: PlayFabServerModels.GetUserDataRequest
        ): PlayFabServerModels.GetUserDataResult;

        // Updates the values of the specified title-specific statistics for the user
        // https://docs.microsoft.com/rest/api/playfab/server/player-data-management/updateplayerstatistics
        UpdatePlayerStatistics(
            request: PlayFabServerModels.UpdatePlayerStatisticsRequest            
        ): PlayFabServerModels.UpdatePlayerStatisticsResult;

        // Increments the user's balance of the specified virtual currency by the stated amount
        // https://docs.microsoft.com/rest/api/playfab/server/player-item-management/adduservirtualcurrency
        AddUserVirtualCurrency(
            request: PlayFabServerModels.AddUserVirtualCurrencyRequest
        ): PlayFabServerModels.ModifyUserVirtualCurrencyResult;

        // Adds the specified generic service identifier to the player's PlayFab account. This is designed to allow for a PlayFab
        // ID lookup of any arbitrary service identifier a title wants to add. This identifier should never be used as
        // authentication credentials, as the intent is that it is easily accessible by other players.
        // https://docs.microsoft.com/rest/api/playfab/server/account-management/addgenericid
        AddGenericID(
            request: PlayFabServerModels.AddGenericIDRequest | null            
        ): PlayFabServerModels.EmptyResult;

         // Searches Player or Character inventory for any ItemInstance matching the given CatalogItemId, if necessary unlocks it
        // using any appropriate key, and returns the contents of the opened container. If the container (and key when relevant)
        // are consumable (RemainingUses > 0), their RemainingUses will be decremented, consistent with the operation of
        // ConsumeItem.
        // https://docs.microsoft.com/rest/api/playfab/server/player-item-management/unlockcontaineritem
        UnlockContainerItem(
            request: PlayFabServerModels.UnlockContainerItemRequest            
        ): PlayFabServerModels.UnlockContainerItemResult;

         // Retrieves the specified version of the title's catalog of virtual goods, including all defined properties
        // https://docs.microsoft.com/rest/api/playfab/server/title-wide-data-management/getcatalogitems
        GetCatalogItems(
            request: PlayFabServerModels.GetCatalogItemsRequest            
        ): PlayFabServerModels.GetCatalogItemsResult;

        GrantItemsToUser(
            request: PlayFabServerModels.GrantItemsToUserRequest
        ): PlayFabServerModels.GrantItemsToUsersResult;

        UpdateUserInventoryItemCustomData(
            request: PlayFabServerModels.UpdateUserInventoryItemDataRequest
        ): PlayFabServerModels.EmptyResponse

        GetUserInventory(
            request: PlayFabServerModels.GetUserInventoryRequest
        ): PlayFabServerModels.GetUserInventoryResult

        ConsumeItem(
            request: PlayFabServerModels.ConsumeItemRequest
        ): PlayFabServerModels.ConsumeItemResult
    }
}