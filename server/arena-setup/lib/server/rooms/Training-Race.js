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
exports.TrainingRace = void 0;
const colyseus_1 = require("colyseus");
const schema_1 = require("@colyseus/schema");
const playfab_sdk_1 = require("playfab-sdk");
const constants_1 = require("../../common/constants");
const util_1 = require("util");
const GamePlayState_1 = require("./GamePlayState");
const golfplay_server_1 = require("./golfplay-server");
const course_definition_repository_1 = require("../../common/course-definitions/course-definition-repository");
const course_animations_migration_1 = require("../../common/course-animations-migration");
const playfabServerApiKey = process.env.PLAYFAB_API_KEY;
class TrainingRaceState extends schema_1.Schema {
    constructor(courseDefinition) {
        super();
        this.currentCheckpoint = 0;
        this.checkpointsLength = 3;
        this.shoots = 0;
        this.lastShootTime = 0;
        this.startTime = Date.now() + 5000;
        this.duration = courseDefinition.metadata.duration;
        this.gameplay = new GamePlayState_1.Gameplay({ spawnPosition: new GamePlayState_1.Vector3(0, 0, 0) });
    }
}
__decorate([
    schema_1.type(GamePlayState_1.Gameplay)
], TrainingRaceState.prototype, "gameplay", void 0);
__decorate([
    schema_1.type("uint8")
], TrainingRaceState.prototype, "currentCheckpoint", void 0);
__decorate([
    schema_1.type("uint8")
], TrainingRaceState.prototype, "checkpointsLength", void 0);
__decorate([
    schema_1.type("uint64")
], TrainingRaceState.prototype, "startTime", void 0);
__decorate([
    schema_1.type("uint8")
], TrainingRaceState.prototype, "duration", void 0);
__decorate([
    schema_1.type("uint8")
], TrainingRaceState.prototype, "shoots", void 0);
__decorate([
    schema_1.type("uint64")
], TrainingRaceState.prototype, "lastShootTime", void 0);
class TrainingRace extends colyseus_1.Room {
    onAuth(client, { PlayFabId }, request) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO verify currentTrainingID
            //TODO avoid impersonation
            return true;
        });
    }
    clockCheck({ client, userId, PlayFabId }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.state.finished && this.isOverdue()) {
                this.state.finished = true;
                yield this.completeTrainingOnPlayfab({ success: false, PlayFabId, currentTrainingID: this.gameDefinition.subType });
                client.leave(constants_1.LEAVE_CODE.TIMEOUT);
            }
        });
    }
    onCreate({ realm, user, userId, PlayFabId, gameDefinition }) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("CREATED TRAINING-RACE", gameDefinition);
            if (gameDefinition) {
                this.gameDefinition = gameDefinition;
            }
            this.courseDefinition = course_animations_migration_1.migrateCourseDefinitionAnimations(yield course_definition_repository_1.getCourseDefinition(gameDefinition));
            this.setState(new TrainingRaceState(this.courseDefinition));
        });
    }
    isOverdue() {
        return Date.now() > (this.state.startTime + this.state.duration * 1000);
    }
    onJoin(client, { realm, user, userId, PlayFabId }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield util_1.promisify(playfab_sdk_1.PlayFabServer.GetUserReadOnlyData)({ PlayFabId });
            const currentTrainingID = data.Data.currentTrainingID.Value;
            const currentTrainingCourseID = data.Data.currentTrainingCourseID.Value;
            const checkpointsLength = this.courseDefinition.parts.filter(p => p.type === "checkpoint").length;
            const zone = this.courseDefinition.parts.find(p => p.type === "zone");
            console.log("currentTrainingID", currentTrainingID);
            this.gameDefinition = this.gameDefinition || {
                type: "training",
                subType: currentTrainingID,
                courseId: currentTrainingCourseID
            };
            this.golfPlay = yield golfplay_server_1.creatServerGolfPlay({
                gameDefinition: this.gameDefinition,
                courseDefinition: this.courseDefinition
            });
            const physicParts = this.golfPlay.getPhysicsParts();
            this.clock.start();
            this.broadcast("start", { startTime: this.state.startTime, duration: this.state.duration, serverTime: Date.now() });
            this.update = this.update.bind(this);
            //this.setSimulationInterval((deltaTime) => this.update(deltaTime/1000), 30);
            this.interval = setInterval(() => this.clockCheck({ client, userId, PlayFabId }), 100);
            this.golfPlay.onUpdate(({ ball }) => {
                if (ball)
                    this.state.gameplay.ball.updateFromCANNON(ball);
            });
            this.golfPlay.onFinish(() => __awaiter(this, void 0, void 0, function* () {
                this.state.finished = true;
                this.golfPlay.dispose();
                yield this.completeAndSendResult({ client, PlayFabId });
            }));
            this.golfPlay.onEvent(({ type, data }) => __awaiter(this, void 0, void 0, function* () {
                //console.log("golfopklay event", type, data);
                if (type === "CHECKPOINT") {
                    const { checkpoint, index } = data;
                    if (index === (checkpointsLength - 1)) {
                        this.state.finished = true;
                        yield this.completeAndSendResult({ client, PlayFabId });
                    }
                    else {
                        client.send("CHECKPOINT", { checkpoint, index });
                    }
                }
                else if (type === "ZONE") { //zone is triggered when sleep, and contains info with distance from ball to center of zone
                    const { distance } = data;
                    const success = distance <= zone.scale[0];
                    this.state.finished = true;
                    if (success) {
                        yield this.completeAndSendResult({ client, PlayFabId });
                    }
                    else {
                        yield this.completeTrainingOnPlayfab({
                            PlayFabId,
                            success, currentTrainingID: this.gameDefinition.subType
                        });
                        client.leave(constants_1.LEAVE_CODE.FAILED);
                    }
                }
                else if (type === "VOXTER") {
                    const { voxter, index, isLast } = data;
                    if (isLast) {
                        this.state.finished = true;
                        client.send("VOXTER", { voxter, index, isLast });
                        yield this.completeAndSendResult({ client, PlayFabId });
                    }
                    else {
                        client.send("VOXTER", { voxter, index, isLast });
                    }
                }
                else if (type === "HOLE") {
                    this.state.finished = true;
                    client.send("HOLE", {});
                    if (this.gameDefinition.subType === "4") {
                        yield this.completeAndSendResult({ client, PlayFabId });
                    }
                }
                else if (type === "SLEEP") {
                    if (this.gameDefinition.subType === "4") {
                        if (this.state.shoots === 3) {
                            this.state.finished = true;
                            yield this.completeTrainingOnPlayfab({ success: false, PlayFabId, currentTrainingID: this.gameDefinition.subType });
                            client.leave(constants_1.LEAVE_CODE.FAILED);
                        }
                    }
                }
                else if (type === "OUT") {
                    if (this.gameDefinition.subType === constants_1.TRAINING.HOLE && this.state.shoots === 3) {
                        this.state.finished = true;
                        yield this.completeTrainingOnPlayfab({ success: false, PlayFabId, currentTrainingID: this.gameDefinition.subType });
                        client.leave(constants_1.LEAVE_CODE.FAILED);
                    }
                    else if (this.gameDefinition.subType === constants_1.TRAINING.ZONE) {
                        this.state.finished = true;
                        yield this.completeTrainingOnPlayfab({ success: false, PlayFabId, currentTrainingID: this.gameDefinition.subType });
                        client.leave(constants_1.LEAVE_CODE.FAILED);
                    }
                    else {
                        client.send("OUT", data);
                    }
                }
                else if (type === "ANIMATION_FRAME_KINEMATICS") {
                    client.send("ANIMATION_FRAME_KINEMATICS", data); //TODO data can be optimized, unused properties, just need currentFrame + partId
                }
            }));
            this.lastPingTime = 0;
            this.onMessage("ping", (client) => {
                client.send("pong");
                this.lastPingTime = Date.now();
            });
            this.onMessage("ping2", () => {
                this.lastPing = Date.now() - this.lastPingTime; //TODO apply?
            });
            this.onMessage("SLEEP", (client, { position }) => {
                console.log("received SLEEP", { position });
            });
            this.onMessage(1, (client, { impulse, timeStep }) => {
                if (!this.state.finished && !this.isOverdue()) {
                    this.state.lastShootTime = Date.now();
                    //TODO record gameplay                
                    this.state.shoots = this.state.shoots + 1;
                    this.golfPlay.shoot({ impulse });
                    client.send("SHOOT_FRAMES", { frames: this.golfPlay.getFrames(timeStep), timeStep, impulse });
                }
            });
        });
    }
    completeAndSendResult({ client, PlayFabId, success }) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("completeAndSendResult");
            const time = Date.now() - this.state.startTime;
            const { data } = yield this.completeTrainingOnPlayfab({ success: true, PlayFabId, currentTrainingID: this.gameDefinition.subType });
            const { FunctionResult } = data;
            console.log("data", data);
            client.send("completed", {
                xp: FunctionResult.xp,
                GC: FunctionResult.GC,
                shoots: this.state.shoots,
                time
            });
            setTimeout(() => {
                client.leave(constants_1.LEAVE_CODE.COMPLETED);
            }, 1000);
        });
    }
    onLeave(client, consented) {
        console.log("onLeave2", client, consented);
        console.log("consented", consented);
    }
    onDispose() {
        this.interval && clearInterval(this.interval);
        this.golfPlay && this.golfPlay.dispose();
        console.log("onDispose1");
    }
    completeTrainingOnPlayfab({ success, PlayFabId, currentTrainingID }) {
        return util_1.promisify(playfab_sdk_1.PlayFabServer.ExecuteCloudScript)({
            PlayFabId,
            FunctionName: 'completeTraining',
            FunctionParameter: {
                xp: this.courseDefinition.metadata.xp || 10,
                GC: this.courseDefinition.metadata.GC || 5,
                apiKey: playfabServerApiKey,
                PlayFabId,
                trainingID: currentTrainingID,
                success,
                playedTime: Date.now() - this.state.startTime
            }
        });
    }
    update(dt) {
        if (this.state.finished)
            return;
        this.golfPlay.update(dt);
    }
}
exports.TrainingRace = TrainingRace;
