declare module PlayFabServerModels {
    export interface AdCampaignAttribution {
        // UTC time stamp of attribution
        AttributedAt: string;
        // Attribution campaign identifier
        CampaignId?: string;
        // Attribution network name
        Platform?: string;
    }

    export interface AdCampaignAttributionModel {
        // UTC time stamp of attribution
        AttributedAt: string;
        // Attribution campaign identifier
        CampaignId?: string;
        // Attribution network name
        Platform?: string;
    }

    export interface AddCharacterVirtualCurrencyRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Amount to be added to the character balance of the specified virtual currency. Maximum VC balance is Int32
        // (2,147,483,647). Any increase over this value will be discarded.
        Amount: number;
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId: string;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // PlayFab unique identifier of the user whose virtual currency balance is to be incremented.
        PlayFabId: string;
        // Name of the virtual currency which is to be incremented.
        VirtualCurrency: string;
    }

    export interface AddFriendRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Email address of the user being added.
        FriendEmail?: string;
        // The PlayFab identifier of the user being added.
        FriendPlayFabId?: string;
        // Title-specific display name of the user to being added.
        FriendTitleDisplayName?: string;
        // The PlayFab username of the user being added
        FriendUsername?: string;
        // PlayFab identifier of the player to add a new friend.
        PlayFabId: string;
    }

    export interface AddGenericIDRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Generic service identifier to add to the player account.
        GenericId: GenericServiceId;
        // PlayFabId of the user to link.
        PlayFabId: string;
    }

    export interface AddPlayerTagRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
        // Unique tag for player profile.
        TagName: string;
    }

    export interface AddPlayerTagResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface AddSharedGroupMembersRequest extends PlayFabModule.IPlayFabRequestCommon {
        // An array of unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabIds: string[];
        // Unique identifier for the shared group.
        SharedGroupId: string;
    }

    export interface AddSharedGroupMembersResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface AddUserVirtualCurrencyRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Amount to be added to the user balance of the specified virtual currency. Maximum VC balance is Int32 (2,147,483,647).
        // Any increase over this value will be discarded.
        Amount: number;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // PlayFab unique identifier of the user whose virtual currency balance is to be increased.
        PlayFabId: string;
        // Name of the virtual currency which is to be incremented.
        VirtualCurrency: string;
    }

    export interface AdvancedPushPlatformMsg {
        // Stops GoogleCloudMessaging notifications from including both notification and data properties and instead only sends the
        // data property.
        GCMDataOnly?: boolean;
        // The Json the platform should receive.
        Json: string;
        // The platform that should receive the Json.
        Platform: string;
    }

    export interface AuthenticateSessionTicketRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Session ticket as issued by a PlayFab client login API.
        SessionTicket: string;
    }

    export interface AuthenticateSessionTicketResult extends PlayFabModule.IPlayFabResultCommon {
        // Indicates if token was expired at request time.
        IsSessionTicketExpired?: boolean;
        // Account info for the user whose session ticket was supplied.
        UserInfo?: UserAccountInfo;
    }

    export interface AwardSteamAchievementItem {
        // Unique Steam achievement name.
        AchievementName: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
        // Result of the award attempt (only valid on response, not on request).
        Result: boolean;
    }

    export interface AwardSteamAchievementRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Array of achievements to grant and the users to whom they are to be granted.
        Achievements: AwardSteamAchievementItem[];
    }

    export interface AwardSteamAchievementResult extends PlayFabModule.IPlayFabResultCommon {
        // Array of achievements granted.
        AchievementResults?: AwardSteamAchievementItem[];
    }

    export interface BanInfo {
        // The active state of this ban. Expired bans may still have this value set to true but they will have no effect.
        Active: boolean;
        // The unique Ban Id associated with this ban.
        BanId?: string;
        // The time when this ban was applied.
        Created?: string;
        // The time when this ban expires. Permanent bans do not have expiration date.
        Expires?: string;
        // The IP address on which the ban was applied. May affect multiple players.
        IPAddress?: string;
        // The MAC address on which the ban was applied. May affect multiple players.
        MACAddress?: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId?: string;
        // The reason why this ban was applied.
        Reason?: string;
    }

    export interface BanRequest {
        // The duration in hours for the ban. Leave this blank for a permanent ban.
        DurationInHours?: number;
        // IP address to be banned. May affect multiple players.
        IPAddress?: string;
        // MAC address to be banned. May affect multiple players.
        MACAddress?: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
        // The reason for this ban. Maximum 140 characters.
        Reason?: string;
    }

    export interface BanUsersRequest extends PlayFabModule.IPlayFabRequestCommon {
        // List of ban requests to be applied. Maximum 100.
        Bans: BanRequest[];
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
    }

    export interface BanUsersResult extends PlayFabModule.IPlayFabResultCommon {
        // Information on the bans that were applied
        BanData?: BanInfo[];
    }

    export interface CatalogItem {
        // defines the bundle properties for the item - bundles are items which contain other items, including random drop tables
        // and virtual currencies
        Bundle?: CatalogItemBundleInfo;
        // if true, then an item instance of this type can be used to grant a character to a user.
        CanBecomeCharacter: boolean;
        // catalog version for this item
        CatalogVersion?: string;
        // defines the consumable properties (number of uses, timeout) for the item
        Consumable?: CatalogItemConsumableInfo;
        // defines the container properties for the item - what items it contains, including random drop tables and virtual
        // currencies, and what item (if any) is required to open it via the UnlockContainerItem API
        Container?: CatalogItemContainerInfo;
        // game specific custom data
        CustomData?: string;
        // text description of item, to show in-game
        Description?: string;
        // text name for the item, to show in-game
        DisplayName?: string;
        // If the item has IsLImitedEdition set to true, and this is the first time this ItemId has been defined as a limited
        // edition item, this value determines the total number of instances to allocate for the title. Once this limit has been
        // reached, no more instances of this ItemId can be created, and attempts to purchase or grant it will return a Result of
        // false for that ItemId. If the item has already been defined to have a limited edition count, or if this value is less
        // than zero, it will be ignored.
        InitialLimitedEditionCount: number;
        // BETA: If true, then only a fixed number can ever be granted.
        IsLimitedEdition: boolean;
        // if true, then only one item instance of this type will exist and its remaininguses will be incremented instead.
        // RemainingUses will cap out at Int32.Max (2,147,483,647). All subsequent increases will be discarded
        IsStackable: boolean;
        // if true, then an item instance of this type can be traded between players using the trading APIs
        IsTradable: boolean;
        // class to which the item belongs
        ItemClass?: string;
        // unique identifier for this item
        ItemId: string;
        // URL to the item image. For Facebook purchase to display the image on the item purchase page, this must be set to an HTTP
        // URL.
        ItemImageUrl?: string;
        // override prices for this item for specific currencies
        RealCurrencyPrices?: { [key: string]: number };
        // list of item tags
        Tags?: string[];
        // price of this item in virtual currencies and "RM" (the base Real Money purchase price, in USD pennies)
        VirtualCurrencyPrices?: { [key: string]: number };
    }

    export interface CatalogItemBundleInfo {
        // unique ItemId values for all items which will be added to the player inventory when the bundle is added
        BundledItems?: string[];
        // unique TableId values for all RandomResultTable objects which are part of the bundle (random tables will be resolved and
        // add the relevant items to the player inventory when the bundle is added)
        BundledResultTables?: string[];
        // virtual currency types and balances which will be added to the player inventory when the bundle is added
        BundledVirtualCurrencies?: { [key: string]: number };
    }

    export interface CatalogItemConsumableInfo {
        // number of times this object can be used, after which it will be removed from the player inventory
        UsageCount?: number;
        // duration in seconds for how long the item will remain in the player inventory - once elapsed, the item will be removed
        // (recommended minimum value is 5 seconds, as lower values can cause the item to expire before operations depending on
        // this item's details have completed)
        UsagePeriod?: number;
        // all inventory item instances in the player inventory sharing a non-null UsagePeriodGroup have their UsagePeriod values
        // added together, and share the result - when that period has elapsed, all the items in the group will be removed
        UsagePeriodGroup?: string;
    }

    export interface CatalogItemContainerInfo {
        // unique ItemId values for all items which will be added to the player inventory, once the container has been unlocked
        ItemContents?: string[];
        // ItemId for the catalog item used to unlock the container, if any (if not specified, a call to UnlockContainerItem will
        // open the container, adding the contents to the player inventory and currency balances)
        KeyItemId?: string;
        // unique TableId values for all RandomResultTable objects which are part of the container (once unlocked, random tables
        // will be resolved and add the relevant items to the player inventory)
        ResultTableContents?: string[];
        // virtual currency types and balances which will be added to the player inventory when the container is unlocked
        VirtualCurrencyContents?: { [key: string]: number };
    }

    export interface CharacterInventory {
        // The id of this character.
        CharacterId?: string;
        // The inventory of this character.
        Inventory?: ItemInstance[];
    }

    export interface CharacterLeaderboardEntry {
        // PlayFab unique identifier of the character that belongs to the user for this leaderboard entry.
        CharacterId?: string;
        // Title-specific display name of the character for this leaderboard entry.
        CharacterName?: string;
        // Name of the character class for this entry.
        CharacterType?: string;
        // Title-specific display name of the user for this leaderboard entry.
        DisplayName?: string;
        // PlayFab unique identifier of the user for this leaderboard entry.
        PlayFabId?: string;
        // User's overall position in the leaderboard.
        Position: number;
        // Specific value of the user's statistic.
        StatValue: number;
    }

    export interface CharacterResult {
        // The id for this character on this player.
        CharacterId?: string;
        // The name of this character.
        CharacterName?: string;
        // The type-string that was given to this character on creation.
        CharacterType?: string;
    }

    type CloudScriptRevisionOption = "Live"
        | "Latest"
        | "Specific";

    export interface ConsumeItemRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId?: string;
        // Number of uses to consume from the item.
        ConsumeCount: number;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Unique instance identifier of the item to be consumed.
        ItemInstanceId: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface ConsumeItemResult extends PlayFabModule.IPlayFabResultCommon {
        // Unique instance identifier of the item with uses consumed.
        ItemInstanceId?: string;
        // Number of uses remaining on the item.
        RemainingUses: number;
    }

    export interface ContactEmailInfo {
        // The email address
        EmailAddress?: string;
        // The name of the email info data
        Name?: string;
        // The verification status of the email
        VerificationStatus?: string;
    }

    export interface ContactEmailInfoModel {
        // The email address
        EmailAddress?: string;
        // The name of the email info data
        Name?: string;
        // The verification status of the email
        VerificationStatus?: string;
    }

    type ContinentCode = "AF"
        | "AN"
        | "AS"
        | "EU"
        | "NA"
        | "OC"
        | "SA";

    type CountryCode = "AF"
        | "AX"
        | "AL"
        | "DZ"
        | "AS"
        | "AD"
        | "AO"
        | "AI"
        | "AQ"
        | "AG"
        | "AR"
        | "AM"
        | "AW"
        | "AU"
        | "AT"
        | "AZ"
        | "BS"
        | "BH"
        | "BD"
        | "BB"
        | "BY"
        | "BE"
        | "BZ"
        | "BJ"
        | "BM"
        | "BT"
        | "BO"
        | "BQ"
        | "BA"
        | "BW"
        | "BV"
        | "BR"
        | "IO"
        | "BN"
        | "BG"
        | "BF"
        | "BI"
        | "KH"
        | "CM"
        | "CA"
        | "CV"
        | "KY"
        | "CF"
        | "TD"
        | "CL"
        | "CN"
        | "CX"
        | "CC"
        | "CO"
        | "KM"
        | "CG"
        | "CD"
        | "CK"
        | "CR"
        | "CI"
        | "HR"
        | "CU"
        | "CW"
        | "CY"
        | "CZ"
        | "DK"
        | "DJ"
        | "DM"
        | "DO"
        | "EC"
        | "EG"
        | "SV"
        | "GQ"
        | "ER"
        | "EE"
        | "ET"
        | "FK"
        | "FO"
        | "FJ"
        | "FI"
        | "FR"
        | "GF"
        | "PF"
        | "TF"
        | "GA"
        | "GM"
        | "GE"
        | "DE"
        | "GH"
        | "GI"
        | "GR"
        | "GL"
        | "GD"
        | "GP"
        | "GU"
        | "GT"
        | "GG"
        | "GN"
        | "GW"
        | "GY"
        | "HT"
        | "HM"
        | "VA"
        | "HN"
        | "HK"
        | "HU"
        | "IS"
        | "IN"
        | "ID"
        | "IR"
        | "IQ"
        | "IE"
        | "IM"
        | "IL"
        | "IT"
        | "JM"
        | "JP"
        | "JE"
        | "JO"
        | "KZ"
        | "KE"
        | "KI"
        | "KP"
        | "KR"
        | "KW"
        | "KG"
        | "LA"
        | "LV"
        | "LB"
        | "LS"
        | "LR"
        | "LY"
        | "LI"
        | "LT"
        | "LU"
        | "MO"
        | "MK"
        | "MG"
        | "MW"
        | "MY"
        | "MV"
        | "ML"
        | "MT"
        | "MH"
        | "MQ"
        | "MR"
        | "MU"
        | "YT"
        | "MX"
        | "FM"
        | "MD"
        | "MC"
        | "MN"
        | "ME"
        | "MS"
        | "MA"
        | "MZ"
        | "MM"
        | "NA"
        | "NR"
        | "NP"
        | "NL"
        | "NC"
        | "NZ"
        | "NI"
        | "NE"
        | "NG"
        | "NU"
        | "NF"
        | "MP"
        | "NO"
        | "OM"
        | "PK"
        | "PW"
        | "PS"
        | "PA"
        | "PG"
        | "PY"
        | "PE"
        | "PH"
        | "PN"
        | "PL"
        | "PT"
        | "PR"
        | "QA"
        | "RE"
        | "RO"
        | "RU"
        | "RW"
        | "BL"
        | "SH"
        | "KN"
        | "LC"
        | "MF"
        | "PM"
        | "VC"
        | "WS"
        | "SM"
        | "ST"
        | "SA"
        | "SN"
        | "RS"
        | "SC"
        | "SL"
        | "SG"
        | "SX"
        | "SK"
        | "SI"
        | "SB"
        | "SO"
        | "ZA"
        | "GS"
        | "SS"
        | "ES"
        | "LK"
        | "SD"
        | "SR"
        | "SJ"
        | "SZ"
        | "SE"
        | "CH"
        | "SY"
        | "TW"
        | "TJ"
        | "TZ"
        | "TH"
        | "TL"
        | "TG"
        | "TK"
        | "TO"
        | "TT"
        | "TN"
        | "TR"
        | "TM"
        | "TC"
        | "TV"
        | "UG"
        | "UA"
        | "AE"
        | "GB"
        | "US"
        | "UM"
        | "UY"
        | "UZ"
        | "VU"
        | "VE"
        | "VN"
        | "VG"
        | "VI"
        | "WF"
        | "EH"
        | "YE"
        | "ZM"
        | "ZW";

    export interface CreateSharedGroupRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique identifier for the shared group (a random identifier will be assigned, if one is not specified).
        SharedGroupId?: string;
    }

    export interface CreateSharedGroupResult extends PlayFabModule.IPlayFabResultCommon {
        // Unique identifier for the shared group.
        SharedGroupId?: string;
    }

    type Currency = "AED"
        | "AFN"
        | "ALL"
        | "AMD"
        | "ANG"
        | "AOA"
        | "ARS"
        | "AUD"
        | "AWG"
        | "AZN"
        | "BAM"
        | "BBD"
        | "BDT"
        | "BGN"
        | "BHD"
        | "BIF"
        | "BMD"
        | "BND"
        | "BOB"
        | "BRL"
        | "BSD"
        | "BTN"
        | "BWP"
        | "BYR"
        | "BZD"
        | "CAD"
        | "CDF"
        | "CHF"
        | "CLP"
        | "CNY"
        | "COP"
        | "CRC"
        | "CUC"
        | "CUP"
        | "CVE"
        | "CZK"
        | "DJF"
        | "DKK"
        | "DOP"
        | "DZD"
        | "EGP"
        | "ERN"
        | "ETB"
        | "EUR"
        | "FJD"
        | "FKP"
        | "GBP"
        | "GEL"
        | "GGP"
        | "GHS"
        | "GIP"
        | "GMD"
        | "GNF"
        | "GTQ"
        | "GYD"
        | "HKD"
        | "HNL"
        | "HRK"
        | "HTG"
        | "HUF"
        | "IDR"
        | "ILS"
        | "IMP"
        | "INR"
        | "IQD"
        | "IRR"
        | "ISK"
        | "JEP"
        | "JMD"
        | "JOD"
        | "JPY"
        | "KES"
        | "KGS"
        | "KHR"
        | "KMF"
        | "KPW"
        | "KRW"
        | "KWD"
        | "KYD"
        | "KZT"
        | "LAK"
        | "LBP"
        | "LKR"
        | "LRD"
        | "LSL"
        | "LYD"
        | "MAD"
        | "MDL"
        | "MGA"
        | "MKD"
        | "MMK"
        | "MNT"
        | "MOP"
        | "MRO"
        | "MUR"
        | "MVR"
        | "MWK"
        | "MXN"
        | "MYR"
        | "MZN"
        | "NAD"
        | "NGN"
        | "NIO"
        | "NOK"
        | "NPR"
        | "NZD"
        | "OMR"
        | "PAB"
        | "PEN"
        | "PGK"
        | "PHP"
        | "PKR"
        | "PLN"
        | "PYG"
        | "QAR"
        | "RON"
        | "RSD"
        | "RUB"
        | "RWF"
        | "SAR"
        | "SBD"
        | "SCR"
        | "SDG"
        | "SEK"
        | "SGD"
        | "SHP"
        | "SLL"
        | "SOS"
        | "SPL"
        | "SRD"
        | "STD"
        | "SVC"
        | "SYP"
        | "SZL"
        | "THB"
        | "TJS"
        | "TMT"
        | "TND"
        | "TOP"
        | "TRY"
        | "TTD"
        | "TVD"
        | "TWD"
        | "TZS"
        | "UAH"
        | "UGX"
        | "USD"
        | "UYU"
        | "UZS"
        | "VEF"
        | "VND"
        | "VUV"
        | "WST"
        | "XAF"
        | "XCD"
        | "XDR"
        | "XOF"
        | "XPF"
        | "YER"
        | "ZAR"
        | "ZMW"
        | "ZWD";

    export interface DeleteCharacterFromUserRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId: string;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
        // If true, the character's inventory will be transferred up to the owning user; otherwise, this request will purge those
        // items.
        SaveCharacterInventory: boolean;
    }

    export interface DeleteCharacterFromUserResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface DeletePlayerRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface DeletePlayerResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface DeletePushNotificationTemplateRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Id of the push notification template to be deleted.
        PushNotificationTemplateId: string;
    }

    export interface DeletePushNotificationTemplateResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface DeleteSharedGroupRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique identifier for the shared group.
        SharedGroupId: string;
    }

    export interface DeregisterGameRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Unique identifier for the Game Server Instance that is being deregistered.
        LobbyId: string;
    }

    export interface DeregisterGameResponse extends PlayFabModule.IPlayFabResultCommon {}

    type EmailVerificationStatus = "Unverified"
        | "Pending"
        | "Confirmed";

    export interface EmptyResponse extends PlayFabModule.IPlayFabResultCommon {}

    export interface EmptyResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface EntityKey {
        // Unique ID of the entity.
        Id: string;
        // Entity type. See https://docs.microsoft.com/gaming/playfab/features/data/entities/available-built-in-entity-types
        Type?: string;
    }

    export interface EntityTokenResponse {
        // The entity id and type.
        Entity?: EntityKey;
        // The token used to set X-EntityToken for all entity based API calls.
        EntityToken?: string;
        // The time the token will expire, if it is an expiring token, in UTC.
        TokenExpiration?: string;
    }

    export interface EvaluateRandomResultTableRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Specifies the catalog version that should be used to evaluate the Random Result Table. If unspecified, uses
        // default/primary catalog.
        CatalogVersion?: string;
        // The unique identifier of the Random Result Table to use.
        TableId: string;
    }

    export interface EvaluateRandomResultTableResult extends PlayFabModule.IPlayFabResultCommon {
        // Unique identifier for the item returned from the Random Result Table evaluation, for the given catalog.
        ResultItemId?: string;
    }

    export interface ExecuteCloudScriptResult extends PlayFabModule.IPlayFabResultCommon {
        // Number of PlayFab API requests issued by the CloudScript function
        APIRequestsIssued: number;
        // Information about the error, if any, that occurred during execution
        Error?: ScriptExecutionError;
        ExecutionTimeSeconds: number;
        // The name of the function that executed
        FunctionName?: string;
        // The object returned from the CloudScript function, if any
        FunctionResult?: any;
        // Flag indicating if the FunctionResult was too large and was subsequently dropped from this event. This only occurs if
        // the total event size is larger than 350KB.
        FunctionResultTooLarge?: boolean;
        // Number of external HTTP requests issued by the CloudScript function
        HttpRequestsIssued: number;
        // Entries logged during the function execution. These include both entries logged in the function code using log.info()
        // and log.error() and error entries for API and HTTP request failures.
        Logs?: LogStatement[];
        // Flag indicating if the logs were too large and were subsequently dropped from this event. This only occurs if the total
        // event size is larger than 350KB after the FunctionResult was removed.
        LogsTooLarge?: boolean;
        MemoryConsumedBytes: number;
        // Processor time consumed while executing the function. This does not include time spent waiting on API calls or HTTP
        // requests.
        ProcessorTimeSeconds: number;
        // The revision of the CloudScript that executed
        Revision: number;
    }

    export interface ExecuteCloudScriptServerRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // The name of the CloudScript function to execute
        FunctionName: string;
        // Object that is passed in to the function as the first argument
        FunctionParameter?: any;
        // Generate a 'player_executed_cloudscript' PlayStream event containing the results of the function execution and other
        // contextual information. This event will show up in the PlayStream debugger console for the player in Game Manager.
        GeneratePlayStreamEvent?: boolean;
        // The unique user identifier for the player on whose behalf the script is being run
        PlayFabId: string;
        // Option for which revision of the CloudScript to execute. 'Latest' executes the most recently created revision, 'Live'
        // executes the current live, published revision, and 'Specific' executes the specified revision. The default value is
        // 'Specific', if the SpeificRevision parameter is specified, otherwise it is 'Live'.
        RevisionSelection?: string;
        // The specivic revision to execute, when RevisionSelection is set to 'Specific'
        SpecificRevision?: number;
    }

    export interface FacebookInstantGamesPlayFabIdPair {
        // Unique Facebook Instant Games identifier for a user.
        FacebookInstantGamesId?: string;
        // Unique PlayFab identifier for a user, or null if no PlayFab account is linked to the Facebook Instant Games identifier.
        PlayFabId?: string;
    }

    export interface FacebookPlayFabIdPair {
        // Unique Facebook identifier for a user.
        FacebookId?: string;
        // Unique PlayFab identifier for a user, or null if no PlayFab account is linked to the Facebook identifier.
        PlayFabId?: string;
    }

    export interface FriendInfo {
        // Available Facebook information (if the user and PlayFab friend are also connected in Facebook).
        FacebookInfo?: UserFacebookInfo;
        // PlayFab unique identifier for this friend.
        FriendPlayFabId?: string;
        // Available Game Center information (if the user and PlayFab friend are also connected in Game Center).
        GameCenterInfo?: UserGameCenterInfo;
        // The profile of the user, if requested.
        Profile?: PlayerProfileModel;
        // Available PSN information, if the user and PlayFab friend are both connected to PSN.
        PSNInfo?: UserPsnInfo;
        // Available Steam information (if the user and PlayFab friend are also connected in Steam).
        SteamInfo?: UserSteamInfo;
        // Tags which have been associated with this friend.
        Tags?: string[];
        // Title-specific display name for this friend.
        TitleDisplayName?: string;
        // PlayFab unique username for this friend.
        Username?: string;
        // Available Xbox information, if the user and PlayFab friend are both connected to Xbox Live.
        XboxInfo?: UserXboxInfo;
    }

    type GameInstanceState = "Open"
        | "Closed";

    type GenericErrorCodes = "Success"
        | "UnkownError"
        | "InvalidParams"
        | "AccountNotFound"
        | "AccountBanned"
        | "InvalidUsernameOrPassword"
        | "InvalidTitleId"
        | "InvalidEmailAddress"
        | "EmailAddressNotAvailable"
        | "InvalidUsername"
        | "InvalidPassword"
        | "UsernameNotAvailable"
        | "InvalidSteamTicket"
        | "AccountAlreadyLinked"
        | "LinkedAccountAlreadyClaimed"
        | "InvalidFacebookToken"
        | "AccountNotLinked"
        | "FailedByPaymentProvider"
        | "CouponCodeNotFound"
        | "InvalidContainerItem"
        | "ContainerNotOwned"
        | "KeyNotOwned"
        | "InvalidItemIdInTable"
        | "InvalidReceipt"
        | "ReceiptAlreadyUsed"
        | "ReceiptCancelled"
        | "GameNotFound"
        | "GameModeNotFound"
        | "InvalidGoogleToken"
        | "UserIsNotPartOfDeveloper"
        | "InvalidTitleForDeveloper"
        | "TitleNameConflicts"
        | "UserisNotValid"
        | "ValueAlreadyExists"
        | "BuildNotFound"
        | "PlayerNotInGame"
        | "InvalidTicket"
        | "InvalidDeveloper"
        | "InvalidOrderInfo"
        | "RegistrationIncomplete"
        | "InvalidPlatform"
        | "UnknownError"
        | "SteamApplicationNotOwned"
        | "WrongSteamAccount"
        | "TitleNotActivated"
        | "RegistrationSessionNotFound"
        | "NoSuchMod"
        | "FileNotFound"
        | "DuplicateEmail"
        | "ItemNotFound"
        | "ItemNotOwned"
        | "ItemNotRecycleable"
        | "ItemNotAffordable"
        | "InvalidVirtualCurrency"
        | "WrongVirtualCurrency"
        | "WrongPrice"
        | "NonPositiveValue"
        | "InvalidRegion"
        | "RegionAtCapacity"
        | "ServerFailedToStart"
        | "NameNotAvailable"
        | "InsufficientFunds"
        | "InvalidDeviceID"
        | "InvalidPushNotificationToken"
        | "NoRemainingUses"
        | "InvalidPaymentProvider"
        | "PurchaseInitializationFailure"
        | "DuplicateUsername"
        | "InvalidBuyerInfo"
        | "NoGameModeParamsSet"
        | "BodyTooLarge"
        | "ReservedWordInBody"
        | "InvalidTypeInBody"
        | "InvalidRequest"
        | "ReservedEventName"
        | "InvalidUserStatistics"
        | "NotAuthenticated"
        | "StreamAlreadyExists"
        | "ErrorCreatingStream"
        | "StreamNotFound"
        | "InvalidAccount"
        | "PurchaseDoesNotExist"
        | "InvalidPurchaseTransactionStatus"
        | "APINotEnabledForGameClientAccess"
        | "NoPushNotificationARNForTitle"
        | "BuildAlreadyExists"
        | "BuildPackageDoesNotExist"
        | "CustomAnalyticsEventsNotEnabledForTitle"
        | "InvalidSharedGroupId"
        | "NotAuthorized"
        | "MissingTitleGoogleProperties"
        | "InvalidItemProperties"
        | "InvalidPSNAuthCode"
        | "InvalidItemId"
        | "PushNotEnabledForAccount"
        | "PushServiceError"
        | "ReceiptDoesNotContainInAppItems"
        | "ReceiptContainsMultipleInAppItems"
        | "InvalidBundleID"
        | "JavascriptException"
        | "InvalidSessionTicket"
        | "UnableToConnectToDatabase"
        | "InternalServerError"
        | "InvalidReportDate"
        | "ReportNotAvailable"
        | "DatabaseThroughputExceeded"
        | "InvalidGameTicket"
        | "ExpiredGameTicket"
        | "GameTicketDoesNotMatchLobby"
        | "LinkedDeviceAlreadyClaimed"
        | "DeviceAlreadyLinked"
        | "DeviceNotLinked"
        | "PartialFailure"
        | "PublisherNotSet"
        | "ServiceUnavailable"
        | "VersionNotFound"
        | "RevisionNotFound"
        | "InvalidPublisherId"
        | "DownstreamServiceUnavailable"
        | "APINotIncludedInTitleUsageTier"
        | "DAULimitExceeded"
        | "APIRequestLimitExceeded"
        | "InvalidAPIEndpoint"
        | "BuildNotAvailable"
        | "ConcurrentEditError"
        | "ContentNotFound"
        | "CharacterNotFound"
        | "CloudScriptNotFound"
        | "ContentQuotaExceeded"
        | "InvalidCharacterStatistics"
        | "PhotonNotEnabledForTitle"
        | "PhotonApplicationNotFound"
        | "PhotonApplicationNotAssociatedWithTitle"
        | "InvalidEmailOrPassword"
        | "FacebookAPIError"
        | "InvalidContentType"
        | "KeyLengthExceeded"
        | "DataLengthExceeded"
        | "TooManyKeys"
        | "FreeTierCannotHaveVirtualCurrency"
        | "MissingAmazonSharedKey"
        | "AmazonValidationError"
        | "InvalidPSNIssuerId"
        | "PSNInaccessible"
        | "ExpiredAuthToken"
        | "FailedToGetEntitlements"
        | "FailedToConsumeEntitlement"
        | "TradeAcceptingUserNotAllowed"
        | "TradeInventoryItemIsAssignedToCharacter"
        | "TradeInventoryItemIsBundle"
        | "TradeStatusNotValidForCancelling"
        | "TradeStatusNotValidForAccepting"
        | "TradeDoesNotExist"
        | "TradeCancelled"
        | "TradeAlreadyFilled"
        | "TradeWaitForStatusTimeout"
        | "TradeInventoryItemExpired"
        | "TradeMissingOfferedAndAcceptedItems"
        | "TradeAcceptedItemIsBundle"
        | "TradeAcceptedItemIsStackable"
        | "TradeInventoryItemInvalidStatus"
        | "TradeAcceptedCatalogItemInvalid"
        | "TradeAllowedUsersInvalid"
        | "TradeInventoryItemDoesNotExist"
        | "TradeInventoryItemIsConsumed"
        | "TradeInventoryItemIsStackable"
        | "TradeAcceptedItemsMismatch"
        | "InvalidKongregateToken"
        | "FeatureNotConfiguredForTitle"
        | "NoMatchingCatalogItemForReceipt"
        | "InvalidCurrencyCode"
        | "NoRealMoneyPriceForCatalogItem"
        | "TradeInventoryItemIsNotTradable"
        | "TradeAcceptedCatalogItemIsNotTradable"
        | "UsersAlreadyFriends"
        | "LinkedIdentifierAlreadyClaimed"
        | "CustomIdNotLinked"
        | "TotalDataSizeExceeded"
        | "DeleteKeyConflict"
        | "InvalidXboxLiveToken"
        | "ExpiredXboxLiveToken"
        | "ResettableStatisticVersionRequired"
        | "NotAuthorizedByTitle"
        | "NoPartnerEnabled"
        | "InvalidPartnerResponse"
        | "APINotEnabledForGameServerAccess"
        | "StatisticNotFound"
        | "StatisticNameConflict"
        | "StatisticVersionClosedForWrites"
        | "StatisticVersionInvalid"
        | "APIClientRequestRateLimitExceeded"
        | "InvalidJSONContent"
        | "InvalidDropTable"
        | "StatisticVersionAlreadyIncrementedForScheduledInterval"
        | "StatisticCountLimitExceeded"
        | "StatisticVersionIncrementRateExceeded"
        | "ContainerKeyInvalid"
        | "CloudScriptExecutionTimeLimitExceeded"
        | "NoWritePermissionsForEvent"
        | "CloudScriptFunctionArgumentSizeExceeded"
        | "CloudScriptAPIRequestCountExceeded"
        | "CloudScriptAPIRequestError"
        | "CloudScriptHTTPRequestError"
        | "InsufficientGuildRole"
        | "GuildNotFound"
        | "OverLimit"
        | "EventNotFound"
        | "InvalidEventField"
        | "InvalidEventName"
        | "CatalogNotConfigured"
        | "OperationNotSupportedForPlatform"
        | "SegmentNotFound"
        | "StoreNotFound"
        | "InvalidStatisticName"
        | "TitleNotQualifiedForLimit"
        | "InvalidServiceLimitLevel"
        | "ServiceLimitLevelInTransition"
        | "CouponAlreadyRedeemed"
        | "GameServerBuildSizeLimitExceeded"
        | "GameServerBuildCountLimitExceeded"
        | "VirtualCurrencyCountLimitExceeded"
        | "VirtualCurrencyCodeExists"
        | "TitleNewsItemCountLimitExceeded"
        | "InvalidTwitchToken"
        | "TwitchResponseError"
        | "ProfaneDisplayName"
        | "UserAlreadyAdded"
        | "InvalidVirtualCurrencyCode"
        | "VirtualCurrencyCannotBeDeleted"
        | "IdentifierAlreadyClaimed"
        | "IdentifierNotLinked"
        | "InvalidContinuationToken"
        | "ExpiredContinuationToken"
        | "InvalidSegment"
        | "InvalidSessionId"
        | "SessionLogNotFound"
        | "InvalidSearchTerm"
        | "TwoFactorAuthenticationTokenRequired"
        | "GameServerHostCountLimitExceeded"
        | "PlayerTagCountLimitExceeded"
        | "RequestAlreadyRunning"
        | "ActionGroupNotFound"
        | "MaximumSegmentBulkActionJobsRunning"
        | "NoActionsOnPlayersInSegmentJob"
        | "DuplicateStatisticName"
        | "ScheduledTaskNameConflict"
        | "ScheduledTaskCreateConflict"
        | "InvalidScheduledTaskName"
        | "InvalidTaskSchedule"
        | "SteamNotEnabledForTitle"
        | "LimitNotAnUpgradeOption"
        | "NoSecretKeyEnabledForCloudScript"
        | "TaskNotFound"
        | "TaskInstanceNotFound"
        | "InvalidIdentityProviderId"
        | "MisconfiguredIdentityProvider"
        | "InvalidScheduledTaskType"
        | "BillingInformationRequired"
        | "LimitedEditionItemUnavailable"
        | "InvalidAdPlacementAndReward"
        | "AllAdPlacementViewsAlreadyConsumed"
        | "GoogleOAuthNotConfiguredForTitle"
        | "GoogleOAuthError"
        | "UserNotFriend"
        | "InvalidSignature"
        | "InvalidPublicKey"
        | "GoogleOAuthNoIdTokenIncludedInResponse"
        | "StatisticUpdateInProgress"
        | "LeaderboardVersionNotAvailable"
        | "StatisticAlreadyHasPrizeTable"
        | "PrizeTableHasOverlappingRanks"
        | "PrizeTableHasMissingRanks"
        | "PrizeTableRankStartsAtZero"
        | "InvalidStatistic"
        | "ExpressionParseFailure"
        | "ExpressionInvokeFailure"
        | "ExpressionTooLong"
        | "DataUpdateRateExceeded"
        | "RestrictedEmailDomain"
        | "EncryptionKeyDisabled"
        | "EncryptionKeyMissing"
        | "EncryptionKeyBroken"
        | "NoSharedSecretKeyConfigured"
        | "SecretKeyNotFound"
        | "PlayerSecretAlreadyConfigured"
        | "APIRequestsDisabledForTitle"
        | "InvalidSharedSecretKey"
        | "PrizeTableHasNoRanks"
        | "ProfileDoesNotExist"
        | "ContentS3OriginBucketNotConfigured"
        | "InvalidEnvironmentForReceipt"
        | "EncryptedRequestNotAllowed"
        | "SignedRequestNotAllowed"
        | "RequestViewConstraintParamsNotAllowed"
        | "BadPartnerConfiguration"
        | "XboxBPCertificateFailure"
        | "XboxXASSExchangeFailure"
        | "InvalidEntityId"
        | "StatisticValueAggregationOverflow"
        | "EmailMessageFromAddressIsMissing"
        | "EmailMessageToAddressIsMissing"
        | "SmtpServerAuthenticationError"
        | "SmtpServerLimitExceeded"
        | "SmtpServerInsufficientStorage"
        | "SmtpServerCommunicationError"
        | "SmtpServerGeneralFailure"
        | "EmailClientTimeout"
        | "EmailClientCanceledTask"
        | "EmailTemplateMissing"
        | "InvalidHostForTitleId"
        | "EmailConfirmationTokenDoesNotExist"
        | "EmailConfirmationTokenExpired"
        | "AccountDeleted"
        | "PlayerSecretNotConfigured"
        | "InvalidSignatureTime"
        | "NoContactEmailAddressFound"
        | "InvalidAuthToken"
        | "AuthTokenDoesNotExist"
        | "AuthTokenExpired"
        | "AuthTokenAlreadyUsedToResetPassword"
        | "MembershipNameTooLong"
        | "MembershipNotFound"
        | "GoogleServiceAccountInvalid"
        | "GoogleServiceAccountParseFailure"
        | "EntityTokenMissing"
        | "EntityTokenInvalid"
        | "EntityTokenExpired"
        | "EntityTokenRevoked"
        | "InvalidProductForSubscription"
        | "XboxInaccessible"
        | "SubscriptionAlreadyTaken"
        | "SmtpAddonNotEnabled"
        | "APIConcurrentRequestLimitExceeded"
        | "XboxRejectedXSTSExchangeRequest"
        | "VariableNotDefined"
        | "TemplateVersionNotDefined"
        | "FileTooLarge"
        | "TitleDeleted"
        | "TitleContainsUserAccounts"
        | "TitleDeletionPlayerCleanupFailure"
        | "EntityFileOperationPending"
        | "NoEntityFileOperationPending"
        | "EntityProfileVersionMismatch"
        | "TemplateVersionTooOld"
        | "MembershipDefinitionInUse"
        | "PaymentPageNotConfigured"
        | "FailedLoginAttemptRateLimitExceeded"
        | "EntityBlockedByGroup"
        | "RoleDoesNotExist"
        | "EntityIsAlreadyMember"
        | "DuplicateRoleId"
        | "GroupInvitationNotFound"
        | "GroupApplicationNotFound"
        | "OutstandingInvitationAcceptedInstead"
        | "OutstandingApplicationAcceptedInstead"
        | "RoleIsGroupDefaultMember"
        | "RoleIsGroupAdmin"
        | "RoleNameNotAvailable"
        | "GroupNameNotAvailable"
        | "EmailReportAlreadySent"
        | "EmailReportRecipientBlacklisted"
        | "EventNamespaceNotAllowed"
        | "EventEntityNotAllowed"
        | "InvalidEntityType"
        | "NullTokenResultFromAad"
        | "InvalidTokenResultFromAad"
        | "NoValidCertificateForAad"
        | "InvalidCertificateForAad"
        | "DuplicateDropTableId"
        | "MultiplayerServerError"
        | "MultiplayerServerTooManyRequests"
        | "MultiplayerServerNoContent"
        | "MultiplayerServerBadRequest"
        | "MultiplayerServerUnauthorized"
        | "MultiplayerServerForbidden"
        | "MultiplayerServerNotFound"
        | "MultiplayerServerConflict"
        | "MultiplayerServerInternalServerError"
        | "MultiplayerServerUnavailable"
        | "ExplicitContentDetected"
        | "PIIContentDetected"
        | "InvalidScheduledTaskParameter"
        | "PerEntityEventRateLimitExceeded"
        | "TitleDefaultLanguageNotSet"
        | "EmailTemplateMissingDefaultVersion"
        | "FacebookInstantGamesIdNotLinked"
        | "InvalidFacebookInstantGamesSignature"
        | "FacebookInstantGamesAuthNotConfiguredForTitle"
        | "EntityProfileConstraintValidationFailed"
        | "TelemetryIngestionKeyPending"
        | "TelemetryIngestionKeyNotFound"
        | "StatisticChildNameInvalid"
        | "DataIntegrityError"
        | "VirtualCurrencyCannotBeSetToOlderVersion"
        | "VirtualCurrencyMustBeWithinIntegerRange"
        | "EmailTemplateInvalidSyntax"
        | "EmailTemplateMissingCallback"
        | "PushNotificationTemplateInvalidPayload"
        | "InvalidLocalizedPushNotificationLanguage"
        | "MissingLocalizedPushNotificationMessage"
        | "PushNotificationTemplateMissingPlatformPayload"
        | "PushNotificationTemplatePayloadContainsInvalidJson"
        | "PushNotificationTemplateContainsInvalidIosPayload"
        | "PushNotificationTemplateContainsInvalidAndroidPayload"
        | "PushNotificationTemplateIosPayloadMissingNotificationBody"
        | "PushNotificationTemplateAndroidPayloadMissingNotificationBody"
        | "PushNotificationTemplateNotFound"
        | "PushNotificationTemplateMissingDefaultVersion"
        | "PushNotificationTemplateInvalidSyntax"
        | "PushNotificationTemplateNoCustomPayloadForV1"
        | "NoLeaderboardForStatistic"
        | "TitleNewsMissingDefaultLanguage"
        | "TitleNewsNotFound"
        | "TitleNewsDuplicateLanguage"
        | "TitleNewsMissingTitleOrBody"
        | "TitleNewsInvalidLanguage"
        | "EmailRecipientBlacklisted"
        | "InvalidGameCenterAuthRequest"
        | "GameCenterAuthenticationFailed"
        | "CannotEnablePartiesForTitle"
        | "PartyError"
        | "PartyRequests"
        | "PartyNoContent"
        | "PartyBadRequest"
        | "PartyUnauthorized"
        | "PartyForbidden"
        | "PartyNotFound"
        | "PartyConflict"
        | "PartyInternalServerError"
        | "PartyUnavailable"
        | "PartyTooManyRequests"
        | "PushNotificationTemplateMissingName"
        | "CannotEnableMultiplayerServersForTitle"
        | "WriteAttemptedDuringExport"
        | "MultiplayerServerTitleQuotaCoresExceeded"
        | "AutomationRuleNotFound"
        | "EntityAPIKeyLimitExceeded"
        | "EntityAPIKeyNotFound"
        | "EntityAPIKeyOrSecretInvalid"
        | "EconomyServiceUnavailable"
        | "EconomyServiceInternalError"
        | "QueryRateLimitExceeded"
        | "EntityAPIKeyCreationDisabledForEntity"
        | "ForbiddenByEntityPolicy"
        | "UpdateInventoryRateLimitExceeded"
        | "StudioCreationRateLimited"
        | "StudioCreationInProgress"
        | "DuplicateStudioName"
        | "StudioNotFound"
        | "StudioDeleted"
        | "StudioDeactivated"
        | "StudioActivated"
        | "TitleCreationRateLimited"
        | "TitleCreationInProgress"
        | "DuplicateTitleName"
        | "TitleActivationRateLimited"
        | "TitleActivationInProgress"
        | "TitleDeactivated"
        | "TitleActivated"
        | "CloudScriptAzureFunctionsExecutionTimeLimitExceeded"
        | "CloudScriptAzureFunctionsArgumentSizeExceeded"
        | "CloudScriptAzureFunctionsReturnSizeExceeded"
        | "CloudScriptAzureFunctionsHTTPRequestError"
        | "VirtualCurrencyBetaGetError"
        | "VirtualCurrencyBetaCreateError"
        | "VirtualCurrencyBetaInitialDepositSaveError"
        | "VirtualCurrencyBetaSaveError"
        | "VirtualCurrencyBetaDeleteError"
        | "VirtualCurrencyBetaRestoreError"
        | "VirtualCurrencyBetaSaveConflict"
        | "VirtualCurrencyBetaUpdateError"
        | "InsightsManagementDatabaseNotFound"
        | "InsightsManagementOperationNotFound"
        | "InsightsManagementErrorPendingOperationExists"
        | "InsightsManagementSetPerformanceLevelInvalidParameter"
        | "InsightsManagementSetStorageRetentionInvalidParameter"
        | "InsightsManagementGetStorageUsageInvalidParameter"
        | "InsightsManagementGetOperationStatusInvalidParameter"
        | "DuplicatePurchaseTransactionId"
        | "EvaluationModePlayerCountExceeded"
        | "GetPlayersInSegmentRateLimitExceeded"
        | "CloudScriptFunctionNameSizeExceeded"
        | "PaidInsightsFeaturesNotEnabled"
        | "CloudScriptAzureFunctionsQueueRequestError"
        | "EvaluationModeTitleCountExceeded"
        | "InsightsManagementTitleNotInFlight"
        | "LimitNotFound"
        | "LimitNotAvailableViaAPI"
        | "InsightsManagementSetStorageRetentionBelowMinimum"
        | "InsightsManagementSetStorageRetentionAboveMaximum"
        | "AppleNotEnabledForTitle"
        | "InsightsManagementNewActiveEventExportLimitInvalid"
        | "InsightsManagementSetPerformanceRateLimited"
        | "PartyRequestsThrottledFromRateLimiter"
        | "XboxServiceTooManyRequests"
        | "NintendoSwitchNotEnabledForTitle"
        | "RequestMultiplayerServersThrottledFromRateLimiter"
        | "TitleDataOverrideNotFound"
        | "DuplicateKeys"
        | "WasNotCreatedWithCloudRoot"
        | "LegacyMultiplayerServersDeprecated"
        | "VirtualCurrencyCurrentlyUnavailable"
        | "SteamUserNotFound"
        | "ElasticSearchOperationFailed"
        | "NotImplemented"
        | "MatchmakingEntityInvalid"
        | "MatchmakingPlayerAttributesInvalid"
        | "MatchmakingQueueNotFound"
        | "MatchmakingMatchNotFound"
        | "MatchmakingTicketNotFound"
        | "MatchmakingAlreadyJoinedTicket"
        | "MatchmakingTicketAlreadyCompleted"
        | "MatchmakingQueueConfigInvalid"
        | "MatchmakingMemberProfileInvalid"
        | "NintendoSwitchDeviceIdNotLinked"
        | "MatchmakingNotEnabled"
        | "MatchmakingPlayerAttributesTooLarge"
        | "MatchmakingNumberOfPlayersInTicketTooLarge"
        | "MatchmakingAttributeInvalid"
        | "MatchmakingPlayerHasNotJoinedTicket"
        | "MatchmakingRateLimitExceeded"
        | "MatchmakingTicketMembershipLimitExceeded"
        | "MatchmakingUnauthorized"
        | "MatchmakingQueueLimitExceeded"
        | "MatchmakingRequestTypeMismatch"
        | "MatchmakingBadRequest"
        | "TitleConfigNotFound"
        | "TitleConfigUpdateConflict"
        | "TitleConfigSerializationError"
        | "CatalogApiNotImplemented"
        | "CatalogEntityInvalid"
        | "CatalogTitleIdMissing"
        | "CatalogPlayerIdMissing"
        | "CatalogClientIdentityInvalid"
        | "CatalogOneOrMoreFilesInvalid"
        | "CatalogItemMetadataInvalid"
        | "CatalogItemIdInvalid"
        | "CatalogSearchParameterInvalid"
        | "CatalogFeatureDisabled"
        | "CatalogConfigInvalid"
        | "CatalogItemTypeInvalid"
        | "CatalogBadRequest"
        | "CatalogTooManyRequests"
        | "ExportInvalidStatusUpdate"
        | "ExportInvalidPrefix"
        | "ExportBlobContainerDoesNotExist"
        | "ExportNotFound"
        | "ExportCouldNotUpdate"
        | "ExportInvalidStorageType"
        | "ExportAmazonBucketDoesNotExist"
        | "ExportInvalidBlobStorage"
        | "ExportKustoException"
        | "ExportKustoConnectionFailed"
        | "ExportUnknownError"
        | "ExportCantEditPendingExport"
        | "ExportLimitExports"
        | "ExportLimitEvents"
        | "ExportInvalidPartitionStatusModification"
        | "ExportCouldNotCreate"
        | "ExportNoBackingDatabaseFound"
        | "ExportCouldNotDelete"
        | "ExportCannotDetermineEventQuery"
        | "ExportInvalidQuerySchemaModification"
        | "ExportQuerySchemaMissingRequiredColumns"
        | "ExportCannotParseQuery"
        | "ExportControlCommandsNotAllowed"
        | "ExportQueryMissingTableReference"
        | "ExplorerBasicInvalidQueryName"
        | "ExplorerBasicInvalidQueryDescription"
        | "ExplorerBasicInvalidQueryConditions"
        | "ExplorerBasicInvalidQueryStartDate"
        | "ExplorerBasicInvalidQueryEndDate"
        | "ExplorerBasicInvalidQueryGroupBy"
        | "ExplorerBasicInvalidQueryAggregateType"
        | "ExplorerBasicInvalidQueryAggregateProperty"
        | "ExplorerBasicLoadQueriesError"
        | "ExplorerBasicLoadQueryError"
        | "ExplorerBasicCreateQueryError"
        | "ExplorerBasicDeleteQueryError"
        | "ExplorerBasicUpdateQueryError"
        | "ExplorerBasicSavedQueriesLimit"
        | "ExplorerBasicSavedQueryNotFound"
        | "TitleNotEnabledForParty"
        | "PartyVersionNotFound"
        | "MultiplayerServerBuildReferencedByMatchmakingQueue"
        | "MultiplayerServerBuildReferencedByBuildAlias"
        | "ExperimentationExperimentStopped"
        | "ExperimentationExperimentRunning"
        | "ExperimentationExperimentNotFound"
        | "ExperimentationExperimentNeverStarted"
        | "ExperimentationExperimentDeleted"
        | "ExperimentationClientTimeout"
        | "ExperimentationInvalidVariantConfiguration"
        | "ExperimentationInvalidVariableConfiguration"
        | "ExperimentInvalidId"
        | "ExperimentationNoScorecard"
        | "ExperimentationTreatmentAssignmentFailed"
        | "ExperimentationTreatmentAssignmentDisabled"
        | "ExperimentationInvalidDuration"
        | "ExperimentationMaxExperimentsReached"
        | "ExperimentationExperimentSchedulingInProgress"
        | "ExperimentationInvalidEndDate"
        | "ExperimentationInvalidStartDate"
        | "ExperimentationMaxDurationExceeded"
        | "ExperimentationExclusionGroupNotFound"
        | "ExperimentationExclusionGroupInsufficientCapacity"
        | "ExperimentationExclusionGroupCannotDelete"
        | "ExperimentationExclusionGroupInvalidTrafficAllocation"
        | "ExperimentationExclusionGroupInvalidName"
        | "MaxActionDepthExceeded"
        | "TitleNotOnUpdatedPricingPlan"
        | "SegmentManagementTitleNotInFlight"
        | "SegmentManagementNoExpressionTree"
        | "SegmentManagementTriggerActionCountOverLimit"
        | "SegmentManagementSegmentCountOverLimit"
        | "SegmentManagementInvalidSegmentId"
        | "SegmentManagementInvalidInput"
        | "SegmentManagementInvalidSegmentName"
        | "DeleteSegmentRateLimitExceeded"
        | "CreateSegmentRateLimitExceeded"
        | "UpdateSegmentRateLimitExceeded"
        | "GetSegmentsRateLimitExceeded"
        | "AsyncExportNotInFlight"
        | "AsyncExportNotFound"
        | "AsyncExportRateLimitExceeded"
        | "SnapshotNotFound"
        | "InventoryApiNotImplemented";

    export interface GenericPlayFabIdPair {
        // Unique generic service identifier for a user.
        GenericId?: GenericServiceId;
        // Unique PlayFab identifier for a user, or null if no PlayFab account is linked to the given generic identifier.
        PlayFabId?: string;
    }

    export interface GenericServiceId {
        // Name of the service for which the player has a unique identifier.
        ServiceName: string;
        // Unique identifier of the player in that service.
        UserId: string;
    }

    export interface GetAllSegmentsRequest extends PlayFabModule.IPlayFabRequestCommon {}

    export interface GetAllSegmentsResult extends PlayFabModule.IPlayFabResultCommon {
        // Array of segments for this title.
        Segments?: GetSegmentResult[];
    }

    export interface GetCatalogItemsRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Which catalog is being requested. If null, uses the default catalog.
        CatalogVersion?: string;
    }

    export interface GetCatalogItemsResult extends PlayFabModule.IPlayFabResultCommon {
        // Array of items which can be purchased.
        Catalog?: CatalogItem[];
    }

    export interface GetCharacterDataRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId: string;
        // The version that currently exists according to the caller. The call will return the data for all of the keys if the
        // version in the system is greater than this.
        IfChangedFromDataVersion?: number;
        // Specific keys to search for in the custom user data.
        Keys?: string[];
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface GetCharacterDataResult extends PlayFabModule.IPlayFabResultCommon {
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId?: string;
        // User specific data for this title.
        Data?: { [key: string]: UserDataRecord };
        // Indicates the current version of the data that has been set. This is incremented with every set call for that type of
        // data (read-only, internal, etc). This version can be provided in Get calls to find updated data.
        DataVersion: number;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId?: string;
    }

    export interface GetCharacterInventoryRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Used to limit results to only those from a specific catalog version.
        CatalogVersion?: string;
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId: string;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface GetCharacterInventoryResult extends PlayFabModule.IPlayFabResultCommon {
        // Unique identifier of the character for this inventory.
        CharacterId?: string;
        // Array of inventory items belonging to the character.
        Inventory?: ItemInstance[];
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId?: string;
        // Array of virtual currency balance(s) belonging to the character.
        VirtualCurrency?: { [key: string]: number };
        // Array of remaining times and timestamps for virtual currencies.
        VirtualCurrencyRechargeTimes?: { [key: string]: VirtualCurrencyRechargeTime };
    }

    export interface GetCharacterLeaderboardRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Optional character type on which to filter the leaderboard entries.
        CharacterType?: string;
        // Maximum number of entries to retrieve.
        MaxResultsCount: number;
        // First entry in the leaderboard to be retrieved.
        StartPosition: number;
        // Unique identifier for the title-specific statistic for the leaderboard.
        StatisticName: string;
    }

    export interface GetCharacterLeaderboardResult extends PlayFabModule.IPlayFabResultCommon {
        // Ordered list of leaderboard entries.
        Leaderboard?: CharacterLeaderboardEntry[];
    }

    export interface GetCharacterStatisticsRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface GetCharacterStatisticsResult extends PlayFabModule.IPlayFabResultCommon {
        // Unique identifier of the character for the statistics.
        CharacterId?: string;
        // Character statistics for the requested user.
        CharacterStatistics?: { [key: string]: number };
        // PlayFab unique identifier of the user whose character statistics are being returned.
        PlayFabId?: string;
    }

    export interface GetContentDownloadUrlRequest extends PlayFabModule.IPlayFabRequestCommon {
        // HTTP method to fetch item - GET or HEAD. Use HEAD when only fetching metadata. Default is GET.
        HttpMethod?: string;
        // Key of the content item to fetch, usually formatted as a path, e.g. images/a.png
        Key: string;
        // True to download through CDN. CDN provides higher download bandwidth and lower latency. However, if you want the latest,
        // non-cached version of the content during development, set this to false. Default is true.
        ThruCDN?: boolean;
    }

    export interface GetContentDownloadUrlResult extends PlayFabModule.IPlayFabResultCommon {
        // URL for downloading content via HTTP GET or HEAD method. The URL will expire in approximately one hour.
        URL?: string;
    }

    export interface GetFriendLeaderboardRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Indicates whether Facebook friends should be included in the response. Default is true.
        IncludeFacebookFriends?: boolean;
        // Indicates whether Steam service friends should be included in the response. Default is true.
        IncludeSteamFriends?: boolean;
        // Maximum number of entries to retrieve.
        MaxResultsCount: number;
        // The player whose friend leaderboard to get
        PlayFabId: string;
        // If non-null, this determines which properties of the resulting player profiles to return. For API calls from the client,
        // only the allowed client profile properties for the title may be requested. These allowed properties are configured in
        // the Game Manager "Client Profile Options" tab in the "Settings" section.
        ProfileConstraints?: PlayerProfileViewConstraints;
        // Position in the leaderboard to start this listing (defaults to the first entry).
        StartPosition: number;
        // Statistic used to rank friends for this leaderboard.
        StatisticName: string;
        // The version of the leaderboard to get.
        Version?: number;
        // Xbox token if Xbox friends should be included. Requires Xbox be configured on PlayFab.
        XboxToken?: string;
    }

    export interface GetFriendsListRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Indicates whether Facebook friends should be included in the response. Default is true.
        IncludeFacebookFriends?: boolean;
        // Indicates whether Steam service friends should be included in the response. Default is true.
        IncludeSteamFriends?: boolean;
        // PlayFab identifier of the player whose friend list to get.
        PlayFabId: string;
        // If non-null, this determines which properties of the resulting player profiles to return. For API calls from the client,
        // only the allowed client profile properties for the title may be requested. These allowed properties are configured in
        // the Game Manager "Client Profile Options" tab in the "Settings" section.
        ProfileConstraints?: PlayerProfileViewConstraints;
        // Xbox token if Xbox friends should be included. Requires Xbox be configured on PlayFab.
        XboxToken?: string;
    }

    export interface GetFriendsListResult extends PlayFabModule.IPlayFabResultCommon {
        // Array of friends found.
        Friends?: FriendInfo[];
    }

    export interface GetLeaderboardAroundCharacterRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId: string;
        // Optional character type on which to filter the leaderboard entries.
        CharacterType?: string;
        // Maximum number of entries to retrieve.
        MaxResultsCount: number;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
        // Unique identifier for the title-specific statistic for the leaderboard.
        StatisticName: string;
    }

    export interface GetLeaderboardAroundCharacterResult extends PlayFabModule.IPlayFabResultCommon {
        // Ordered list of leaderboard entries.
        Leaderboard?: CharacterLeaderboardEntry[];
    }

    export interface GetLeaderboardAroundUserRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Maximum number of entries to retrieve.
        MaxResultsCount: number;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
        // If non-null, this determines which properties of the resulting player profiles to return. For API calls from the client,
        // only the allowed client profile properties for the title may be requested. These allowed properties are configured in
        // the Game Manager "Client Profile Options" tab in the "Settings" section.
        ProfileConstraints?: PlayerProfileViewConstraints;
        // Unique identifier for the title-specific statistic for the leaderboard.
        StatisticName: string;
        // The version of the leaderboard to get.
        Version?: number;
    }

    export interface GetLeaderboardAroundUserResult extends PlayFabModule.IPlayFabResultCommon {
        // Ordered listing of users and their positions in the requested leaderboard.
        Leaderboard?: PlayerLeaderboardEntry[];
        // The time the next scheduled reset will occur. Null if the leaderboard does not reset on a schedule.
        NextReset?: string;
        // The version of the leaderboard returned.
        Version: number;
    }

    export interface GetLeaderboardForUsersCharactersRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Maximum number of entries to retrieve.
        MaxResultsCount: number;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
        // Unique identifier for the title-specific statistic for the leaderboard.
        StatisticName: string;
    }

    export interface GetLeaderboardForUsersCharactersResult extends PlayFabModule.IPlayFabResultCommon {
        // Ordered list of leaderboard entries.
        Leaderboard?: CharacterLeaderboardEntry[];
    }

    export interface GetLeaderboardRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Maximum number of entries to retrieve.
        MaxResultsCount: number;
        // If non-null, this determines which properties of the resulting player profiles to return. For API calls from the client,
        // only the allowed client profile properties for the title may be requested. These allowed properties are configured in
        // the Game Manager "Client Profile Options" tab in the "Settings" section.
        ProfileConstraints?: PlayerProfileViewConstraints;
        // First entry in the leaderboard to be retrieved.
        StartPosition: number;
        // Unique identifier for the title-specific statistic for the leaderboard.
        StatisticName: string;
        // The version of the leaderboard to get.
        Version?: number;
    }

    export interface GetLeaderboardResult extends PlayFabModule.IPlayFabResultCommon {
        // Ordered listing of users and their positions in the requested leaderboard.
        Leaderboard?: PlayerLeaderboardEntry[];
        // The time the next scheduled reset will occur. Null if the leaderboard does not reset on a schedule.
        NextReset?: string;
        // The version of the leaderboard returned.
        Version: number;
    }

    export interface GetPlayerCombinedInfoRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Flags for which pieces of info to return for the user.
        InfoRequestParameters: GetPlayerCombinedInfoRequestParams;
        // PlayFabId of the user whose data will be returned
        PlayFabId: string;
    }

    export interface GetPlayerCombinedInfoRequestParams {
        // Whether to get character inventories. Defaults to false.
        GetCharacterInventories?: boolean;
        // Whether to get the list of characters. Defaults to false.
        GetCharacterList?: boolean;
        // Whether to get player profile. Defaults to false. Has no effect for a new player.
        GetPlayerProfile?: boolean;
        // Whether to get player statistics. Defaults to false.
        GetPlayerStatistics?: boolean;
        // Whether to get title data. Defaults to false.
        GetTitleData?: boolean;
        // Whether to get the player's account Info. Defaults to false
        GetUserAccountInfo?: boolean;
        // Whether to get the player's custom data. Defaults to false
        GetUserData?: boolean;
        // Whether to get the player's inventory. Defaults to false
        GetUserInventory?: boolean;
        // Whether to get the player's read only data. Defaults to false
        GetUserReadOnlyData?: boolean;
        // Whether to get the player's virtual currency balances. Defaults to false
        GetUserVirtualCurrency?: boolean;
        // Specific statistics to retrieve. Leave null to get all keys. Has no effect if GetPlayerStatistics is false
        PlayerStatisticNames?: string[];
        // Specifies the properties to return from the player profile. Defaults to returning the player's display name.
        ProfileConstraints?: PlayerProfileViewConstraints;
        // Specific keys to search for in the custom data. Leave null to get all keys. Has no effect if GetTitleData is false
        TitleDataKeys?: string[];
        // Specific keys to search for in the custom data. Leave null to get all keys. Has no effect if GetUserData is false
        UserDataKeys?: string[];
        // Specific keys to search for in the custom data. Leave null to get all keys. Has no effect if GetUserReadOnlyData is
        // false
        UserReadOnlyDataKeys?: string[];
    }

    export interface GetPlayerCombinedInfoResult extends PlayFabModule.IPlayFabResultCommon {
        // Results for requested info.
        InfoResultPayload?: GetPlayerCombinedInfoResultPayload;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId?: string;
    }

    export interface GetPlayerCombinedInfoResultPayload {
        // Account information for the user. This is always retrieved.
        AccountInfo?: UserAccountInfo;
        // Inventories for each character for the user.
        CharacterInventories?: CharacterInventory[];
        // List of characters for the user.
        CharacterList?: CharacterResult[];
        // The profile of the players. This profile is not guaranteed to be up-to-date. For a new player, this profile will not
        // exist.
        PlayerProfile?: PlayerProfileModel;
        // List of statistics for this player.
        PlayerStatistics?: StatisticValue[];
        // Title data for this title.
        TitleData?: { [key: string]: string | null };
        // User specific custom data.
        UserData?: { [key: string]: UserDataRecord };
        // The version of the UserData that was returned.
        UserDataVersion: number;
        // Array of inventory items in the user's current inventory.
        UserInventory?: ItemInstance[];
        // User specific read-only data.
        UserReadOnlyData?: { [key: string]: UserDataRecord };
        // The version of the Read-Only UserData that was returned.
        UserReadOnlyDataVersion: number;
        // Dictionary of virtual currency balance(s) belonging to the user.
        UserVirtualCurrency?: { [key: string]: number };
        // Dictionary of remaining times and timestamps for virtual currencies.
        UserVirtualCurrencyRechargeTimes?: { [key: string]: VirtualCurrencyRechargeTime };
    }

    export interface GetPlayerProfileRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
        // If non-null, this determines which properties of the resulting player profiles to return. For API calls from the client,
        // only the allowed client profile properties for the title may be requested. These allowed properties are configured in
        // the Game Manager "Client Profile Options" tab in the "Settings" section.
        ProfileConstraints?: PlayerProfileViewConstraints;
    }

    export interface GetPlayerProfileResult extends PlayFabModule.IPlayFabResultCommon {
        // The profile of the player. This profile is not guaranteed to be up-to-date. For a new player, this profile will not
        // exist.
        PlayerProfile?: PlayerProfileModel;
    }

    export interface GetPlayerSegmentsResult extends PlayFabModule.IPlayFabResultCommon {
        // Array of segments the requested player currently belongs to.
        Segments?: GetSegmentResult[];
    }

    export interface GetPlayersInSegmentRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Continuation token if retrieving subsequent pages of results.
        ContinuationToken?: string;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Maximum number of profiles to load. Default is 1,000. Maximum is 10,000.
        MaxBatchSize?: number;
        // Number of seconds to keep the continuation token active. After token expiration it is not possible to continue paging
        // results. Default is 300 (5 minutes). Maximum is 1,800 (30 minutes).
        SecondsToLive?: number;
        // Unique identifier for this segment.
        SegmentId: string;
    }

    export interface GetPlayersInSegmentResult extends PlayFabModule.IPlayFabResultCommon {
        // Continuation token to use to retrieve subsequent pages of results. If token returns null there are no more results.
        ContinuationToken?: string;
        // Array of player profiles in this segment.
        PlayerProfiles?: PlayerProfile[];
        // Count of profiles matching this segment.
        ProfilesInSegment: number;
    }

    export interface GetPlayersSegmentsRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface GetPlayerStatisticsRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // user for whom statistics are being requested
        PlayFabId: string;
        // statistics to return
        StatisticNames?: string[];
        // statistics to return, if StatisticNames is not set (only statistics which have a version matching that provided will be
        // returned)
        StatisticNameVersions?: StatisticNameVersion[];
    }

    export interface GetPlayerStatisticsResult extends PlayFabModule.IPlayFabResultCommon {
        // PlayFab unique identifier of the user whose statistics are being returned
        PlayFabId?: string;
        // User statistics for the requested user.
        Statistics?: StatisticValue[];
    }

    export interface GetPlayerStatisticVersionsRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // unique name of the statistic
        StatisticName?: string;
    }

    export interface GetPlayerStatisticVersionsResult extends PlayFabModule.IPlayFabResultCommon {
        // version change history of the statistic
        StatisticVersions?: PlayerStatisticVersion[];
    }

    export interface GetPlayerTagsRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Optional namespace to filter results by
        Namespace?: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface GetPlayerTagsResult extends PlayFabModule.IPlayFabResultCommon {
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
        // Canonical tags (including namespace and tag's name) for the requested user
        Tags: string[];
    }

    export interface GetPlayFabIDsFromFacebookIDsRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Array of unique Facebook identifiers for which the title needs to get PlayFab identifiers.
        FacebookIDs: string[];
    }

    export interface GetPlayFabIDsFromFacebookIDsResult extends PlayFabModule.IPlayFabResultCommon {
        // Mapping of Facebook identifiers to PlayFab identifiers.
        Data?: FacebookPlayFabIdPair[];
    }

    export interface GetPlayFabIDsFromFacebookInstantGamesIdsRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Array of unique Facebook Instant Games identifiers for which the title needs to get PlayFab identifiers.
        FacebookInstantGamesIds: string[];
    }

    export interface GetPlayFabIDsFromFacebookInstantGamesIdsResult extends PlayFabModule.IPlayFabResultCommon {
        // Mapping of Facebook Instant Games identifiers to PlayFab identifiers.
        Data?: FacebookInstantGamesPlayFabIdPair[];
    }

    export interface GetPlayFabIDsFromGenericIDsRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Array of unique generic service identifiers for which the title needs to get PlayFab identifiers. Currently limited to a
        // maximum of 10 in a single request.
        GenericIDs: GenericServiceId[];
    }

    export interface GetPlayFabIDsFromGenericIDsResult extends PlayFabModule.IPlayFabResultCommon {
        // Mapping of generic service identifiers to PlayFab identifiers.
        Data?: GenericPlayFabIdPair[];
    }

    export interface GetPlayFabIDsFromNintendoSwitchDeviceIdsRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Array of unique Nintendo Switch Device identifiers for which the title needs to get PlayFab identifiers.
        NintendoSwitchDeviceIds: string[];
    }

    export interface GetPlayFabIDsFromNintendoSwitchDeviceIdsResult extends PlayFabModule.IPlayFabResultCommon {
        // Mapping of Nintendo Switch Device identifiers to PlayFab identifiers.
        Data?: NintendoSwitchPlayFabIdPair[];
    }

    export interface GetPlayFabIDsFromPSNAccountIDsRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Id of the PSN issuer environment. If null, defaults to production environment.
        IssuerId?: number;
        // Array of unique PlayStation Network identifiers for which the title needs to get PlayFab identifiers.
        PSNAccountIDs: string[];
    }

    export interface GetPlayFabIDsFromPSNAccountIDsResult extends PlayFabModule.IPlayFabResultCommon {
        // Mapping of PlayStation Network identifiers to PlayFab identifiers.
        Data?: PSNAccountPlayFabIdPair[];
    }

    export interface GetPlayFabIDsFromSteamIDsRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Array of unique Steam identifiers (Steam profile IDs) for which the title needs to get PlayFab identifiers.
        SteamStringIDs?: string[];
    }

    export interface GetPlayFabIDsFromSteamIDsResult extends PlayFabModule.IPlayFabResultCommon {
        // Mapping of Steam identifiers to PlayFab identifiers.
        Data?: SteamPlayFabIdPair[];
    }

    export interface GetPlayFabIDsFromXboxLiveIDsRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The ID of Xbox Live sandbox.
        Sandbox?: string;
        // Array of unique Xbox Live account identifiers for which the title needs to get PlayFab identifiers.
        XboxLiveAccountIDs: string[];
    }

    export interface GetPlayFabIDsFromXboxLiveIDsResult extends PlayFabModule.IPlayFabResultCommon {
        // Mapping of PlayStation Network identifiers to PlayFab identifiers.
        Data?: XboxLiveAccountPlayFabIdPair[];
    }

    export interface GetPublisherDataRequest extends PlayFabModule.IPlayFabRequestCommon {
        // array of keys to get back data from the Publisher data blob, set by the admin tools
        Keys: string[];
    }

    export interface GetPublisherDataResult extends PlayFabModule.IPlayFabResultCommon {
        // a dictionary object of key / value pairs
        Data?: { [key: string]: string | null };
    }

    export interface GetRandomResultTablesRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Specifies the catalog version that should be used to retrieve the Random Result Tables. If unspecified, uses
        // default/primary catalog.
        CatalogVersion?: string;
        // The unique identifier of the Random Result Table to use.
        TableIDs: string[];
    }

    export interface GetRandomResultTablesResult extends PlayFabModule.IPlayFabResultCommon {
        // array of random result tables currently available
        Tables?: { [key: string]: RandomResultTableListing };
    }

    export interface GetSegmentResult {
        // Identifier of the segments AB Test, if it is attached to one.
        ABTestParent?: string;
        // Unique identifier for this segment.
        Id: string;
        // Segment name.
        Name?: string;
    }

    export interface GetServerCustomIDsFromPlayFabIDsRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Array of unique PlayFab player identifiers for which the title needs to get server custom identifiers. Cannot contain
        // more than 25 identifiers.
        PlayFabIDs: string[];
    }

    export interface GetServerCustomIDsFromPlayFabIDsResult extends PlayFabModule.IPlayFabResultCommon {
        // Mapping of server custom player identifiers to PlayFab identifiers.
        Data?: ServerCustomIDPlayFabIDPair[];
    }

    export interface GetSharedGroupDataRequest extends PlayFabModule.IPlayFabRequestCommon {
        // If true, return the list of all members of the shared group.
        GetMembers?: boolean;
        // Specific keys to retrieve from the shared group (if not specified, all keys will be returned, while an empty array
        // indicates that no keys should be returned).
        Keys?: string[];
        // Unique identifier for the shared group.
        SharedGroupId: string;
    }

    export interface GetSharedGroupDataResult extends PlayFabModule.IPlayFabResultCommon {
        // Data for the requested keys.
        Data?: { [key: string]: SharedGroupDataRecord };
        // List of PlayFabId identifiers for the members of this group, if requested.
        Members?: string[];
    }

    export interface GetStoreItemsResult extends PlayFabModule.IPlayFabResultCommon {
        // The base catalog that this store is a part of.
        CatalogVersion?: string;
        // Additional data about the store.
        MarketingData?: StoreMarketingModel;
        // How the store was last updated (Admin or a third party).
        Source?: string;
        // Array of items which can be purchased from this store.
        Store?: StoreItem[];
        // The ID of this store.
        StoreId?: string;
    }

    export interface GetStoreItemsServerRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Catalog version to store items from. Use default catalog version if null
        CatalogVersion?: string;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Optional identifier for the player to use in requesting the store information - if used, segment overrides will be
        // applied
        PlayFabId?: string;
        // Unqiue identifier for the store which is being requested
        StoreId: string;
    }

    export interface GetTimeRequest extends PlayFabModule.IPlayFabRequestCommon {}

    export interface GetTimeResult extends PlayFabModule.IPlayFabResultCommon {
        // Current server time when the request was received, in UTC
        Time: string;
    }

    export interface GetTitleDataRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Specific keys to search for in the title data (leave null to get all keys)
        Keys?: string[];
        // Optional field that specifies the name of an override. This value is ignored when used by the game client; otherwise,
        // the overrides are applied automatically to the title data.
        OverrideLabel?: string;
    }

    export interface GetTitleDataResult extends PlayFabModule.IPlayFabResultCommon {
        // a dictionary object of key / value pairs
        Data?: { [key: string]: string | null };
    }

    export interface GetTitleNewsRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Limits the results to the last n entries. Defaults to 10 if not set.
        Count?: number;
    }

    export interface GetTitleNewsResult extends PlayFabModule.IPlayFabResultCommon {
        // Array of localized news items.
        News?: TitleNewsItem[];
    }

    export interface GetUserAccountInfoRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface GetUserAccountInfoResult extends PlayFabModule.IPlayFabResultCommon {
        // Account details for the user whose information was requested.
        UserInfo?: UserAccountInfo;
    }

    export interface GetUserBansRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface GetUserBansResult extends PlayFabModule.IPlayFabResultCommon {
        // Information about the bans
        BanData?: BanInfo[];
    }

    export interface GetUserDataRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The version that currently exists according to the caller. The call will return the data for all of the keys if the
        // version in the system is greater than this.
        IfChangedFromDataVersion?: number;
        // Specific keys to search for in the custom user data.
        Keys?: string[];
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface GetUserDataResult extends PlayFabModule.IPlayFabResultCommon {
        // User specific data for this title.
        Data?: { [key: string]: UserDataRecord };
        // Indicates the current version of the data that has been set. This is incremented with every set call for that type of
        // data (read-only, internal, etc). This version can be provided in Get calls to find updated data.
        DataVersion: number;
        // PlayFab unique identifier of the user whose custom data is being returned.
        PlayFabId?: string;
    }

    export interface GetUserInventoryRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface GetUserInventoryResult extends PlayFabModule.IPlayFabResultCommon {
        // Array of inventory items belonging to the user.
        Inventory?: ItemInstance[];
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId?: string;
        // Array of virtual currency balance(s) belonging to the user.
        VirtualCurrency?: { [key: string]: number };
        // Array of remaining times and timestamps for virtual currencies.
        VirtualCurrencyRechargeTimes?: { [key: string]: VirtualCurrencyRechargeTime };
    }

    export interface GrantCharacterToUserRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Non-unique display name of the character being granted (1-40 characters in length).
        CharacterName: string;
        // Type of the character being granted; statistics can be sliced based on this value.
        CharacterType: string;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface GrantCharacterToUserResult extends PlayFabModule.IPlayFabResultCommon {
        // Unique identifier tagged to this character.
        CharacterId?: string;
    }

    export interface GrantedItemInstance {
        // Game specific comment associated with this instance when it was added to the user inventory.
        Annotation?: string;
        // Array of unique items that were awarded when this catalog item was purchased.
        BundleContents?: string[];
        // Unique identifier for the parent inventory item, as defined in the catalog, for object which were added from a bundle or
        // container.
        BundleParent?: string;
        // Catalog version for the inventory item, when this instance was created.
        CatalogVersion?: string;
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId?: string;
        // A set of custom key-value pairs on the instance of the inventory item, which is not to be confused with the catalog
        // item's custom data.
        CustomData?: { [key: string]: string | null };
        // CatalogItem.DisplayName at the time this item was purchased.
        DisplayName?: string;
        // Timestamp for when this instance will expire.
        Expiration?: string;
        // Class name for the inventory item, as defined in the catalog.
        ItemClass?: string;
        // Unique identifier for the inventory item, as defined in the catalog.
        ItemId?: string;
        // Unique item identifier for this specific instance of the item.
        ItemInstanceId?: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId?: string;
        // Timestamp for when this instance was purchased.
        PurchaseDate?: string;
        // Total number of remaining uses, if this is a consumable item.
        RemainingUses?: number;
        // Result of this operation.
        Result: boolean;
        // Currency type for the cost of the catalog item. Not available when granting items.
        UnitCurrency?: string;
        // Cost of the catalog item in the given currency. Not available when granting items.
        UnitPrice: number;
        // The number of uses that were added or removed to this item in this call.
        UsesIncrementedBy?: number;
    }

    export interface GrantItemsToCharacterRequest extends PlayFabModule.IPlayFabRequestCommon {
        // String detailing any additional information concerning this operation.
        Annotation?: string;
        // Catalog version from which items are to be granted.
        CatalogVersion?: string;
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId: string;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Array of itemIds to grant to the user.
        ItemIds?: string[];
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface GrantItemsToCharacterResult extends PlayFabModule.IPlayFabResultCommon {
        // Array of items granted to users.
        ItemGrantResults?: GrantedItemInstance[];
    }

    export interface GrantItemsToUserRequest extends PlayFabModule.IPlayFabRequestCommon {
        // String detailing any additional information concerning this operation.
        Annotation?: string;
        // Catalog version from which items are to be granted.
        CatalogVersion?: string;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Array of itemIds to grant to the user.
        ItemIds: string[];
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface GrantItemsToUserResult extends PlayFabModule.IPlayFabResultCommon {
        // Array of items granted to users.
        ItemGrantResults?: GrantedItemInstance[];
    }

    export interface GrantItemsToUsersRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Catalog version from which items are to be granted.
        CatalogVersion?: string;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Array of items to grant and the users to whom the items are to be granted.
        ItemGrants: ItemGrant[];
    }

    export interface GrantItemsToUsersResult extends PlayFabModule.IPlayFabResultCommon {
        // Array of items granted to users.
        ItemGrantResults?: GrantedItemInstance[];
    }

    export interface ItemGrant {
        // String detailing any additional information concerning this operation.
        Annotation?: string;
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId?: string;
        // Key-value pairs to be written to the custom data. Note that keys are trimmed of whitespace, are limited in size, and may
        // not begin with a '!' character or be null.
        Data?: { [key: string]: string | null };
        // Unique identifier of the catalog item to be granted to the user.
        ItemId: string;
        // Optional list of Data-keys to remove from UserData. Some SDKs cannot insert null-values into Data due to language
        // constraints. Use this to delete the keys directly.
        KeysToRemove?: string[];
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface ItemInstance {
        // Game specific comment associated with this instance when it was added to the user inventory.
        Annotation?: string;
        // Array of unique items that were awarded when this catalog item was purchased.
        BundleContents?: string[];
        // Unique identifier for the parent inventory item, as defined in the catalog, for object which were added from a bundle or
        // container.
        BundleParent?: string;
        // Catalog version for the inventory item, when this instance was created.
        CatalogVersion?: string;
        // A set of custom key-value pairs on the instance of the inventory item, which is not to be confused with the catalog
        // item's custom data.
        CustomData?: { [key: string]: string | null };
        // CatalogItem.DisplayName at the time this item was purchased.
        DisplayName?: string;
        // Timestamp for when this instance will expire.
        Expiration?: string;
        // Class name for the inventory item, as defined in the catalog.
        ItemClass?: string;
        // Unique identifier for the inventory item, as defined in the catalog.
        ItemId?: string;
        // Unique item identifier for this specific instance of the item.
        ItemInstanceId?: string;
        // Timestamp for when this instance was purchased.
        PurchaseDate?: string;
        // Total number of remaining uses, if this is a consumable item.
        RemainingUses?: number;
        // Currency type for the cost of the catalog item. Not available when granting items.
        UnitCurrency?: string;
        // Cost of the catalog item in the given currency. Not available when granting items.
        UnitPrice: number;
        // The number of uses that were added or removed to this item in this call.
        UsesIncrementedBy?: number;
    }

    export interface LinkedPlatformAccountModel {
        // Linked account email of the user on the platform, if available
        Email?: string;
        // Authentication platform
        Platform?: string;
        // Unique account identifier of the user on the platform
        PlatformUserId?: string;
        // Linked account username of the user on the platform, if available
        Username?: string;
    }

    export interface LinkPSNAccountRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Authentication code provided by the PlayStation Network.
        AuthCode: string;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // If another user is already linked to the account, unlink the other user and re-link.
        ForceLink?: boolean;
        // Id of the PSN issuer environment. If null, defaults to production environment.
        IssuerId?: number;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
        // Redirect URI supplied to PSN when requesting an auth code
        RedirectUri: string;
    }

    export interface LinkPSNAccountResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface LinkServerCustomIdRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // If another user is already linked to the custom ID, unlink the other user and re-link.
        ForceLink?: boolean;
        // Unique PlayFab identifier.
        PlayFabId: string;
        // Unique server custom identifier for this player.
        ServerCustomId: string;
    }

    export interface LinkServerCustomIdResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface LinkXboxAccountRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // If another user is already linked to the account, unlink the other user and re-link.
        ForceLink?: boolean;
        // Unique PlayFab identifier for a user, or null if no PlayFab account is linked to the Xbox Live identifier.
        PlayFabId: string;
        // Token provided by the Xbox Live SDK/XDK method GetTokenAndSignatureAsync("POST", "https://playfabapi.com/", "").
        XboxToken: string;
    }

    export interface LinkXboxAccountResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface ListUsersCharactersRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface ListUsersCharactersResult extends PlayFabModule.IPlayFabResultCommon {
        // The requested list of characters.
        Characters?: CharacterResult[];
    }

    export interface LocalizedPushNotificationProperties {
        // Message of the localized push notification template.
        Message?: string;
        // Subject of the localized push notification template.
        Subject?: string;
    }

    export interface LocationModel {
        // City name.
        City?: string;
        // The two-character continent code for this location
        ContinentCode?: string;
        // The two-character ISO 3166-1 country code for the country associated with the location
        CountryCode?: string;
        // Latitude coordinate of the geographic location.
        Latitude?: number;
        // Longitude coordinate of the geographic location.
        Longitude?: number;
    }

    type LoginIdentityProvider = "Unknown"
        | "PlayFab"
        | "Custom"
        | "GameCenter"
        | "GooglePlay"
        | "Steam"
        | "XBoxLive"
        | "PSN"
        | "Kongregate"
        | "Facebook"
        | "IOSDevice"
        | "AndroidDevice"
        | "Twitch"
        | "WindowsHello"
        | "GameServer"
        | "CustomServer"
        | "NintendoSwitch"
        | "FacebookInstantGames"
        | "OpenIdConnect"
        | "Apple"
        | "NintendoSwitchAccount";

    export interface LoginWithServerCustomIdRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Automatically create a PlayFab account if one is not currently linked to this ID.
        CreateAccount?: boolean;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Flags for which pieces of info to return for the user.
        InfoRequestParameters?: GetPlayerCombinedInfoRequestParams;
        // Player secret that is used to verify API request signatures (Enterprise Only).
        PlayerSecret?: string;
        // The backend server identifier for this player.
        ServerCustomId?: string;
    }

    export interface LoginWithSteamIdRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Automatically create a PlayFab account if one is not currently linked to this ID.
        CreateAccount?: boolean;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Flags for which pieces of info to return for the user.
        InfoRequestParameters?: GetPlayerCombinedInfoRequestParams;
        // Unique Steam identifier for a user
        SteamId: string;
    }

    export interface LoginWithXboxIdRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Automatically create a PlayFab account if one is not currently linked to this ID.
        CreateAccount?: boolean;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Flags for which pieces of info to return for the user.
        InfoRequestParameters?: GetPlayerCombinedInfoRequestParams;
        // The id of Xbox Live sandbox.
        Sandbox: string;
        // Unique Xbox identifier for a user
        XboxId: string;
    }

    export interface LoginWithXboxRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Automatically create a PlayFab account if one is not currently linked to this ID.
        CreateAccount?: boolean;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Flags for which pieces of info to return for the user.
        InfoRequestParameters?: GetPlayerCombinedInfoRequestParams;
        // Token provided by the Xbox Live SDK/XDK method GetTokenAndSignatureAsync("POST", "https://playfabapi.com/", "").
        XboxToken: string;
    }

    export interface LogStatement {
        // Optional object accompanying the message as contextual information
        Data?: any;
        // 'Debug', 'Info', or 'Error'
        Level?: string;
        Message?: string;
    }

    export interface MembershipModel {
        // Whether this membership is active. That is, whether the MembershipExpiration time has been reached.
        IsActive: boolean;
        // The time this membership expires
        MembershipExpiration: string;
        // The id of the membership
        MembershipId?: string;
        // Membership expirations can be explicitly overridden (via game manager or the admin api). If this membership has been
        // overridden, this will be the new expiration time.
        OverrideExpiration?: string;
        // The list of subscriptions that this player has for this membership
        Subscriptions?: SubscriptionModel[];
    }

    export interface ModifyCharacterVirtualCurrencyResult extends PlayFabModule.IPlayFabResultCommon {
        // Balance of the virtual currency after modification.
        Balance: number;
        // Name of the virtual currency which was modified.
        VirtualCurrency?: string;
    }

    export interface ModifyItemUsesRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Unique instance identifier of the item to be modified.
        ItemInstanceId: string;
        // PlayFab unique identifier of the user whose item is being modified.
        PlayFabId: string;
        // Number of uses to add to the item. Can be negative to remove uses.
        UsesToAdd: number;
    }

    export interface ModifyItemUsesResult extends PlayFabModule.IPlayFabResultCommon {
        // Unique instance identifier of the item with uses consumed.
        ItemInstanceId?: string;
        // Number of uses remaining on the item.
        RemainingUses: number;
    }

    export interface ModifyUserVirtualCurrencyResult extends PlayFabModule.IPlayFabResultCommon {
        // Balance of the virtual currency after modification.
        Balance: number;
        // Amount added or subtracted from the user's virtual currency. Maximum VC balance is Int32 (2,147,483,647). Any increase
        // over this value will be discarded.
        BalanceChange: number;
        // User currency was subtracted from.
        PlayFabId?: string;
        // Name of the virtual currency which was modified.
        VirtualCurrency?: string;
    }

    export interface MoveItemToCharacterFromCharacterRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique identifier of the character that currently has the item.
        GivingCharacterId: string;
        // Unique PlayFab assigned instance identifier of the item
        ItemInstanceId: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
        // Unique identifier of the character that will be receiving the item.
        ReceivingCharacterId: string;
    }

    export interface MoveItemToCharacterFromCharacterResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface MoveItemToCharacterFromUserRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId: string;
        // Unique PlayFab assigned instance identifier of the item
        ItemInstanceId: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface MoveItemToCharacterFromUserResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface MoveItemToUserFromCharacterRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId: string;
        // Unique PlayFab assigned instance identifier of the item
        ItemInstanceId: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface MoveItemToUserFromCharacterResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface NintendoSwitchPlayFabIdPair {
        // Unique Nintendo Switch Device identifier for a user.
        NintendoSwitchDeviceId?: string;
        // Unique PlayFab identifier for a user, or null if no PlayFab account is linked to the Nintendo Switch Device identifier.
        PlayFabId?: string;
    }

    export interface NotifyMatchmakerPlayerLeftRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Unique identifier of the Game Instance the user is leaving.
        LobbyId: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface NotifyMatchmakerPlayerLeftResult extends PlayFabModule.IPlayFabResultCommon {
        // State of user leaving the Game Server Instance.
        PlayerState?: string;
    }

    type PlayerConnectionState = "Unassigned"
        | "Connecting"
        | "Participating"
        | "Participated";

    export interface PlayerLeaderboardEntry {
        // Title-specific display name of the user for this leaderboard entry.
        DisplayName?: string;
        // PlayFab unique identifier of the user for this leaderboard entry.
        PlayFabId?: string;
        // User's overall position in the leaderboard.
        Position: number;
        // The profile of the user, if requested.
        Profile?: PlayerProfileModel;
        // Specific value of the user's statistic.
        StatValue: number;
    }

    export interface PlayerLinkedAccount {
        // Linked account's email
        Email?: string;
        // Authentication platform
        Platform?: string;
        // Platform user identifier
        PlatformUserId?: string;
        // Linked account's username
        Username?: string;
    }

    export interface PlayerLocation {
        // City of the player's geographic location.
        City?: string;
        // The two-character continent code for this location
        ContinentCode: string;
        // The two-character ISO 3166-1 country code for the country associated with the location
        CountryCode: string;
        // Latitude coordinate of the player's geographic location.
        Latitude?: number;
        // Longitude coordinate of the player's geographic location.
        Longitude?: number;
    }

    export interface PlayerProfile {
        // Array of ad campaigns player has been attributed to
        AdCampaignAttributions?: AdCampaignAttribution[];
        // Image URL of the player's avatar.
        AvatarUrl?: string;
        // Banned until UTC Date. If permanent ban this is set for 20 years after the original ban date.
        BannedUntil?: string;
        // Array of contact email addresses associated with the player
        ContactEmailAddresses?: ContactEmailInfo[];
        // Player record created
        Created?: string;
        // Player Display Name
        DisplayName?: string;
        // Last login
        LastLogin?: string;
        // Array of third party accounts linked to this player
        LinkedAccounts?: PlayerLinkedAccount[];
        // Dictionary of player's locations by type.
        Locations?: { [key: string]: PlayerLocation };
        // Player account origination
        Origination?: string;
        // List of player variants for experimentation
        PlayerExperimentVariants?: string[];
        // PlayFab Player ID
        PlayerId?: string;
        // Array of player statistics
        PlayerStatistics?: PlayerStatistic[];
        // Publisher this player belongs to
        PublisherId?: string;
        // Array of configured push notification end points
        PushNotificationRegistrations?: PushNotificationRegistration[];
        // Dictionary of player's statistics using only the latest version's value
        Statistics?: { [key: string]: number };
        // List of player's tags for segmentation.
        Tags?: string[];
        // Title ID this profile applies to
        TitleId?: string;
        // A sum of player's total purchases in USD across all currencies.
        TotalValueToDateInUSD?: number;
        // Dictionary of player's total purchases by currency.
        ValuesToDate?: { [key: string]: number };
        // Dictionary of player's virtual currency balances
        VirtualCurrencyBalances?: { [key: string]: number };
    }

    export interface PlayerProfileModel {
        // List of advertising campaigns the player has been attributed to
        AdCampaignAttributions?: AdCampaignAttributionModel[];
        // URL of the player's avatar image
        AvatarUrl?: string;
        // If the player is currently banned, the UTC Date when the ban expires
        BannedUntil?: string;
        // List of all contact email info associated with the player account
        ContactEmailAddresses?: ContactEmailInfoModel[];
        // Player record created
        Created?: string;
        // Player display name
        DisplayName?: string;
        // List of experiment variants for the player.
        ExperimentVariants?: string[];
        // UTC time when the player most recently logged in to the title
        LastLogin?: string;
        // List of all authentication systems linked to this player account
        LinkedAccounts?: LinkedPlatformAccountModel[];
        // List of geographic locations from which the player has logged in to the title
        Locations?: LocationModel[];
        // List of memberships for the player, along with whether are expired.
        Memberships?: MembershipModel[];
        // Player account origination
        Origination?: string;
        // PlayFab player account unique identifier
        PlayerId?: string;
        // Publisher this player belongs to
        PublisherId?: string;
        // List of configured end points registered for sending the player push notifications
        PushNotificationRegistrations?: PushNotificationRegistrationModel[];
        // List of leaderboard statistic values for the player
        Statistics?: StatisticModel[];
        // List of player's tags for segmentation
        Tags?: TagModel[];
        // Title ID this player profile applies to
        TitleId?: string;
        // Sum of the player's purchases made with real-money currencies, converted to US dollars equivalent and represented as a
        // whole number of cents (1/100 USD). For example, 999 indicates nine dollars and ninety-nine cents.
        TotalValueToDateInUSD?: number;
        // List of the player's lifetime purchase totals, summed by real-money currency
        ValuesToDate?: ValueToDateModel[];
    }

    export interface PlayerProfileViewConstraints {
        // Whether to show player's avatar URL. Defaults to false
        ShowAvatarUrl: boolean;
        // Whether to show the banned until time. Defaults to false
        ShowBannedUntil: boolean;
        // Whether to show campaign attributions. Defaults to false
        ShowCampaignAttributions: boolean;
        // Whether to show contact email addresses. Defaults to false
        ShowContactEmailAddresses: boolean;
        // Whether to show the created date. Defaults to false
        ShowCreated: boolean;
        // Whether to show the display name. Defaults to false
        ShowDisplayName: boolean;
        // Whether to show player's experiment variants. Defaults to false
        ShowExperimentVariants: boolean;
        // Whether to show the last login time. Defaults to false
        ShowLastLogin: boolean;
        // Whether to show the linked accounts. Defaults to false
        ShowLinkedAccounts: boolean;
        // Whether to show player's locations. Defaults to false
        ShowLocations: boolean;
        // Whether to show player's membership information. Defaults to false
        ShowMemberships: boolean;
        // Whether to show origination. Defaults to false
        ShowOrigination: boolean;
        // Whether to show push notification registrations. Defaults to false
        ShowPushNotificationRegistrations: boolean;
        // Reserved for future development
        ShowStatistics: boolean;
        // Whether to show tags. Defaults to false
        ShowTags: boolean;
        // Whether to show the total value to date in usd. Defaults to false
        ShowTotalValueToDateInUsd: boolean;
        // Whether to show the values to date. Defaults to false
        ShowValuesToDate: boolean;
    }

    export interface PlayerStatistic {
        // Statistic ID
        Id?: string;
        // Statistic name
        Name?: string;
        // Current statistic value
        StatisticValue: number;
        // Statistic version (0 if not a versioned statistic)
        StatisticVersion: number;
    }

    export interface PlayerStatisticVersion {
        // time when the statistic version became active
        ActivationTime: string;
        // time when the statistic version became inactive due to statistic version incrementing
        DeactivationTime?: string;
        // time at which the statistic version was scheduled to become active, based on the configured ResetInterval
        ScheduledActivationTime?: string;
        // time at which the statistic version was scheduled to become inactive, based on the configured ResetInterval
        ScheduledDeactivationTime?: string;
        // name of the statistic when the version became active
        StatisticName?: string;
        // version of the statistic
        Version: number;
    }

    export interface PSNAccountPlayFabIdPair {
        // Unique PlayFab identifier for a user, or null if no PlayFab account is linked to the PlayStation Network identifier.
        PlayFabId?: string;
        // Unique PlayStation Network identifier for a user.
        PSNAccountId?: string;
    }

    export interface PushNotificationPackage {
        // Numerical badge to display on App icon (iOS only)
        Badge: number;
        // This must be a JSON formatted object. For use with developer-created custom Push Notification plugins
        CustomData?: string;
        // Icon file to display with the message (Not supported for iOS)
        Icon?: string;
        // Content of the message (all platforms)
        Message: string;
        // Sound file to play with the message (all platforms)
        Sound?: string;
        // Title/Subject of the message. Not supported for iOS
        Title: string;
    }

    type PushNotificationPlatform = "ApplePushNotificationService"
        | "GoogleCloudMessaging";

    export interface PushNotificationRegistration {
        // Notification configured endpoint
        NotificationEndpointARN?: string;
        // Push notification platform
        Platform?: string;
    }

    export interface PushNotificationRegistrationModel {
        // Notification configured endpoint
        NotificationEndpointARN?: string;
        // Push notification platform
        Platform?: string;
    }

    export interface RandomResultTableListing {
        // Catalog version this table is associated with
        CatalogVersion?: string;
        // Child nodes that indicate what kind of drop table item this actually is.
        Nodes: ResultTableNode[];
        // Unique name for this drop table
        TableId: string;
    }

    export interface RedeemCouponRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Catalog version of the coupon.
        CatalogVersion?: string;
        // Optional identifier for the Character that should receive the item. If null, item is added to the player
        CharacterId?: string;
        // Generated coupon code to redeem.
        CouponCode: string;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface RedeemCouponResult extends PlayFabModule.IPlayFabResultCommon {
        // Items granted to the player as a result of redeeming the coupon.
        GrantedItems?: ItemInstance[];
    }

    export interface RedeemMatchmakerTicketRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Unique identifier of the Game Server Instance that is asking for validation of the authorization ticket.
        LobbyId: string;
        // Server authorization ticket passed back from a call to Matchmake or StartGame.
        Ticket: string;
    }

    export interface RedeemMatchmakerTicketResult extends PlayFabModule.IPlayFabResultCommon {
        // Error value if the ticket was not validated.
        Error?: string;
        // Boolean indicating whether the ticket was validated by the PlayFab service.
        TicketIsValid: boolean;
        // User account information for the user validated.
        UserInfo?: UserAccountInfo;
    }

    export interface RefreshGameServerInstanceHeartbeatRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique identifier of the Game Server Instance for which the heartbeat is updated.
        LobbyId: string;
    }

    export interface RefreshGameServerInstanceHeartbeatResult extends PlayFabModule.IPlayFabResultCommon {}

    type Region = "USCentral"
        | "USEast"
        | "EUWest"
        | "Singapore"
        | "Japan"
        | "Brazil"
        | "Australia";

    export interface RegisterGameRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique identifier of the build running on the Game Server Instance.
        Build: string;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Game Mode the Game Server instance is running. Note that this must be defined in the Game Modes tab in the PlayFab Game
        // Manager, along with the Build ID (the same Game Mode can be defined for multiple Build IDs).
        GameMode: string;
        // Previous lobby id if re-registering an existing game.
        LobbyId?: string;
        // Region in which the Game Server Instance is running. For matchmaking using non-AWS region names, set this to any AWS
        // region and use Tags (below) to specify your custom region.
        Region: string;
        // IPV4 address of the game server instance.
        ServerIPV4Address?: string;
        // IPV6 address (if any) of the game server instance.
        ServerIPV6Address?: string;
        // Port number for communication with the Game Server Instance.
        ServerPort: string;
        // Public DNS name (if any) of the server
        ServerPublicDNSName?: string;
        // Tags for the Game Server Instance
        Tags?: { [key: string]: string | null };
    }

    export interface RegisterGameResponse extends PlayFabModule.IPlayFabResultCommon {
        // Unique identifier generated for the Game Server Instance that is registered. If LobbyId is specified in request and the
        // game still exists in PlayFab, the LobbyId in request is returned. Otherwise a new lobby id will be returned.
        LobbyId?: string;
    }

    export interface RemoveFriendRequest extends PlayFabModule.IPlayFabRequestCommon {
        // PlayFab identifier of the friend account which is to be removed.
        FriendPlayFabId: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface RemoveGenericIDRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Generic service identifier to be removed from the player.
        GenericId: GenericServiceId;
        // PlayFabId of the user to remove.
        PlayFabId: string;
    }

    export interface RemovePlayerTagRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
        // Unique tag for player profile.
        TagName: string;
    }

    export interface RemovePlayerTagResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface RemoveSharedGroupMembersRequest extends PlayFabModule.IPlayFabRequestCommon {
        // An array of unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabIds: string[];
        // Unique identifier for the shared group.
        SharedGroupId: string;
    }

    export interface RemoveSharedGroupMembersResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface ReportPlayerServerRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Optional additional comment by reporting player.
        Comment?: string;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Unique PlayFab identifier of the reported player.
        ReporteeId: string;
        // PlayFabId of the reporting player.
        ReporterId: string;
    }

    export interface ReportPlayerServerResult extends PlayFabModule.IPlayFabResultCommon {
        // The number of remaining reports which may be filed today by this reporting player.
        SubmissionsRemaining: number;
    }

    export interface ResultTableNode {
        // Either an ItemId, or the TableId of another random result table
        ResultItem: string;
        // Whether this entry in the table is an item or a link to another table
        ResultItemType: string;
        // How likely this is to be rolled - larger numbers add more weight
        Weight: number;
    }

    type ResultTableNodeType = "ItemId"
        | "TableId";

    export interface RevokeAllBansForUserRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface RevokeAllBansForUserResult extends PlayFabModule.IPlayFabResultCommon {
        // Information on the bans that were revoked.
        BanData?: BanInfo[];
    }

    export interface RevokeBansRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Ids of the bans to be revoked. Maximum 100.
        BanIds: string[];
    }

    export interface RevokeBansResult extends PlayFabModule.IPlayFabResultCommon {
        // Information on the bans that were revoked
        BanData?: BanInfo[];
    }

    export interface RevokeInventoryItem {
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId?: string;
        // Unique PlayFab assigned instance identifier of the item
        ItemInstanceId: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface RevokeInventoryItemRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId?: string;
        // Unique PlayFab assigned instance identifier of the item
        ItemInstanceId: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface RevokeInventoryItemsRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Array of player items to revoke, between 1 and 25 items.
        Items: RevokeInventoryItem[];
    }

    export interface RevokeInventoryItemsResult extends PlayFabModule.IPlayFabResultCommon {
        // Collection of any errors that occurred during processing.
        Errors?: RevokeItemError[];
    }

    export interface RevokeInventoryResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface RevokeItemError {
        // Specific error that was encountered.
        Error?: string;
        // Item information that failed to be revoked.
        Item?: RevokeInventoryItem;
    }

    export interface SavePushNotificationTemplateRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Android JSON for the notification template.
        AndroidPayload?: string;
        // Id of the push notification template.
        Id?: string;
        // IOS JSON for the notification template.
        IOSPayload?: string;
        // Dictionary of localized push notification templates with the language as the key.
        LocalizedPushNotificationTemplates?: { [key: string]: LocalizedPushNotificationProperties };
        // Name of the push notification template.
        Name: string;
    }

    export interface SavePushNotificationTemplateResult extends PlayFabModule.IPlayFabResultCommon {
        // Id of the push notification template that was saved.
        PushNotificationTemplateId?: string;
    }

    export interface ScriptExecutionError {
        // Error code, such as CloudScriptNotFound, JavascriptException, CloudScriptFunctionArgumentSizeExceeded,
        // CloudScriptAPIRequestCountExceeded, CloudScriptAPIRequestError, or CloudScriptHTTPRequestError
        Error?: string;
        // Details about the error
        Message?: string;
        // Point during the execution of the script at which the error occurred, if any
        StackTrace?: string;
    }

    export interface SendCustomAccountRecoveryEmailRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // User email address attached to their account
        Email?: string;
        // The email template id of the account recovery email template to send.
        EmailTemplateId: string;
        // The user's username requesting an account recovery.
        Username?: string;
    }

    export interface SendCustomAccountRecoveryEmailResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface SendEmailFromTemplateRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // The email template id of the email template to send.
        EmailTemplateId: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface SendEmailFromTemplateResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface SendPushNotificationFromTemplateRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Id of the push notification template.
        PushNotificationTemplateId: string;
        // PlayFabId of the push notification recipient.
        Recipient: string;
    }

    export interface SendPushNotificationRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Allows you to provide precisely formatted json to target devices. This is an advanced feature, allowing you to deliver
        // to custom plugin logic, fields, or functionality not natively supported by PlayFab.
        AdvancedPlatformDelivery?: AdvancedPushPlatformMsg[];
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Text of message to send.
        Message?: string;
        // Defines all possible push attributes like message, title, icon, etc. Some parameters are device specific - please see
        // the PushNotificationPackage documentation for details.
        Package?: PushNotificationPackage;
        // PlayFabId of the recipient of the push notification.
        Recipient: string;
        // Subject of message to send (may not be displayed in all platforms)
        Subject?: string;
        // Target Platforms that should receive the Message or Package. If omitted, we will send to all available platforms.
        TargetPlatforms?: string[];
    }

    export interface SendPushNotificationResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface ServerCustomIDPlayFabIDPair {
        // Unique PlayFab identifier.
        PlayFabId?: string;
        // Unique server custom identifier for this player.
        ServerCustomId?: string;
    }

    export interface ServerLoginResult extends PlayFabModule.IPlayFabResultCommon {
        // If LoginTitlePlayerAccountEntity flag is set on the login request the title_player_account will also be logged in and
        // returned.
        EntityToken?: EntityTokenResponse;
        // Results for requested info.
        InfoResultPayload?: GetPlayerCombinedInfoResultPayload;
        // The time of this user's previous login. If there was no previous login, then it's DateTime.MinValue
        LastLoginTime?: string;
        // True if the account was newly created on this login.
        NewlyCreated: boolean;
        // Player's unique PlayFabId.
        PlayFabId?: string;
        // Unique token authorizing the user and game at the server level, for the current session.
        SessionTicket?: string;
        // Settings specific to this user.
        SettingsForUser?: UserSettings;
        // The experimentation treatments for this user at the time of login.
        TreatmentAssignment?: TreatmentAssignment;
    }

    export interface SetFriendTagsRequest extends PlayFabModule.IPlayFabRequestCommon {
        // PlayFab identifier of the friend account to which the tag(s) should be applied.
        FriendPlayFabId: string;
        // PlayFab identifier of the player whose friend is to be updated.
        PlayFabId: string;
        // Array of tags to set on the friend account.
        Tags: string[];
    }

    export interface SetGameServerInstanceDataRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Custom data to set for the specified game server instance.
        GameServerData: string;
        // Unique identifier of the Game Instance to be updated, in decimal format.
        LobbyId: string;
    }

    export interface SetGameServerInstanceDataResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface SetGameServerInstanceStateRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique identifier of the Game Instance to be updated, in decimal format.
        LobbyId: string;
        // State to set for the specified game server instance.
        State: string;
    }

    export interface SetGameServerInstanceStateResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface SetGameServerInstanceTagsRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique identifier of the Game Server Instance to be updated.
        LobbyId: string;
        // Tags to set for the specified Game Server Instance. Note that this is the complete list of tags to be associated with
        // the Game Server Instance.
        Tags: { [key: string]: string | null };
    }

    export interface SetGameServerInstanceTagsResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface SetPlayerSecretRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Player secret that is used to verify API request signatures (Enterprise Only).
        PlayerSecret?: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface SetPlayerSecretResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface SetPublisherDataRequest extends PlayFabModule.IPlayFabRequestCommon {
        // key we want to set a value on (note, this is additive - will only replace an existing key's value if they are the same
        // name.) Keys are trimmed of whitespace. Keys may not begin with the '!' character.
        Key: string;
        // new value to set. Set to null to remove a value
        Value?: string;
    }

    export interface SetPublisherDataResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface SetTitleDataRequest extends PlayFabModule.IPlayFabRequestCommon {
        // key we want to set a value on (note, this is additive - will only replace an existing key's value if they are the same
        // name.) Keys are trimmed of whitespace. Keys may not begin with the '!' character.
        Key: string;
        // new value to set. Set to null to remove a value
        Value?: string;
    }

    export interface SetTitleDataResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface SharedGroupDataRecord {
        // Timestamp for when this data was last updated.
        LastUpdated: string;
        // PlayFabId of the user to last update this value.
        LastUpdatedBy?: string;
        // Indicates whether this data can be read by all users (public) or only members of the group (private).
        Permission?: string;
        // Data stored for the specified group data key.
        Value?: string;
    }

    type SourceType = "Admin"
        | "BackEnd"
        | "GameClient"
        | "GameServer"
        | "Partner"
        | "Custom"
        | "API";

    export interface StatisticModel {
        // Statistic name
        Name?: string;
        // Statistic value
        Value: number;
        // Statistic version (0 if not a versioned statistic)
        Version: number;
    }

    export interface StatisticNameVersion {
        // unique name of the statistic
        StatisticName: string;
        // the version of the statistic to be returned
        Version: number;
    }

    export interface StatisticUpdate {
        // unique name of the statistic
        StatisticName: string;
        // statistic value for the player
        Value: number;
        // for updates to an existing statistic value for a player, the version of the statistic when it was loaded. Null when
        // setting the statistic value for the first time.
        Version?: number;
    }

    export interface StatisticValue {
        // unique name of the statistic
        StatisticName?: string;
        // statistic value for the player
        Value: number;
        // for updates to an existing statistic value for a player, the version of the statistic when it was loaded
        Version: number;
    }

    export interface SteamPlayFabIdPair {
        // Unique PlayFab identifier for a user, or null if no PlayFab account is linked to the Steam identifier.
        PlayFabId?: string;
        // Unique Steam identifier for a user.
        SteamStringId?: string;
    }

    export interface StoreItem {
        // Store specific custom data. The data only exists as part of this store; it is not transferred to item instances
        CustomData?: any;
        // Intended display position for this item. Note that 0 is the first position
        DisplayPosition?: number;
        // Unique identifier of the item as it exists in the catalog - note that this must exactly match the ItemId from the
        // catalog
        ItemId: string;
        // Override prices for this item for specific currencies
        RealCurrencyPrices?: { [key: string]: number };
        // Override prices for this item in virtual currencies and "RM" (the base Real Money purchase price, in USD pennies)
        VirtualCurrencyPrices?: { [key: string]: number };
    }

    export interface StoreMarketingModel {
        // Tagline for a store.
        Description?: string;
        // Display name of a store as it will appear to users.
        DisplayName?: string;
        // Custom data about a store.
        Metadata?: any;
    }

    export interface SubscriptionModel {
        // When this subscription expires.
        Expiration: string;
        // The time the subscription was orignially purchased
        InitialSubscriptionTime: string;
        // Whether this subscription is currently active. That is, if Expiration > now.
        IsActive: boolean;
        // The status of this subscription, according to the subscription provider.
        Status?: string;
        // The id for this subscription
        SubscriptionId?: string;
        // The item id for this subscription from the primary catalog
        SubscriptionItemId?: string;
        // The provider for this subscription. Apple or Google Play are supported today.
        SubscriptionProvider?: string;
    }

    type SubscriptionProviderStatus = "NoError"
        | "Cancelled"
        | "UnknownError"
        | "BillingError"
        | "ProductUnavailable"
        | "CustomerDidNotAcceptPriceChange"
        | "FreeTrial"
        | "PaymentPending";

    export interface SubtractCharacterVirtualCurrencyRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Amount to be subtracted from the user balance of the specified virtual currency.
        Amount: number;
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId: string;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
        // Name of the virtual currency which is to be decremented.
        VirtualCurrency: string;
    }

    export interface SubtractUserVirtualCurrencyRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Amount to be subtracted from the user balance of the specified virtual currency.
        Amount: number;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // PlayFab unique identifier of the user whose virtual currency balance is to be decreased.
        PlayFabId: string;
        // Name of the virtual currency which is to be decremented.
        VirtualCurrency: string;
    }

    export interface TagModel {
        // Full value of the tag, including namespace
        TagValue?: string;
    }

    type TitleActivationStatus = "None"
        | "ActivatedTitleKey"
        | "PendingSteam"
        | "ActivatedSteam"
        | "RevokedSteam";

    export interface TitleNewsItem {
        // News item body.
        Body?: string;
        // Unique identifier of news item.
        NewsId?: string;
        // Date and time when the news item was posted.
        Timestamp: string;
        // Title of the news item.
        Title?: string;
    }

    export interface TreatmentAssignment {
        // List of the experiment variables.
        Variables?: Variable[];
        // List of the experiment variants.
        Variants?: string[];
    }

    export interface UnlinkPSNAccountRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface UnlinkPSNAccountResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface UnlinkServerCustomIdRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Unique PlayFab identifier.
        PlayFabId: string;
        // Unique server custom identifier for this player.
        ServerCustomId: string;
    }

    export interface UnlinkServerCustomIdResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface UnlinkXboxAccountRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Unique PlayFab identifier for a user, or null if no PlayFab account is linked to the Xbox Live identifier.
        PlayFabId: string;
    }

    export interface UnlinkXboxAccountResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface UnlockContainerInstanceRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Specifies the catalog version that should be used to determine container contents. If unspecified, uses catalog
        // associated with the item instance.
        CatalogVersion?: string;
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId?: string;
        // ItemInstanceId of the container to unlock.
        ContainerItemInstanceId: string;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // ItemInstanceId of the key that will be consumed by unlocking this container. If the container requires a key, this
        // parameter is required.
        KeyItemInstanceId?: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface UnlockContainerItemRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Specifies the catalog version that should be used to determine container contents. If unspecified, uses default/primary
        // catalog.
        CatalogVersion?: string;
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId?: string;
        // Catalog ItemId of the container type to unlock.
        ContainerItemId: string;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface UnlockContainerItemResult extends PlayFabModule.IPlayFabResultCommon {
        // Items granted to the player as a result of unlocking the container.
        GrantedItems?: ItemInstance[];
        // Unique instance identifier of the container unlocked.
        UnlockedItemInstanceId?: string;
        // Unique instance identifier of the key used to unlock the container, if applicable.
        UnlockedWithItemInstanceId?: string;
        // Virtual currency granted to the player as a result of unlocking the container.
        VirtualCurrency?: { [key: string]: number };
    }

    export interface UpdateAvatarUrlRequest extends PlayFabModule.IPlayFabRequestCommon {
        // URL of the avatar image. If empty, it removes the existing avatar URL.
        ImageUrl: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface UpdateBanRequest {
        // The updated active state for the ban. Null for no change.
        Active?: boolean;
        // The id of the ban to be updated.
        BanId: string;
        // The updated expiration date for the ban. Null for no change.
        Expires?: string;
        // The updated IP address for the ban. Null for no change.
        IPAddress?: string;
        // The updated MAC address for the ban. Null for no change.
        MACAddress?: string;
        // Whether to make this ban permanent. Set to true to make this ban permanent. This will not modify Active state.
        Permanent?: boolean;
        // The updated reason for the ban to be updated. Maximum 140 characters. Null for no change.
        Reason?: string;
    }

    export interface UpdateBansRequest extends PlayFabModule.IPlayFabRequestCommon {
        // List of bans to be updated. Maximum 100.
        Bans: UpdateBanRequest[];
    }

    export interface UpdateBansResult extends PlayFabModule.IPlayFabResultCommon {
        // Information on the bans that were updated
        BanData?: BanInfo[];
    }

    export interface UpdateCharacterDataRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId: string;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Key-value pairs to be written to the custom data. Note that keys are trimmed of whitespace, are limited in size, and may
        // not begin with a '!' character or be null.
        Data?: { [key: string]: string | null };
        // Optional list of Data-keys to remove from UserData. Some SDKs cannot insert null-values into Data due to language
        // constraints. Use this to delete the keys directly.
        KeysToRemove?: string[];
        // Permission to be applied to all user data keys written in this request. Defaults to "private" if not set.
        Permission?: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface UpdateCharacterDataResult extends PlayFabModule.IPlayFabResultCommon {
        // Indicates the current version of the data that has been set. This is incremented with every set call for that type of
        // data (read-only, internal, etc). This version can be provided in Get calls to find updated data.
        DataVersion: number;
    }

    export interface UpdateCharacterStatisticsRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId: string;
        // Statistics to be updated with the provided values.
        CharacterStatistics?: { [key: string]: number };
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface UpdateCharacterStatisticsResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface UpdatePlayerStatisticsRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Indicates whether the statistics provided should be set, regardless of the aggregation method set on the statistic.
        // Default is false.
        ForceUpdate?: boolean;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
        // Statistics to be updated with the provided values
        Statistics: StatisticUpdate[];
    }

    export interface UpdatePlayerStatisticsResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface UpdateSharedGroupDataRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Key-value pairs to be written to the custom data. Note that keys are trimmed of whitespace, are limited in size, and may
        // not begin with a '!' character or be null.
        Data?: { [key: string]: string | null };
        // Optional list of Data-keys to remove from UserData. Some SDKs cannot insert null-values into Data due to language
        // constraints. Use this to delete the keys directly.
        KeysToRemove?: string[];
        // Permission to be applied to all user data keys in this request.
        Permission?: string;
        // Unique identifier for the shared group.
        SharedGroupId: string;
    }

    export interface UpdateSharedGroupDataResult extends PlayFabModule.IPlayFabResultCommon {}

    export interface UpdateUserDataRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Key-value pairs to be written to the custom data. Note that keys are trimmed of whitespace, are limited in size, and may
        // not begin with a '!' character or be null.
        Data?: { [key: string]: any };
        // Optional list of Data-keys to remove from UserData. Some SDKs cannot insert null-values into Data due to language
        // constraints. Use this to delete the keys directly.
        KeysToRemove?: string[];
        // Permission to be applied to all user data keys written in this request. Defaults to "private" if not set.
        Permission?: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface UpdateUserDataResult extends PlayFabModule.IPlayFabResultCommon {
        // Indicates the current version of the data that has been set. This is incremented with every set call for that type of
        // data (read-only, internal, etc). This version can be provided in Get calls to find updated data.
        DataVersion: number;
    }

    export interface UpdateUserInternalDataRequest extends PlayFabModule.IPlayFabRequestCommon {
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Key-value pairs to be written to the custom data. Note that keys are trimmed of whitespace, are limited in size, and may
        // not begin with a '!' character or be null.
        Data?: { [key: string]: string | null };
        // Optional list of Data-keys to remove from UserData. Some SDKs cannot insert null-values into Data due to language
        // constraints. Use this to delete the keys directly.
        KeysToRemove?: string[];
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface UpdateUserInventoryItemDataRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId?: string;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // Key-value pairs to be written to the custom data. Note that keys are trimmed of whitespace, are limited in size, and may
        // not begin with a '!' character or be null.
        Data?: { [key: string]: string | null };
        // Unique PlayFab assigned instance identifier of the item
        ItemInstanceId: string;
        // Optional list of Data-keys to remove from UserData. Some SDKs cannot insert null-values into Data due to language
        // constraints. Use this to delete the keys directly.
        KeysToRemove?: string[];
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
    }

    export interface UserAccountInfo {
        // User Android device information, if an Android device has been linked
        AndroidDeviceInfo?: UserAndroidDeviceInfo;
        // Sign in with Apple account information, if an Apple account has been linked
        AppleAccountInfo?: UserAppleIdInfo;
        // Timestamp indicating when the user account was created
        Created: string;
        // Custom ID information, if a custom ID has been assigned
        CustomIdInfo?: UserCustomIdInfo;
        // User Facebook information, if a Facebook account has been linked
        FacebookInfo?: UserFacebookInfo;
        // Facebook Instant Games account information, if a Facebook Instant Games account has been linked
        FacebookInstantGamesIdInfo?: UserFacebookInstantGamesIdInfo;
        // User Gamecenter information, if a Gamecenter account has been linked
        GameCenterInfo?: UserGameCenterInfo;
        // User Google account information, if a Google account has been linked
        GoogleInfo?: UserGoogleInfo;
        // User iOS device information, if an iOS device has been linked
        IosDeviceInfo?: UserIosDeviceInfo;
        // User Kongregate account information, if a Kongregate account has been linked
        KongregateInfo?: UserKongregateInfo;
        // Nintendo Switch account information, if a Nintendo Switch account has been linked
        NintendoSwitchAccountInfo?: UserNintendoSwitchAccountIdInfo;
        // Nintendo Switch device information, if a Nintendo Switch device has been linked
        NintendoSwitchDeviceIdInfo?: UserNintendoSwitchDeviceIdInfo;
        // OpenID Connect information, if any OpenID Connect accounts have been linked
        OpenIdInfo?: UserOpenIdInfo[];
        // Unique identifier for the user account
        PlayFabId?: string;
        // Personal information for the user which is considered more sensitive
        PrivateInfo?: UserPrivateAccountInfo;
        // User PSN account information, if a PSN account has been linked
        PsnInfo?: UserPsnInfo;
        // User Steam information, if a Steam account has been linked
        SteamInfo?: UserSteamInfo;
        // Title-specific information for the user account
        TitleInfo?: UserTitleInfo;
        // User Twitch account information, if a Twitch account has been linked
        TwitchInfo?: UserTwitchInfo;
        // User account name in the PlayFab service
        Username?: string;
        // Windows Hello account information, if a Windows Hello account has been linked
        WindowsHelloInfo?: UserWindowsHelloInfo;
        // User XBox account information, if a XBox account has been linked
        XboxInfo?: UserXboxInfo;
    }

    export interface UserAndroidDeviceInfo {
        // Android device ID
        AndroidDeviceId?: string;
    }

    export interface UserAppleIdInfo {
        // Apple subject ID
        AppleSubjectId?: string;
    }

    export interface UserCustomIdInfo {
        // Custom ID
        CustomId?: string;
    }

    type UserDataPermission = "Private"
        | "Public";

    export interface UserDataRecord {
        // Timestamp for when this data was last updated.
        LastUpdated: string;
        // Indicates whether this data can be read by all users (public) or only the user (private). This is used for GetUserData
        // requests being made by one player about another player.
        Permission?: string;
        // Data stored for the specified user data key.
        Value?: string;
    }

    export interface UserFacebookInfo {
        // Facebook identifier
        FacebookId?: string;
        // Facebook full name
        FullName?: string;
    }

    export interface UserFacebookInstantGamesIdInfo {
        // Facebook Instant Games ID
        FacebookInstantGamesId?: string;
    }

    export interface UserGameCenterInfo {
        // Gamecenter identifier
        GameCenterId?: string;
    }

    export interface UserGoogleInfo {
        // Email address of the Google account
        GoogleEmail?: string;
        // Gender information of the Google account
        GoogleGender?: string;
        // Google ID
        GoogleId?: string;
        // Locale of the Google account
        GoogleLocale?: string;
        // Name of the Google account user
        GoogleName?: string;
    }

    export interface UserIosDeviceInfo {
        // iOS device ID
        IosDeviceId?: string;
    }

    export interface UserKongregateInfo {
        // Kongregate ID
        KongregateId?: string;
        // Kongregate Username
        KongregateName?: string;
    }

    export interface UserNintendoSwitchAccountIdInfo {
        // Nintendo Switch account subject ID
        NintendoSwitchAccountSubjectId?: string;
    }

    export interface UserNintendoSwitchDeviceIdInfo {
        // Nintendo Switch Device ID
        NintendoSwitchDeviceId?: string;
    }

    export interface UserOpenIdInfo {
        // OpenID Connection ID
        ConnectionId?: string;
        // OpenID Issuer
        Issuer?: string;
        // OpenID Subject
        Subject?: string;
    }

    type UserOrigination = "Organic"
        | "Steam"
        | "Google"
        | "Amazon"
        | "Facebook"
        | "Kongregate"
        | "GamersFirst"
        | "Unknown"
        | "IOS"
        | "LoadTest"
        | "Android"
        | "PSN"
        | "GameCenter"
        | "CustomId"
        | "XboxLive"
        | "Parse"
        | "Twitch"
        | "WindowsHello"
        | "ServerCustomId"
        | "NintendoSwitchDeviceId"
        | "FacebookInstantGamesId"
        | "OpenIdConnect"
        | "Apple"
        | "NintendoSwitchAccount";

    export interface UserPrivateAccountInfo {
        // user email address
        Email?: string;
    }

    export interface UserPsnInfo {
        // PSN account ID
        PsnAccountId?: string;
        // PSN online ID
        PsnOnlineId?: string;
    }

    export interface UserSettings {
        // Boolean for whether this player is eligible for gathering device info.
        GatherDeviceInfo: boolean;
        // Boolean for whether this player should report OnFocus play-time tracking.
        GatherFocusInfo: boolean;
        // Boolean for whether this player is eligible for ad tracking.
        NeedsAttribution: boolean;
    }

    export interface UserSteamInfo {
        // what stage of game ownership the user is listed as being in, from Steam
        SteamActivationStatus?: string;
        // the country in which the player resides, from Steam data
        SteamCountry?: string;
        // currency type set in the user Steam account
        SteamCurrency?: string;
        // Steam identifier
        SteamId?: string;
        // Steam display name
        SteamName?: string;
    }

    export interface UserTitleInfo {
        // URL to the player's avatar.
        AvatarUrl?: string;
        // timestamp indicating when the user was first associated with this game (this can differ significantly from when the user
        // first registered with PlayFab)
        Created: string;
        // name of the user, as it is displayed in-game
        DisplayName?: string;
        // timestamp indicating when the user first signed into this game (this can differ from the Created timestamp, as other
        // events, such as issuing a beta key to the user, can associate the title to the user)
        FirstLogin?: string;
        // boolean indicating whether or not the user is currently banned for a title
        isBanned?: boolean;
        // timestamp for the last user login for this title
        LastLogin?: string;
        // source by which the user first joined the game, if known
        Origination?: string;
        // Title player account entity for this user
        TitlePlayerAccount?: EntityKey;
    }

    export interface UserTwitchInfo {
        // Twitch ID
        TwitchId?: string;
        // Twitch Username
        TwitchUserName?: string;
    }

    export interface UserWindowsHelloInfo {
        // Windows Hello Device Name
        WindowsHelloDeviceName?: string;
        // Windows Hello Public Key Hash
        WindowsHelloPublicKeyHash?: string;
    }

    export interface UserXboxInfo {
        // XBox user ID
        XboxUserId?: string;
    }

    export interface ValueToDateModel {
        // ISO 4217 code of the currency used in the purchases
        Currency?: string;
        // Total value of the purchases in a whole number of 1/100 monetary units. For example, 999 indicates nine dollars and
        // ninety-nine cents when Currency is 'USD')
        TotalValue: number;
        // Total value of the purchases in a string representation of decimal monetary units. For example, '9.99' indicates nine
        // dollars and ninety-nine cents when Currency is 'USD'.
        TotalValueAsDecimal?: string;
    }

    export interface Variable {
        // Name of the variable.
        Name: string;
        // Value of the variable.
        Value?: string;
    }

    export interface VirtualCurrencyRechargeTime {
        // Maximum value to which the regenerating currency will automatically increment. Note that it can exceed this value
        // through use of the AddUserVirtualCurrency API call. However, it will not regenerate automatically until it has fallen
        // below this value.
        RechargeMax: number;
        // Server timestamp in UTC indicating the next time the virtual currency will be incremented.
        RechargeTime: string;
        // Time remaining (in seconds) before the next recharge increment of the virtual currency.
        SecondsToRecharge: number;
    }

    export interface WriteEventResponse extends PlayFabModule.IPlayFabResultCommon {
        // The unique identifier of the event. The values of this identifier consist of ASCII characters and are not constrained to
        // any particular format.
        EventId?: string;
    }

    export interface WriteServerCharacterEventRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Custom event properties. Each property consists of a name (string) and a value (JSON object).
        Body?: { [key: string]: any };
        // Unique PlayFab assigned ID for a specific character owned by a user
        CharacterId: string;
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // The name of the event, within the namespace scoped to the title. The naming convention is up to the caller, but it
        // commonly follows the subject_verb_object pattern (e.g. player_logged_in).
        EventName: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
        // The time (in UTC) associated with this event. The value defaults to the current time.
        Timestamp?: string;
    }

    export interface WriteServerPlayerEventRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Custom data properties associated with the event. Each property consists of a name (string) and a value (JSON object).
        Body?: { [key: string]: any };
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // The name of the event, within the namespace scoped to the title. The naming convention is up to the caller, but it
        // commonly follows the subject_verb_object pattern (e.g. player_logged_in).
        EventName: string;
        // Unique PlayFab assigned ID of the user on whom the operation will be performed.
        PlayFabId: string;
        // The time (in UTC) associated with this event. The value defaults to the current time.
        Timestamp?: string;
    }

    export interface WriteTitleEventRequest extends PlayFabModule.IPlayFabRequestCommon {
        // Custom event properties. Each property consists of a name (string) and a value (JSON object).
        Body?: { [key: string]: any };
        // The optional custom tags associated with the request (e.g. build number, external trace identifiers, etc.).
        CustomTags?: { [key: string]: string | null };
        // The name of the event, within the namespace scoped to the title. The naming convention is up to the caller, but it
        // commonly follows the subject_verb_object pattern (e.g. player_logged_in).
        EventName: string;
        // The time (in UTC) associated with this event. The value defaults to the current time.
        Timestamp?: string;
    }

    export interface XboxLiveAccountPlayFabIdPair {
        // Unique PlayFab identifier for a user, or null if no PlayFab account is linked to the Xbox Live identifier.
        PlayFabId?: string;
        // Unique Xbox Live identifier for a user.
        XboxLiveAccountId?: string;
    }

}
