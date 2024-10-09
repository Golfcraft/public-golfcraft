import { PlayFabServer } from "playfab-sdk";
import { promisify } from "util";
import { ChestTier1Winner1,ChestTier1Winner2,ChestTier1Winner3, MAX_PER_GROUP } from "../../common/constants";
import { courseDefinitionsRepo, getCourseDefinition } from "../../common/course-definitions/course-definition-repository";
import { getRandomInt } from "../../common/utils";
import { CompetitionGroupRoomRepresentation,CompetitionGroupPlayer } from "./Groups.d";
import { getGroupMatchForPlayer } from "./group-matcher";
import fetch from "cross-fetch";
import {callDiscordHook} from "../../common/discord";
import {fetchRemoteCourses} from "../../common/fetch-remote-courses";
const _callDiscordHook = (str) => callDiscordHook(str, "https://discordapp.com/api/webhooks/941360736716865626/Rhvaq3I_KOzggFoli6JTfdlDbwf-_QpwrWulrvFitp6zFKuLw84u-annhUyfMAnweGFr");

type CompetitionGroupRoomRequest = {
    body:{
        userId:string,
        displayName:string,
        PlayFabId:string,
        server:string,
        competition_points?:number
    }
}
const POAP_MIN_DATE = new Date("2022-02-18T20:00:00.000Z");
const groups:{[id:string]:CompetitionGroupRoomRepresentation} = {};

let nextGroupId = 1;
const GROUP_BUFFER = 10;
const createCompetitionGroups = ({ app }) => {

    app.post(`*/get-group-by-id`, (req, res) => {
        console.log("get-group-by.id",req.body);
        const group = getGroupById({groupId:req.body.groupId});
        console.log("group", group);
        return res.json(group)
    });
    
    app.post(`*/player-start`, (req, res)=>{
        const {player, groupId} = req.body;
        if(groups[groupId].players[player.userId]){
            Object.assign(groups[groupId].players[player.userId], player);
        }else{
            console.log("REVIEW PROBLEM, PLAYER SHOULD ALREADY BE THERE");
            groups[groupId].players[player.userId] = player;
        }
    });

    app.post(`*/add-player-result`, (req, res) => {
        const {playerResult, groupId} = req.body;
        console.log("received player result", playerResult, groupId);
        if(!(groups[groupId])){
            console.log("group does not exists", groupId);
            console.log("player result", playerResult);
        }
        Object.assign(groups[groupId].players[playerResult.userId], playerResult);
        if(Object.values(groups[groupId]?.players).filter(p=>p.holeTime).length === MAX_PER_GROUP ){
            
        }
    });

    app.post('*/request-competition-group-room', async (req:CompetitionGroupRoomRequest, res) => {
        //TODO check that the user has enough balance
        try{
            const { userId, displayName, PlayFabId, server, competition_points } = req.body;
            
            let groupToAssign = getGroupMatchForPlayer({groups, userId, bufferLength:GROUP_BUFFER, competition_points});
            
            if(groupToAssign){
                groupToAssign.players[userId] = {userId, startTime:Date.now() + 5000, displayName, PlayFabId, server};
                groupToAssign.competition_points = (groupToAssign.competition_points + competition_points) / 2;
            
                res.json(groupToAssign);
            }else{
                groups[nextGroupId] = {
                    id:nextGroupId.toString(),
                    courseId:await getRandomCourseId(),
                    players:{
                        [userId]:{userId, startTime:Date.now() + 5000, displayName, 
                            PlayFabId, //TODO review, we don't want to share PlayFabId with other users if possible
                            server}
                    },
                    competition_points
                }
            
                res.json(groups[nextGroupId]);
                nextGroupId++;
            }
        }catch(err){
            res.status(400).send(err);
        }
    });

    app.get('*/competition-group-list', (req, res)=>{
        const userId = req.query.userId;
        const lobbySessionId = req.query.lobbySessionId;
        const list:CompetitionGroupRoomRepresentation[] = Object.values(groups).filter(group=>group.players[userId] && !group.finished);

        if(lobbySessionId){//TODO not sure if this is the best place, also authorization is not handled
            list.forEach(group=>{
                Object.values(group.players).forEach(player=>{
                    if(player.userId === userId) player.lobbySessionId = lobbySessionId;
                })
            });
        }

        res.json({list});
    });
    const callbacks = {
        onFinishedGroup:null
    }
    setInterval(checkForFinishedGroups, 5000);
    return {
        onFinishedGroup:(fn)=>{
            callbacks.onFinishedGroup = fn;
            return () => callbacks.onFinishedGroup = null;
        }
    };
    

    async function checkForFinishedGroups () {
        for(let group of Object.values(groups)){
         const groupId = group.id;
     
         if(!groups[groupId]){
             return;
         }
         const courseDefinition:any = await getCourseDefinition({
             type:'competition',
             courseId:group.courseId,
             subType:"1"
         }, fetch);
         if(await isGroupAllPlayersOverdue({groupId, courseDefinition})){
             const playersSortedByWinner = getGroupWinners({groupId, courseDefinition});
             if(!deleteGroup({groupId})) {//TODO REVIEW error handling on strict mode; checking delete result
                console.log("REVIEW NON EXISTENT GROUP TRIED DELETE")
                return;
             };
     
             if(playersSortedByWinner?.length) {
                 console.log("giving rewards", playersSortedByWinner.map(p=>p?.displayName || p?.PlayFabId || "empty"));
                 await giveRewards({winners:playersSortedByWinner, group});
                 console.log("given rewards to" , playersSortedByWinner.map(p=>p?.displayName || p?.PlayFabId || "empty"))
                 const [winner1, winner2, winner3] = playersSortedByWinner;
                 if(!winner1 || !winner2 || !winner3){
                     console.log("SOME ERROR HAPPENED we don't have all winners", JSON.stringify(group));
                 }
                 console.log("updating statistics winner1");
                 winner1?.PlayFabId && PlayFabServer.UpdatePlayerStatistics({
                     PlayFabId:winner1.PlayFabId,
                     Statistics:[
                         {
                             StatisticName:"competition_play",
                             Value:1
                         },
                         {
                             StatisticName:"competition_points",
                             Value:3
                         },
                         {
                             StatisticName:"competition_points_event",
                             Value:3
                         },
                         {
                            StatisticName:"competition_points_event_hour",
                            Value:3
                         },
                         {
                             StatisticName:"POAP",
                             Value:3
                         }
                     ]
                 }, (error, result)=>{
                     if(error) console.log("error updating winner1 statistics", error);
                     console.log("updated Statistics winner1", result);
                 });
                 console.log("updating statistics winner2");
                 winner2?.PlayFabId && PlayFabServer.UpdatePlayerStatistics({
                     PlayFabId:winner2.PlayFabId,
                     Statistics:[
                         {
                             StatisticName:"competition_play",
                             Value:1
                         },
                         {
                             StatisticName:"competition_points",
                             Value:2
                         },
                         {
                             StatisticName:"competition_points_event",
                             Value:2
                         },
                         {
                            StatisticName:"competition_points_event_hour",
                            Value:2
                         }
                     ]
                 }, (error, result)=>{
                     if(error) console.log("error updating winner2 statistics", error);
                     console.log("updated Statistics winner1", result);
                 });
                 console.log("updating statistics winner3", winner3?.holeTime);
                 winner3?.PlayFabId && winner3.holeTime && PlayFabServer.UpdatePlayerStatistics({
                     PlayFabId:winner3.PlayFabId,
                     Statistics:[
                         {
                             StatisticName:"competition_play",
                             Value:1
                         },
                         {
                             StatisticName:"competition_points",
                             Value:1
                         },
                         {
                             StatisticName:"competition_points_event",
                             Value:1
                         },
                         {
                            StatisticName:"competition_points_event_hour",
                            Value:1
                         }
                     ]
                 }, (error, result)=>{
                     if(error) console.log("error updating winner3 statistics", error);
                     console.log("updated Statistics winner1", result);
                 });

                 if(isTimeForPOAP() && winner1?.userId){
                   // sendPOAP(winner1);
                 }


                 function isTimeForPOAP(){
                     return POAP_MIN_DATE < new Date();
                 }
             }
         }
        }

        async function giveRewards({winners, group}:{winners:CompetitionGroupPlayer[], group:CompetitionGroupRoomRepresentation}){
         const [winner1, winner2, winner3] = winners;
         const itemInstanceIds = [
             winner1?.holeTime && await promisify(PlayFabServer.GrantItemsToUser)({ //TODO IMPORTANT move to executeCloudScript to avoid API CALLS
                 PlayFabId:winner1.PlayFabId,
                 ItemIds:[ChestTier1Winner1]
             }),
             winner2?.holeTime && await promisify(PlayFabServer.GrantItemsToUser)({
                 PlayFabId:winner2.PlayFabId,
                 ItemIds:[ChestTier1Winner2]
             }),
             winner3?.holeTime && await promisify(PlayFabServer.GrantItemsToUser)({
                 PlayFabId:winner3.PlayFabId,
                 ItemIds:[ChestTier1Winner3]
             })
         ].filter(i=>i).map(({data}, index) => data.ItemGrantResults[0].ItemInstanceId);
     
         for(let index in itemInstanceIds){
             const ItemInstanceId = itemInstanceIds[index];
             const currentWinner = winners[index];
     
             const updateResult = await promisify(PlayFabServer.UpdateUserInventoryItemCustomData)({
                 ItemInstanceId,
                 PlayFabId:currentWinner.PlayFabId,
                 Data:{
                     groupPlayers:JSON.stringify(Object.values(group.players) //TODO max 100 chars, separate in different keys, result_name, result_time, result_shoots
                     .map(player=>[//TODO duplicated Code
                         player.displayName.substring(0,12) || '<Unknown>',
                         formatTimeSinceStart(player.startTime, player.holeTime) || "00:00",
                         player.shoots?.length || 0
                     ]).sort((rowA, rowB) => {
                         if(rowA[1] === "99:99") return +1;
                         if(rowB[1] === "99:99") return -1;
                         if(rowA[2] === rowB[2]) return rowA[1] < rowB[1] ? -1 : +1;
                         return Number(rowA[2]) - Number(rowB[2]);
                     })),
                     groupId:group.id,
                     courseId:group.courseId
                 }
             });
         }
         callbacks.onFinishedGroup && callbacks.onFinishedGroup({winners:[winner1, winner2, winner3], group});
        }
    }
};

export const getGroups = () => groups;
const getGroupById = ({groupId}) => groups[groupId];
const deleteGroup = ({groupId}) => {
    return delete groups[groupId];
};

export const isGroupAllPlayersOverdue = ({groupId, courseDefinition}) => {
    const {courseId} = getGroupById({groupId});//TODO memoize or optimize?
    const players =  Object.values(groups[groupId].players);
    if(players.length < MAX_PER_GROUP) return false;
    return players
        .every(player =>
            player.startTime
                && isPlayerGameplayFinished(player, courseDefinition)
        )
}

function isPlayerGameplayFinished(player, courseDefinition){
    return (player.holeTime
        || ((Date.now() - (courseDefinition.metadata.duration*1000) ) > (player.startTime+10000))
    );
}

export {
    createCompetitionGroups
};

export function getGroupWinners ({groupId, courseDefinition}) {
    const group = groups[groupId];//TODO important, what happens if all overdue
    if(!group) {
        console.log("REVIEW ERROR CODE 001");
        return;
    };
    return Object.values(group.players).sort((playerA, playerB)=>{
        if(!playerA.holeTime) return +1;
        if(!playerB.holeTime) return -1;
        if(playerA.shoots?.length !== playerB.shoots?.length) return Number(playerA.shoots?.length||0) - Number(playerB.shoots?.length||0);

        return (playerA.holeTime-playerA.startTime) < (playerB.holeTime-playerB.startTime) ? -1 : +1;
    }).filter(p => isPlayerGameplayFinished(p, courseDefinition) && p.PlayFabId);
}

function formatTimeSinceStart(startTime, endTime){ //TODO duplicated code
    if(!endTime) return `99:99`;
    const ms = endTime - startTime;
    const seconds = Math.floor(ms/1000);
    const minutes = Math.floor(seconds/60);
    const restSeconds = seconds % 60;
    const minutesStr = minutes < 10 ? `0${minutes}`:minutes;
    const secondsStr = restSeconds < 10 ? `0${restSeconds}`:restSeconds;

    return `${minutesStr}:${secondsStr}`;
}
const courseIds = Object.keys(courseDefinitionsRepo.competition["1"]);

async function getRandomCourseId(){
    const remoteCourses = await fetchRemoteCourses({
        where:{
            status:2,
            mode:"competition",
            createdBy:"admin"
        }
    });

    const allCourseIds = [...courseIds, ...remoteCourses];

    return allCourseIds[getRandomInt(0, allCourseIds.length-1)];
}

function sendPOAP(winner1){
    const data =JSON.stringify({
        address:winner1.userId
    });

    fetch("https://poapapi.dcl.guru/claim/28343",{
        method:"post",
        body:data,
        headers:{
            "Content-Type":"application/json",
            "Authorization":"VuYWnUQUSuULIORpxBZiBNJGRVJ7mSql"
        }
    }).then(async (response)=>{
        if(response.status === 200){
            //TODO notify discord
            //Events public channel
            callDiscordHook(`POAP sent for ${winner1.displayName}`, "https://discordapp.com/api/webhooks/944287866274607214/fX6kDHSnpWawJdbyRfywzolR_U_-7VPzVl_rbT32vCMV_rIu54UERUPeUphL1bldS_lf");
        }else{
            _callDiscordHook(`${response.status} ${JSON.stringify(await response.json())} body data->${data}`)
            //TODO notify discord
        }
    }).catch((err)=>{
        //TODO notify discord
        let msg

        try {
            msg = JSON.stringify(err);
        } catch(err){
            msg = err;
        }
        _callDiscordHook(`${msg}`);
    });
}