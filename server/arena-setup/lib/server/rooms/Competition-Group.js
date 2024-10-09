"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.CompetitionGroupRoom = void 0;
const colyseus_1 = require("colyseus");
const schema_1 = require("@colyseus/schema");
const constants_1 = require("../../common/constants");
const competition_groups_main_1 = require("../competition-groups/competition-groups-main");
const GameLobbyRoom_1 = require("./GameLobbyRoom");
const playfab_sdk_1 = require("playfab-sdk");
const util_1 = require("util");
const golfplay_server_1 = require("./golfplay-server");
const GamePlayState_1 = require("./GamePlayState");
const course_definition_repository_1 = require("../../common/course-definitions/course-definition-repository");
const course_animations_migration_1 = require("../../common/course-animations-migration");
class CompetitionGroupState extends schema_1.Schema {
    constructor(courseDefinition) {
        super();
        this.shoots = 0;
        this.startTime = Date.now() + 5000;
        this.duration = courseDefinition.metadata.duration;
        this.gameplay = new GamePlayState_1.Gameplay({ spawnPosition: new GamePlayState_1.Vector3(0, 0, 0) });
    }
}
__decorate([
    schema_1.type("uint64")
], CompetitionGroupState.prototype, "startTime", void 0);
__decorate([
    schema_1.type("uint8")
], CompetitionGroupState.prototype, "duration", void 0);
__decorate([
    schema_1.type(GamePlayState_1.Gameplay)
], CompetitionGroupState.prototype, "gameplay", void 0);
class CompetitionGroupRoom extends colyseus_1.Room {
    onAuth(client, { PlayFabId }, request) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO ensure it is the correct group
            const { data } = yield util_1.promisify(playfab_sdk_1.PlayFabServer.GetUserInventory)({ PlayFabId });
            const { VirtualCurrency } = data;
            if (Number(VirtualCurrency.GC || 0) < constants_1.PRICE_COMPETITION_GROUP) {
                return false;
            }
            util_1.promisify(playfab_sdk_1.PlayFabServer.SubtractUserVirtualCurrency)({
                PlayFabId,
                "VirtualCurrency": "GC",
                "Amount": constants_1.PRICE_COMPETITION_GROUP
            });
            return true;
        });
    }
    clockCheck({ client, userId, PlayFabId }) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const holeTime = (_b = (_a = this.groupRepresentation) === null || _a === void 0 ? void 0 : _a.players[userId]) === null || _b === void 0 ? void 0 : _b.holeTime;
            if (!this.state.finished && (this.isOverdue(Date.now()) || this.isOverdue(holeTime))) {
                clearInterval(this.interval);
                this.state.finished = true;
                this.golfPlay.dispose();
                this.broadcastUpdateGroupListToOtherPlayers({ userId });
                client.leave(constants_1.LEAVE_CODE.TIMEOUT);
            }
        });
    }
    onCreate({ realm, user, userId, groupId, gameDefinition }) {
        return __awaiter(this, void 0, void 0, function* () {
            this.lobbyRoom = GameLobbyRoom_1.lobbyRooms[realm];
            this.groupRepresentation = competition_groups_main_1.getGroupById({ groupId });
            console.log("creating room for group", this.groupRepresentation);
            this.gameDefinition = {
                type: "competition",
                subType: "1",
                courseId: this.groupRepresentation.courseId
            };
            if (gameDefinition) { //TODO only for test, remove for production, client shouldn't decide course
                this.gameDefinition = gameDefinition;
            }
            this.courseDefinition = course_animations_migration_1.migrateCourseDefinitionAnimations(yield course_definition_repository_1.getCourseDefinition(this.gameDefinition));
            this.setState(new CompetitionGroupState(this.courseDefinition));
        });
    }
    broadcastUpdateGroupListToOtherPlayers({ userId }) {
        console.log("broadcastFinishedGroupGameplayToGroupUsers", Object.values(this.groupRepresentation.players));
        Object.values(this.groupRepresentation.players).forEach((player) => {
            var _a;
            if (player.lobbySessionId && player.userId !== userId) {
                const otherClient = (_a = GameLobbyRoom_1.lobbyRooms[player.realm]) === null || _a === void 0 ? void 0 : _a.clientsMapBySessionId[player.lobbySessionId]; //TODO IMPORTANT players can be in different realms
                console.log("Notifying client", player.lobbySessionId, player.userId);
                otherClient && otherClient.send("UPDATE_COMPETITION_GROUP", this.groupRepresentation); //TODO replace message key with constant number
            }
        });
    }
    update(dt) {
        if (this.state.finished)
            return;
        this.golfPlay.update(dt);
    }
    onJoin(client, { realm, groupId, PlayFabId, userId, user, lobbySessionId }) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("CompetitionGroup onJoin", realm, groupId, PlayFabId, userId, user);
            console.log("groupRepresentation", this.groupRepresentation);
            this.golfPlay = yield golfplay_server_1.creatServerGolfPlay({
                gameDefinition: this.gameDefinition,
                courseDefinition: this.courseDefinition
            });
            const physicParts = this.golfPlay.getPhysicsParts();
            this.clock.start();
            this.update = this.update.bind(this);
            this.groupRepresentation.players[user.userId].lobbySessionId = lobbySessionId; //TODO refactor with Object.assign      
            this.groupRepresentation.players[user.userId].startTime = this.state.startTime;
            this.groupRepresentation.players[user.userId].realm = realm;
            this.interval = setInterval(() => this.clockCheck({ client, userId, PlayFabId }), 300);
            this.setSimulationInterval((deltaTime) => this.update(deltaTime / 1000), 15);
            this.broadcast("start", { startTime: this.state.startTime, duration: this.state.duration, serverTime: Date.now() });
            this.golfPlay.onUpdate(({ ball }) => {
                if (ball)
                    this.state.gameplay.ball.updateFromCANNON(ball);
            });
            this.golfPlay.onEvent(({ type, data }) => __awaiter(this, void 0, void 0, function* () {
                if (type === "ANIMATION_FRAME_KINEMATICS") {
                    client.send("ANIMATION_FRAME_KINEMATICS", data); //TODO data can be optimized, unused properties, just need currentFrame + partId          
                }
                else if (type === "OUT") {
                    console.log("golfplay event", type, data);
                    client.send("OUT");
                }
                else {
                    console.log("golfplay event", type, data);
                }
            }));
            this.golfPlay.onFinish(() => this.completeGame({ userId, PlayFabId, client }));
            this.onMessage("ping", (client) => {
                client.send("pong");
            });
            this.onMessage(1, (client, { impulse }) => __awaiter(this, void 0, void 0, function* () {
                //shoot
                if (!this.state.finished && !this.isOverdue()) {
                    this.state.shoots = this.state.shoots + 1;
                    this.groupRepresentation.players[user.userId].shoots = this.groupRepresentation.players[user.userId].shoots || [];
                    this.groupRepresentation.players[user.userId].shoots.push({
                        impulse: impulse,
                        date: Date.now()
                    });
                    //gameplay 
                    this.golfPlay.shoot({ impulse });
                }
            }));
        });
    }
    completeGame({ PlayFabId, client, userId }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isOverdue())
                return;
            this.state.finished = true;
            this.golfPlay.dispose();
            this.groupRepresentation.players[userId].holeTime = Date.now();
            const xpReward = this.courseDefinition.metadata.xp || 0;
            const gcReward = this.courseDefinition.metadata.GC || 0;
            yield util_1.promisify(playfab_sdk_1.PlayFabServer.ExecuteCloudScript)({
                PlayFabId,
                FunctionName: 'increaseXp',
                FunctionParameter: {
                    PlayFabId,
                    Amount: xpReward
                }
            });
            yield util_1.promisify(playfab_sdk_1.PlayFabServer.AddUserVirtualCurrency)({
                PlayFabId,
                Amount: gcReward,
                VirtualCurrency: "GC"
            });
            client.send("completed", { xp: xpReward, time: Date.now() - this.state.startTime, shoots: this.state.shoots, GC: gcReward });
            this.broadcastUpdateGroupListToOtherPlayers({ userId });
            setTimeout(() => {
                client.leave(constants_1.LEAVE_CODE.COMPLETED);
            }, 1000);
        });
    }
    onLeave(client, consented) {
        console.log("onLeave1", consented);
        this.golfPlay.dispose();
    }
    onDispose() {
        this.clock.clear();
        this.interval && clearInterval(this.interval);
        this.golfPlay && this.golfPlay.dispose();
        this.clock.clear();
        console.log("onDispose1");
    }
    isOverdue(time) {
        return (time || Date.now()) > (this.state.startTime + this.state.duration * 1000);
    }
}
exports.CompetitionGroupRoom = CompetitionGroupRoom;
