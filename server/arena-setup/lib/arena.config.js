"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const arena_1 = __importDefault(require("@colyseus/arena"));
const monitor_1 = require("@colyseus/monitor");
const GameLobbyRoom_1 = require("./server/rooms/GameLobbyRoom");
const Training_Race_1 = require("./server/rooms/Training-Race");
const Training_Zone_1 = require("./server/rooms/Training-Zone");
const Training_Voxters_1 = require("./server/rooms/Training-Voxters");
const Training_Hole_1 = require("./server/rooms/Training-Hole");
const Competition_Group_1 = require("./server/rooms/Competition-Group");
const port = Number(process.env.PORT);
const world_1 = require("./scene/golfplay/physics/world");
const cannon_1 = __importDefault(require("cannon"));
(global || {}).CANNON = cannon_1.default;
world_1.initializeMaterials();
const PlayFabServer_1 = __importDefault(require("playfab-sdk/Scripts/PlayFab/PlayFabServer"));
if (!process.env.PLAYFAB_TITLE_ID) {
    throw new Error("missing .env vars");
}
PlayFabServer_1.default.settings.titleId = process.env.PLAYFAB_TITLE_ID;
PlayFabServer_1.default.settings["DeveloperSecretKey"] = PlayFabServer_1.default.settings.developerSecretKey = process.env.PLAYFAB_SECRET_KEY;
const competition_groups_main_1 = require("./server/competition-groups/competition-groups-main");
const basicAuth = require("express-basic-auth");
exports.default = arena_1.default({
    getId: () => "Project G App",
    initializeGameServer: (gameServer) => {
        // gameServer.define('ShootingGalleryRoom', ShootingGalleryRoom);
        gameServer.define('training-race', Training_Race_1.TrainingRace)
            .filterBy(['realm', 'userId'])
            .enableRealtimeListing();
        gameServer.define('training-zone', Training_Zone_1.TrainingZone)
            .filterBy(['realm', 'userId'])
            .enableRealtimeListing();
        gameServer.define('training-voxters', Training_Voxters_1.TrainingVoxters)
            .filterBy(['realm', 'userId'])
            .enableRealtimeListing();
        gameServer.define('training-hole', Training_Hole_1.TrainingHole)
            .filterBy(['realm', 'userId'])
            .enableRealtimeListing();
        gameServer.define('gameLobbyRoom', GameLobbyRoom_1.GameLobbyRoom)
            .filterBy(['realm'])
            .enableRealtimeListing();
        gameServer.define(`competition-group`, Competition_Group_1.CompetitionGroupRoom)
            .filterBy(['groupId', 'userId'])
            .enableRealtimeListing(); //TODO we filter for now userId, but at some point we could like to show them all together
    },
    initializeExpress: (app) => {
        //app.use(<any>express.json());
        app.get("/", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });
        const basicAuthMiddleware = basicAuth({
            // list of users and passwords
            users: {
                "golfcraft": "juegazo",
            },
            // sends WWW-Authenticate header, which will prompt the user to fill
            // credentials in
            challenge: true
        });
        app.use("/colyseus", basicAuthMiddleware, monitor_1.monitor());
        competition_groups_main_1.createCompetitionGroups({
            app
        });
    },
    beforeListen: () => {
        console.log(`Listening on ws://localhost:${port}`);
    }
});
