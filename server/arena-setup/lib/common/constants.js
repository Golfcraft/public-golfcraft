"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WS_HOST = exports.SERVER_HTTP_URL = exports.ChestTier1Winner3 = exports.ChestTier1Winner2 = exports.ChestTier1Winner1 = exports.PRICE_COMPETITION_GROUP = exports.MAX_PER_GROUP = exports.STATISTICS = exports.LEAVE_CODE = exports.trainingIdNameMap = exports.TRAINING = void 0;
exports.TRAINING = {
    RACE: "1",
    ZONE: "2",
    VOXTER: "3",
    HOLE: "4"
};
exports.trainingIdNameMap = {
    [exports.TRAINING.RACE]: "race",
    [exports.TRAINING.ZONE]: "zone",
    [exports.TRAINING.VOXTER]: "voxters",
    [exports.TRAINING.HOLE]: "hole"
};
exports.LEAVE_CODE = {
    COMPLETED: 4000,
    TIMEOUT: 4001,
    FAILED: 4002
};
exports.STATISTICS = {
    TRAINING_RACE_1_COMPLETED: 'training_race_1_completed',
    TRAINING_RACE_1_FAILED: 'training_race_1_failed',
    TRAINING_ZONE_1_COMPLETED: 'training_zone_1_completed',
    TRAINING_ZONE_1_FAILED: 'training_zone_1_failed',
    TRAINING_VOXTERS_1_COMPLETED: 'training_voxters_1_completed',
    TRAINING_VOXTERS_1_FAILED: 'training_voxters_1_failed',
    TRAINING_HOLE_1_COMPLETED: 'training_hole_1_completed',
    TRAINING_HOLE_1_FAILED: 'training_hole_1_failed',
};
exports.MAX_PER_GROUP = 3;
exports.PRICE_COMPETITION_GROUP = 20; //TODO move to playfab title data
exports.ChestTier1Winner1 = "ChestTier1Winner1";
exports.ChestTier1Winner2 = "ChestTier1Winner2";
exports.ChestTier1Winner3 = "ChestTier1Winner3";
const USE_REMOTE_SERVER = true;
//phji-7.colyseus.dev
const SERVER_URL = USE_REMOTE_SERVER ? `mana-fever.com/golfcraft-ws` : `localhost:2567`;
//const SERVER_URL = USE_REMOTE_SERVER ? `phji-7.colyseus.dev`:`localhost:2567`;
exports.SERVER_HTTP_URL = `http${USE_REMOTE_SERVER ? 's' : ''}://${SERVER_URL}`;
exports.WS_HOST = `ws${USE_REMOTE_SERVER ? 's' : ''}://${SERVER_URL}`;
