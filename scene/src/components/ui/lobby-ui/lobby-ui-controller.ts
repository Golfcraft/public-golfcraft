import {createLobbyUi} from "./lobby-ui";
import {globalStore} from "../../../services/globalStore/globalStore";
import {getGolfclubIdFromTokenId} from "../../attached-golfclub";
import {GOLF_CLUB_BONUSES} from "../../../../../common/constants";
const DEFAULT_GOLFCLUB_NAME = "GOLF CLUB"

export const createLobbyUiController = ()=>{
    const userState = globalStore.userData.getState();
    const initialState = {
        ...userState,
        ...globalStore.game.getState(),
        TrainingBonus:getBonusFromUserState(userState).bonus
    }
    const lobbyUi = createLobbyUi(initialState);
    const golfclubs = globalStore.userData.getState().golfclubs;
    if(globalStore.game.getState().introScreen) lobbyUi.hide();

    initGolfclub();

    globalStore.userData.onChange(({newValue, oldValue, prop}:any)=>{
        console.log("lobby UI update", prop);
        lobbyUi.updateProp(prop, newValue);
    });

    globalStore.userData.onChange(({newValue, oldValue}:any)=>{
        const id = getGolfclubIdFromTokenId(newValue, globalStore.userData.getState().golfclubs)||1;
        lobbyUi.updateActiveGolfClub({id, name:GOLF_CLUB_NAME[id]||DEFAULT_GOLFCLUB_NAME});

        lobbyUi.updateElements({
            GolfClubPower:id != 1 ? 5 : (golfclubs[0].CustomData?.attribute_power||0),
            GolfClubControl:id != 1? 5 : (golfclubs[0].CustomData?.attribute_control||0),
            GolfClubAim:id != 1?  5 : (golfclubs[0].CustomData?.attribute_aim||0),
        })
    },"activeGolfClubTokenId");

    globalStore.userData.onChange(({newValue, oldValue})=>{
        const id = getGolfclubIdFromTokenId(globalStore.userData.getState().activeGolfClubTokenId, globalStore.userData.getState().golfclubs)||1;
        lobbyUi.updateActiveGolfClub({id, name:GOLF_CLUB_NAME[id]||DEFAULT_GOLFCLUB_NAME});

        lobbyUi.updateElements({
            GolfClubPower:id != 1 ? 5 : (golfclubs[0].CustomData?.attribute_power||0),
            GolfClubControl:id != 1? 5 : (golfclubs[0].CustomData?.attribute_control||0),
            GolfClubAim:id != 1?  5 : (golfclubs[0].CustomData?.attribute_aim||0),
        })
    },"golfclubs");
    globalStore.userData.onChange(async ({newValue})=>{
        lobbyUi.updateDailyMissionData(newValue);
    },"dailyMissionsData");
    globalStore.game.onChange(hideOrShow, "playing");
    globalStore.game.onChange(hideOrShow, "editing");
    globalStore.game.onChange(hideOrShow, "introScreen");
    globalStore.game.onChange(updateServerUi, "selectedServer");
    globalStore.game.onChange(updateServerUi, "reconnecting");
    globalStore.game.onChange(updateServerUi, "connecting");

    function updateServerUi(){
        const gameState = globalStore.game.getState();
        lobbyUi.updateSelectedServer({gameState})
    }

    function hideOrShow({newValue}:any){
        if(newValue){
            lobbyUi.hide();
        }else{
            lobbyUi.show();
        }
    }

    function initGolfclub(){
        const id = getGolfclubIdFromTokenId(globalStore.userData.getState().activeGolfClubTokenId, globalStore.userData.getState().golfclubs)||1;
        lobbyUi.updateActiveGolfClub({id, name:GOLF_CLUB_NAME[id]||DEFAULT_GOLFCLUB_NAME});
        const golfclubElementsData = {
            GolfClubPower:id != 1 ? 5 : (golfclubs[0].CustomData?.attribute_power||0),
            GolfClubControl:id != 1? 5 : (golfclubs[0].CustomData?.attribute_control||0),
            GolfClubAim:id != 1?  5 : (golfclubs[0].CustomData?.attribute_aim||0),
        };
        lobbyUi.updateElements(golfclubElementsData);
    }
}

var GOLF_CLUB_NAME:{[key:string]:string} = {
    "0":"Star trail",
    "2":"Star",
    "3":"Eye wide shot",
    "5":"Pink Star",
    "6":"Poti club by Tobik",
    "7": "Vampire bait",
    "8": "MC2 Golf club"
}
const MS_HOUR = 1000 * 60 * 60;
export function getBonusFromUserState(userState){
    let bonus = 0;

    if(userState.trainingBoost){
        bonus+=100;
    }
    if(userState.golfclubs){
        const uniqItemIds = Object.keys(userState.golfclubs.reduce((acc, current)=>{
            acc[current.ItemId] = true;
            return acc;
        },{}));
        uniqItemIds.forEach(ItemId => {
            const golfClubId = ItemId.replace('golfclub-','');
            if(GOLF_CLUB_BONUSES[golfClubId]){
                bonus += GOLF_CLUB_BONUSES[golfClubId];
            }
        })
    }
    if(userState.wearablesBonus){
        bonus += Math.min(Number(userState.wearablesBonus), 50);
    }

    return {
        bonus,
        expireTime:new Date(userState?.trainingBoost?.CustomData?.Expiration || userState?.trainingBoost?.Expiration || getFallbackExpirationISO(userState)).getTime()
    };

    function getFallbackExpirationISO(userState){
        const trainingBoostItem = userState?.trainingBoost;
        const amount = trainingBoostItem?.RemainingUses||0;
        const fallbackExpirationTime =  new Date(trainingBoostItem?.PurchaseDate).getTime() + amount*MS_HOUR;
        return fallbackExpirationTime;
    }
}