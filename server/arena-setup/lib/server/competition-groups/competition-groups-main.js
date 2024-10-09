"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompetitionGroups = exports.isGroupAllPlayersOverdue = exports.deleteGroup = exports.getUserGroups = exports.getGroupById = void 0;
const playfab_sdk_1 = require("playfab-sdk");
const util_1 = require("util");
const constants_1 = require("../../common/constants");
const course_definition_repository_1 = require("../../common/course-definitions/course-definition-repository");
const utils_1 = require("../../common/utils");
const GameLobbyRoom_1 = require("../rooms/GameLobbyRoom");
const groups = {};
const finishedGroups = {}; //TODO buffer size? -> when necessary
let nextGroupId = 1;
const createCompetitionGroups = ({ app }) => {
    app.post('*/request-competition-group-room', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        //TODO check that the user has enough balance
        const { userId, displayName, PlayFabId, realm } = req.body;
        const groupIds = Object.keys(groups)
            .filter(groupId => !groups[groupId].players[userId])
            .filter(groupId => Object.keys(groups[groupId].players).length < constants_1.MAX_PER_GROUP);
        if (groupIds.length <= 1) {
            //create new one
            //TODO assign gameDefinition or courseId
            groups[nextGroupId] = {
                id: nextGroupId.toString(),
                courseId: getRandomCourseId(),
                players: {
                    [userId]: { userId, startTime: 0, displayName, PlayFabId, realm }
                }
            };
            console.log(`assigned new group to ${userId} with groupId ${nextGroupId}, course-id: ${groups[nextGroupId].courseId}`);
            res.json(groups[nextGroupId]);
            nextGroupId++;
        }
        else {
            const indexOfGroupToAssign = utils_1.getRandomInt(0, groupIds.length - 1);
            console.log("indexOfGroupToAssign", indexOfGroupToAssign);
            const groupId = groupIds[indexOfGroupToAssign];
            groups[groupId].players[userId] = { userId, startTime: 0, displayName, PlayFabId, realm };
            console.log(`assigned existing group to ${userId}`, groups[groupId]);
            res.json(groups[groupId]);
        }
    }));
    app.get('*/competition-group-list', (req, res) => {
        const userId = req.query.userId;
        const lobbySessionId = req.query.lobbySessionId;
        console.log("/competition-group-list", userId, lobbySessionId);
        const list = Object.values(groups).filter(group => group.players[userId] && !group.finished);
        if (lobbySessionId) { //TODO not sure if this is the best place, also authorization is not handled
            list.forEach(group => {
                Object.values(group.players).forEach(player => {
                    if (player.userId === userId)
                        player.lobbySessionId = lobbySessionId;
                });
            });
        }
        console.log("list.lemgtj", list.length);
        res.json({ list });
    });
};
exports.createCompetitionGroups = createCompetitionGroups;
exports.getGroupById = ({ groupId }) => groups[groupId];
exports.getUserGroups = ({ userId }) => Object.values(groups).filter(group => group.players[userId]);
exports.deleteGroup = ({ groupId }) => {
    return delete groups[groupId];
};
setInterval(checkForFinishedGroups, 5000);
function checkForFinishedGroups() {
    return __awaiter(this, void 0, void 0, function* () {
        for (let group of Object.values(groups)) {
            const groupId = group.id;
            if (!groups[groupId]) {
                console.log("REVIEW non existent group 002");
                return;
            }
            if (yield exports.isGroupAllPlayersOverdue({ groupId })) {
                const playersSortedByWinner = getGroupWinners({ groupId });
                if (!exports.deleteGroup({ groupId })) { //TODO REVIEW error handling on strict mode; checking delete result
                    console.log("trying to finish non existent group");
                    return;
                }
                ;
                if (playersSortedByWinner === null || playersSortedByWinner === void 0 ? void 0 : playersSortedByWinner.length) {
                    yield giveRewards({ winners: playersSortedByWinner, group });
                }
                //TODO REVIEW MAYBE when user enters other realm, it should also be notified, so realm on groups should be updated as soon as user enters the scene: //groups-update-realm
            }
        }
        function giveRewards({ winners, group }) {
            var _a, _b, _c;
            return __awaiter(this, void 0, void 0, function* () {
                const [winner1, winner2, winner3] = winners;
                const itemInstanceIds = [yield util_1.promisify(playfab_sdk_1.PlayFabServer.GrantItemsToUser)({
                        PlayFabId: winner1.PlayFabId,
                        ItemIds: [constants_1.ChestTier1Winner1]
                    }),
                    winner2 && (yield util_1.promisify(playfab_sdk_1.PlayFabServer.GrantItemsToUser)({
                        PlayFabId: winner2.PlayFabId,
                        ItemIds: [constants_1.ChestTier1Winner2]
                    })),
                    winner3 && (yield util_1.promisify(playfab_sdk_1.PlayFabServer.GrantItemsToUser)({
                        PlayFabId: winner3.PlayFabId,
                        ItemIds: [constants_1.ChestTier1Winner3]
                    }))].filter(i => i).map(({ data }, index) => data.ItemGrantResults[0].ItemInstanceId);
                for (let index in itemInstanceIds) {
                    const ItemInstanceId = itemInstanceIds[index];
                    const currentWinner = winners[index];
                    const updateResult = yield util_1.promisify(playfab_sdk_1.PlayFabServer.UpdateUserInventoryItemCustomData)({
                        ItemInstanceId,
                        PlayFabId: currentWinner.PlayFabId,
                        Data: {
                            groupPlayers: JSON.stringify(Object.values(group.players) //TODO max 100 chars, separate in different keys, result_name, result_time, result_shoots
                                .map(player => {
                                var _a;
                                return [
                                    player.displayName.substring(0, 12) || '<Unknown>',
                                    formatTimeSinceStart(player.startTime, player.holeTime) || "00:00",
                                    ((_a = player.shoots) === null || _a === void 0 ? void 0 : _a.length) || 0
                                ];
                            }).sort((rowA, rowB) => {
                                if (rowA[1] === "99:99")
                                    return +1;
                                if (rowB[1] === "99:99")
                                    return -1;
                                if (rowA[2] === rowB[2])
                                    return Number(rowA[1]) - Number(rowB[1]);
                                return Number(rowA[2]) - Number(rowB[2]);
                            })),
                            groupId: group.id,
                            courseId: group.courseId
                        }
                    });
                    console.log("chest data update", updateResult);
                }
                const winner1LobbyClient = (_a = GameLobbyRoom_1.lobbyRooms[winner1.realm]) === null || _a === void 0 ? void 0 : _a.clientsMapBySessionId[winner1.lobbySessionId];
                const winner2LobbyClient = winner2 && ((_b = GameLobbyRoom_1.lobbyRooms[winner2.realm]) === null || _b === void 0 ? void 0 : _b.clientsMapBySessionId[winner2.lobbySessionId]);
                const winner3LobbyClient = winner3 && ((_c = GameLobbyRoom_1.lobbyRooms[winner3.realm]) === null || _c === void 0 ? void 0 : _c.clientsMapBySessionId[winner3.lobbySessionId]);
                winner1LobbyClient && winner1LobbyClient.send("UPDATE_COMPETITION_GROUP_REWARDS", group); //TODO maybe not send only this group but all of the player¿
                winner2 && winner2LobbyClient && winner2LobbyClient.send("UPDATE_COMPETITION_GROUP_REWARDS", group);
                winner3 && winner3LobbyClient && winner3LobbyClient.send("UPDATE_COMPETITION_GROUP_REWARDS", group);
                console.log("GROUPS", JSON.stringify(groups));
            });
        }
    });
}
exports.isGroupAllPlayersOverdue = ({ groupId }) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = exports.getGroupById({ groupId }); //TODO memoize or optimize?
    const courseDefinition = yield course_definition_repository_1.getCourseDefinition({
        type: 'competition',
        courseId,
        subType: "1"
    });
    const players = Object.values(groups[groupId].players);
    if (players.length < constants_1.MAX_PER_GROUP)
        return false;
    return players
        .every(player => player.startTime
        && (player.holeTime
            || ((Date.now() - (courseDefinition.metadata.duration * 1000)) > player.startTime)));
});
function getGroupWinners({ groupId }) {
    const group = groups[groupId]; //TODO important, what happens if all overdue
    if (!group) {
        console.log("REVIEW CODE 001");
        return;
    }
    ;
    return Object.values(group.players).sort((playerA, playerB) => {
        if (!playerA.holeTime)
            return +1;
        if (playerA.shoots !== playerB.shoots)
            return Number(playerB.shoots || 0) - Number(playerA.shoots || 0);
        return (playerA.holeTime || Number.MAX_SAFE_INTEGER) - (playerB.holeTime || Number.MAX_SAFE_INTEGER);
    }).filter(p => p.holeTime && p.PlayFabId);
}
function formatTimeSinceStart(startTime, endTime) {
    if (!endTime)
        return `99:99`;
    const ms = endTime - startTime;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const restSeconds = seconds % 60;
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    const secondsStr = restSeconds < 10 ? `0${restSeconds}` : restSeconds;
    return `${minutesStr}:${secondsStr}`;
}
const courseIds = Object.keys(course_definition_repository_1.courseDefinitionsRepo.competition["1"]);
function getRandomCourseId() {
    return courseIds[utils_1.getRandomInt(0, courseIds.length - 1)];
}
