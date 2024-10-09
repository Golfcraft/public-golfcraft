import {createLobbyUi} from "../../src/components/ui/lobby-ui/lobby-ui";

const lobbyUi = createLobbyUi({
    GC:144711,
    FT:309,
    DM:273,
    SR:120,
    PT:6719,
    WD:78565,
    IR:446,
    GD:189,
    DMChain:173,
    Planks:1,
    StoneBlocks:20,
    IronBars:2,
    GolfBars:0,
    TrainingBonus:"74",
    FarmingBonus:"0",
    GolfClubPower:5,
    GolfClubId:1,
    GolfClubName:"Vampire bait",
    xp:65000,
    dailyMissionsData: {
        "state": {
            "missionLevels": [1, 2, 3, 4, 5],
            "missionCollection": [{
                "ID": 1,
                "alias": "training-success",
                "events": "training-success",
                "rewards": "WD:10 FT:5",
                "difficulty": 1,
                "description": "Complete a training"
            }, {
                "ID": 2,
                "alias": "training-success-all-modes",
                "events": "training-success",
                "rewards": "ST:10 IR:5 FT:10",
                "difficulty": 3,
                "description": "Complete each of all 4 training modes"
            }, {
                "ID": 3,
                "alias": "training-success-race",
                "events": "training-success",
                "rewards": "ST:5 FT:5",
                "difficulty": 2,
                "description": "Complete a \"race\" training"
            }, {
                "ID": 4,
                "alias": "training-success-voxters",
                "events": "training-success",
                "rewards": "IR:2 FT:5",
                "difficulty": 2,
                "description": "Complete a \"voxters\" training"
            }, {
                "ID": 5,
                "alias": "training-success-zone",
                "events": "training-success",
                "rewards": "ST:5 FT:5",
                "difficulty": 2,
                "description": "Complete a \"zone\" training"
            }, {
                "ID": 6,
                "alias": "training-success-hole",
                "events": "training-success",
                "rewards": "ST:5 FT:10",
                "difficulty": 2,
                "description": "Complete a \"hole in 3\" training"
            }, {
                "ID": 7,
                "alias": "competition-played",
                "events": "competition-played",
                "rewards": "WD:10 FT:5",
                "difficulty": 1,
                "description": "Play a competition"
            }, {
                "ID": 8,
                "alias": "competition-played5",
                "events": "competition-played",
                "rewards": "FT:10 ST:5 DM:1",
                "difficulty": 3,
                "description": "Play 5 competitions"
            }, {
                "ID": 9,
                "alias": "competition-played20",
                "events": "competition-played",
                "rewards": "FT:20 GD:5 DM:2",
                "difficulty": 4,
                "description": "Play 20 competition games"
            }, {
                "ID": 10,
                "alias": "tournament-played",
                "events": "tournament-played",
                "rewards": "WD:10 FT:10",
                "difficulty": 1,
                "description": "Play a tournament game"
            }, {
                "ID": 11,
                "alias": "tournament-finished",
                "events": "tournament-played",
                "rewards": "FT:10 GD:2 DM:1",
                "difficulty": 4,
                "description": "Play 12 maps of a tournament"
            }, {
                "ID": 12,
                "alias": "tournament-finished4",
                "events": "tournament-played",
                "rewards": "IR:20 FT:30 GD:10 DM:5",
                "difficulty": 5,
                "description": "Play the 12 maps of 4 tournaments"
            }, {
                "ID": 13,
                "alias": "material-refine-any",
                "events": "material-refined",
                "rewards": "FT:15",
                "difficulty": 3,
                "description": "Refine any material"
            }, {
                "ID": 14,
                "alias": "part-craft-any",
                "events": "part-crafted",
                "rewards": "FT:30",
                "difficulty": 4,
                "description": "Craft any golf course part"
            }],
            "missions": [{
                "ID": 10,
                "alias": "tournament-played",
                "events": ["tournament-played"],
                "rewards": {"WD": 10, "FT": 10},
                "difficulty": 1,
                "description": "Play a tournament game"
            }, {
                "ID": 6,
                "alias": "training-success-hole",
                "events": ["training-success"],
                "rewards": {"ST": 5, "FT": 10},
                "difficulty": 2,
                "description": "Complete a \"hole in 3\" training"
            }, {
                "ID": 2,
                "alias": "training-success-all-modes",
                "events": ["training-success"],
                "rewards": {"ST": 10, "IR": 5, "FT": 10},
                "difficulty": 3,
                "description": "Complete each of all 4 training modes"
            }, {
                "ID": 11,
                "alias": "tournament-finished",
                "events": ["tournament-played"],
                "rewards": {"FT": 10, "GD": 2, "DM": 1},
                "difficulty": 4,
                "description": "Play 12 maps of a tournament"
            }, {
                "ID": 12,
                "alias": "tournament-finished4",
                "events": ["tournament-played"],
                "rewards": {"IR": 20, "FT": 30, "GD": 10, "DM": 5},
                "difficulty": 5,
                "description": "Play the 12 maps of 4 tournaments"
            }],
            "date": "2022-10-18T19:23:31.253Z"
        }, "dailyMissionIndex": 1, "dailyMissionDate": "2022-10-18T19:23:59.843Z", "dailyMissionStep": 0
    }
});