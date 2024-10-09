import {createOrGetLiveTournamentResultsUI} from "../../src/components/live-tournament-results";
import {fadeInOverlay, fadeOutOverlay} from "../../src/components/ui/overlay";


const mockState = {
  "courseResults": [
    {
      "completed": false,
      "playersShots": [
        1,
        2
      ],
      "playersMadeHole": [
        true,
        false
      ],
      "playersTime": [
        82960,
        0
      ]
    },
    {
      "completed": false,
      "playersShots": [
        0,
        0
      ],
      "playersMadeHole": [
        false,
        false
      ],
      "playersTime": [
        0,
        0
      ]
    },
    {
      "completed": false,
      "playersShots": [
        0,
        0
      ],
      "playersMadeHole": [
        false,
        false
      ],
      "playersTime": [
        0,
        0
      ]
    },
    {
      "completed": false,
      "playersShots": [
        0,
        0
      ],
      "playersMadeHole": [
        false,
        false
      ],
      "playersTime": [
        0,
        0
      ]
    }
  ],
  "players": [
    {
      "address": "0x598f8af1565003ae7456dac280a18ee826df7a2c",
      "realm": "LocalPreview",
      "displayName": "pablo",
      "ready": false,
      "positionBeforeShoot": {
        "x": 18,
        "y": 0.35010001063346863,
        "z": 0
      },
      "ball": {
        "velocity": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "position": {
          "x": -18.739789962768555,
          "y": -2.00618839263916,
          "z": 0.006635697558522224
        },
        "angularVelocity": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "quaternion": {
          "x": 0,
          "y": 0.7071067690849304,
          "z": 0,
          "w": -0.7071067690849304
        }
      },
      "idle": false,
      "playerIndex": 0
    },
    {
      "address": "0xf50f5525c6f0c399c57db570fe3973c1a95ce385",
      "realm": "LocalPreview",
      "displayName": "Juan#e385",
      "ready": false,
      "positionBeforeShoot": {
        "x": 18,
        "y": 0.35010001063346863,
        "z": 0
      },
      "ball": {
        "velocity": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "position": {
          "x": -17.82069969177246,
          "y": 0.07470501214265823,
          "z": -0.037580281496047974
        },
        "angularVelocity": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "quaternion": {
          "x": 0,
          "y": 0.7071067690849304,
          "z": 0,
          "w": -0.7071067690849304
        }
      },
      "idle": false,
      "playerIndex": 1
    }
  ],
  "organizerDisplayName": "pablo",
  "roomIndex": 0,
  "currentMapIndex": 0,
  "courseIds": [
    "urban 15",
    "666",
    "Nico Test 100",
    "The Great Pyramid"
  ]
}

executeTask(async ()=>{
  createOrGetLiveTournamentResultsUI(mockState);
  fadeInOverlay(0.1);
});
