import PF from '../../../lib/playfab/_playfab';
const { GetLeaderboard, GetPlayerCombinedInfo } = PF;

import { destructureDataValues, destructureStatisticsValues } from './connect/connectPlayfab';
import { addStore, globalStore } from "./globalStore/globalStore";
import { getLobbyRoom } from "./lobbyRoom";
import {bridgeURL} from "../components/bridge/bridge-url";
import {getServerHttpURL} from "./connect/server-selection";
import {isEqual} from "../../../common/utils";
import {getNFTGolfClubs} from "./golfclubs";
import {getMaterialBalance} from "./material-balance";

const callbacks = []

const refreshLeaderboard = async (StatisticName?) => {
    if(StatisticName){
        const leaderboardResult = await GetLeaderboard({
            StatisticName,
            StartPosition: 0,
            MaxResultsCount: 10
        });
        globalStore.leaderboards.setState({
            [StatisticName]:leaderboardResult.Leaderboard.map(i=>({DisplayName:i.DisplayName, StatValue:i.StatValue}))
        });
    }else{
        const trainingLeaderboardResult = await GetLeaderboard({
            StatisticName:"training_success",
            StartPosition: 0,
            MaxResultsCount: 10
        });
        const competitionLeaderboardResult = await GetLeaderboard({
            StatisticName:"competition_points",
            StartPosition: 0,
            MaxResultsCount: 10
        });
        const competitionEventLeaderboardResult = await GetLeaderboard({
            StatisticName:"competition_points_event",
            StartPosition: 0,
            MaxResultsCount: 10
        });
        const competitionEventHourLeaderboardResult = await GetLeaderboard({
            StatisticName:"competition_points_event_hour",
            StartPosition: 0,
            MaxResultsCount: 10
        });
        globalStore.leaderboards.setState({
            training_success:trainingLeaderboardResult.Leaderboard.map(i=>({DisplayName:i.DisplayName, StatValue:i.StatValue})),
            competition_points:competitionLeaderboardResult.Leaderboard.map(i=>({DisplayName:i.DisplayName, StatValue:i.StatValue})),
            competition_points_event:competitionEventLeaderboardResult.Leaderboard.map(i=>({DisplayName:i.DisplayName, StatValue:i.StatValue})),
            competition_points_event_hour:competitionEventHourLeaderboardResult.Leaderboard.map(i=>({DisplayName:i.DisplayName, StatValue:i.StatValue})),
        });
    }
    
};

const refreshCompetitionGroupList = async ({userId, lobbySessionId}:{userId:string, lobbySessionId?:string}) => {
    let url =`${getServerHttpURL()}/competition-group-list?userId=${userId}`;
    if(lobbySessionId) url += `&lobbySessionId=${lobbySessionId}`;
    const {list} = await fetch(url)
                .then(r=>r.json());
    globalStore.userData.setState({
        pendentGroups:list //TODO move ot own store?
    });         
}

const refreshUserData = async ({onlyResources} = {onlyResources:false}) => {
    const {InfoResultPayload} = await GetPlayerCombinedInfo({//TODO REVIEW: maybe we can send socket from server with this info already
        InfoRequestParameters:{
            GetUserInventory:true,
            GetUserVirtualCurrency:true,
            GetUserReadOnlyData:true,
            GetPlayerStatistics:true
        },
    });
    const dailyMissionsData = onlyResources?globalStore.userData.getState().dailyMissionsData:await fetch(`https://golfcraftgame.com/api/get-daily-missions/${globalStore.userData.getState().PlayFabId}`).then(r=>r.json(), ()=>globalStore.userData.getState().dailyMissionsData);

    if(!InfoResultPayload) return;
    const address = globalStore.userData.getState().userId;
    const materialsBalance = (await getMaterialBalance(address)) || {};

if(onlyResources){
    globalStore.userData.setState({
        ...materialsBalance,
        ...InfoResultPayload.UserVirtualCurrency,
    });
}else{
    globalStore.userData.setState({
        dailyMissionsData:isEqual(dailyMissionsData, globalStore.userData.getState().dailyMissionsData) ? globalStore.userData.getState().dailyMissionsData : dailyMissionsData,
        ...materialsBalance,
        ...destructureDataValues(InfoResultPayload.UserReadOnlyData),
        activeGolfClubTokenId:InfoResultPayload.UserReadOnlyData?.activeGolfClubTokenId?.Value||null,
        ...InfoResultPayload.UserVirtualCurrency,
        ...destructureStatisticsValues(InfoResultPayload.PlayerStatistics),
        //...mapInventoryMaterials(InfoResultPayload.UserInventory),
        golfclubs:[...filterInventoryGolfclubs(InfoResultPayload.UserInventory), ... await getNFTGolfClubs({address})],
        trainingBoost:findInventoryTrainingBoost(InfoResultPayload.UserInventory)||null,
        chests: InfoResultPayload.UserInventory
            .filter((item)=>item.ItemClass === "Chest")
            .map(({ItemId, ItemInstanceId, CustomData})=>
                ({
                    ItemId,
                    ItemInstanceId,
                    groupPlayers:CustomData && JSON.parse(CustomData.groupPlayers || CustomData.group||null)||undefined,//TODO remove legacy .group
                    groupId:CustomData && CustomData.groupId ||undefined,
                    courseId:CustomData && CustomData.courseId || undefined,
                })),
        currentTrainingID: InfoResultPayload?.UserReadOnlyData?.currentTrainingID.Value,
        currentTrainingCourseID: InfoResultPayload?.UserReadOnlyData?.currentTrainingCourseID.Value
    });
}


    callbacks.forEach((c)=>{c()});
}

export const refreshUserStatistic = async (StatisticName?) => {
    //TODO do only the specific necessary request
    await refreshUserData();
}

function filterInventoryGolfclubs(UserInventory){
    return UserInventory.filter(item=>item.ItemClass==="Golfclub" && item.ItemId === "golfclub-1");
}

function findInventoryTrainingBoost(UserInventory){
    return UserInventory.find(item=>item.ItemClass==="TrainingBoost");
}

function mapInventoryMaterials(UserInventory){
    const materialItemIds = ["Gem"];
    return materialItemIds.reduce((acc, ItemId)=>{
        const materialFound = UserInventory.find((item)=>item.ItemId === ItemId);
        if(!materialFound){
            acc[`material_${ItemId}`] = 0;
        }else{
            acc[`material_${ItemId}`] = materialFound.RemainingUses || 0;
        }
        return acc;
    },{});
    return UserInventory.reduce((acc, current) => {
        if(current.ItemClass === "Material")
        acc[`material_${current.ItemId}`] = current.RemainingUses||0;
        return acc;
    }, {});
}

function registerCallback(callback:Function) {
    callbacks.push(callback)
}

export {
    refreshUserData,
    refreshLeaderboard,
    mapInventoryMaterials,
    refreshCompetitionGroupList,
    registerCallback
}
