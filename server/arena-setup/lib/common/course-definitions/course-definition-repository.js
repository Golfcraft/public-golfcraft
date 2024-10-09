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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourseDefinition = exports.courseDefinitionsRepo = void 0;
const Checkpoints1_1 = __importDefault(require("./Checkpoints1"));
const Checkpoints2_1 = __importDefault(require("./Checkpoints2"));
const Zone1_1 = __importDefault(require("./Zone1"));
const Zone2_1 = __importDefault(require("./Zone2"));
const Zone3_1 = __importDefault(require("./Zone3"));
const Zone4_1 = __importDefault(require("./Zone4"));
const Zone5_1 = __importDefault(require("./Zone5")); //this zone5 is more difficult than zone6 because corner placement
const Zone6_1 = __importDefault(require("./Zone6"));
const Zone7_1 = __importDefault(require("./Zone7")); // may make think complex move but solution is way simpler
const Zone8_1 = __importDefault(require("./Zone8")); //quite difficult
const Zone9_1 = __importDefault(require("./Zone9"));
const Zone11_1 = __importDefault(require("./Zone11"));
const Zone12_1 = __importDefault(require("./Zone12"));
const RaceM1_1 = __importDefault(require("./RaceM1"));
const HoleM1_1 = __importDefault(require("./HoleM1"));
const ZoneCurve_1 = __importDefault(require("./ZoneCurve"));
const Voxters2_1 = __importDefault(require("./Voxters2"));
const Voxters1_1 = __importDefault(require("./Voxters1"));
const courseMockTrainingHole2_1 = __importDefault(require("./courseMockTrainingHole2"));
const Level1_1 = __importDefault(require("./Level1"));
const Square_1 = __importDefault(require("./Square"));
const Level2_1 = __importDefault(require("./Level2")); //TODO restore without moving parts
const CompetitionCH2_1 = __importDefault(require("./CompetitionCH2"));
const Eibriel_1 = __importDefault(require("./Eibriel"));
exports.courseDefinitionsRepo = {
    training: {
        "1": {
            "training-1-1": Object.assign(Object.assign({}, Checkpoints1_1.default), { metadata: { duration: 100, xp: 20, GC: 10, minLevel: 1 } }),
            "training-1-2": Object.assign(Object.assign({}, Checkpoints2_1.default), { metadata: { duration: 460, xp: 100, GC: 50, minLevel: 10 } }),
            "training-1-3": Object.assign(Object.assign({}, Square_1.default), { metadata: { duration: 240, xp: 60, GC: 20, minLevel: 1 } }),
            "training-1-4": Object.assign(Object.assign({}, RaceM1_1.default), { metadata: { duration: 100, xp: 20, GC: 10, minLevel: 1 } })
        },
        "2": {
            "training-2-1": Object.assign(Object.assign({}, Zone1_1.default), { metadata: { duration: 30, xp: 10, GC: 5, minLevel: 1 } }),
            "training-2-2": Object.assign(Object.assign({}, Zone2_1.default), { metadata: { duration: 30, xp: 10, GC: 10, minLevel: 5 } }),
            "training-2-3": Object.assign(Object.assign({}, Zone3_1.default), { metadata: { duration: 30, xp: 10, GC: 8, minLevel: 2 } }),
            "training-2-4": Object.assign(Object.assign({}, Zone4_1.default), { metadata: { duration: 30, xp: 10, GC: 10, minLevel: 5 } }),
            "training-2-5": Object.assign(Object.assign({}, Zone5_1.default), { metadata: { duration: 30, xp: 10, GC: 20, minLevel: 10 } }),
            "training-2-6": Object.assign(Object.assign({}, Zone6_1.default), { metadata: { duration: 30, xp: 20, GC: 10, minLevel: 5 } }),
            "training-2-7": Object.assign(Object.assign({}, Zone7_1.default), { metadata: { duration: 30, xp: 10, GC: 10, minLevel: 5 } }),
            "training-2-8": Object.assign(Object.assign({}, Zone8_1.default), { metadata: { duration: 30, xp: 60, GC: 40, minLevel: 20 } }),
            "training-2-9": Object.assign(Object.assign({}, Zone9_1.default), { metadata: { duration: 30, xp: 10, GC: 30, minLevel: 10 } }),
            "training-2-10": Object.assign(Object.assign({}, ZoneCurve_1.default), { metadata: { duration: 30, xp: 10, GC: 5, minLevel: 10 } }),
            "training-2-11": Object.assign(Object.assign({}, Zone11_1.default), { metadata: { duration: 30, xp: 12, GC: 8, minLevel: 1 } }),
            "training-2-12": Object.assign(Object.assign({}, Zone12_1.default), { metadata: { duration: 40, xp: 30, GC: 20, minLevel: 5 } })
        },
        "3": {
            "training-3-1": Object.assign(Object.assign({}, Voxters1_1.default), { metadata: { duration: 101, xp: 30, GC: 20, minLevel: 1 } }),
            "training-3-2": Object.assign(Object.assign({}, Voxters2_1.default), { metadata: { duration: 400, xp: 120, GC: 60, minLevel: 5 } }),
            "training-3-3": Object.assign(Object.assign({}, Eibriel_1.default), { metadata: { duration: 400, xp: 120, GC: 60, minLevel: 5 } })
        },
        "4": {
            "training-4-1": Object.assign(Object.assign({}, Level1_1.default), { metadata: { duration: 102, xp: 30, GC: 15, minLevel: 5 } }),
            "training-4-2": Object.assign(Object.assign({}, courseMockTrainingHole2_1.default), { metadata: { duration: 102, xp: 30, GC: 15, minLevel: 10 } }),
            "training-4-3": Object.assign(Object.assign({}, HoleM1_1.default), { metadata: { duration: 300, xp: 30, GC: 15, minLevel: 1 } }),
            "training-4-4": Object.assign(Object.assign({}, Level2_1.default), { metadata: { duration: 104, xp: 100, GC: 40, minLevel: 15 } }),
        },
    },
    competition: {
        "1": {
            "competition-1-1": Object.assign(Object.assign({}, Level1_1.default), { metadata: { duration: 103, minLevel: 1, xp: 10, GC: 5 } }),
            "competition-1-2": Object.assign(Object.assign({}, Level2_1.default), { metadata: { duration: 104, minLevel: 5 } }),
            "competition-1-3": Object.assign(Object.assign({}, CompetitionCH2_1.default), { metadata: { duration: 500, minLevel: 10, xp: 100, GC: 20 } }) //long course
        }
    },
};
exports.getCourseDefinition = (gameDefinition) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(exports.courseDefinitionsRepo[gameDefinition.type][gameDefinition.subType || "1"][gameDefinition.courseId]);
        }, 400);
    });
});
