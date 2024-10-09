import { getUserData } from '@decentraland/Identity';
import { getCurrentRealm } from '@decentraland/EnvironmentAPI';

import Meta from './sammich';

export const initializeSammich = ({position, rotation}={position:null, rotation:null}) => {
    console.log("initializeSammich");

    const landOwnerData = {
        host_data: `{
"sammichgame": {
    "position": ${JSON.stringify(
        {
                "x": 4,
                "y": 2.5,
                "z": 22,
                ...position
            })
        },
    "rotation": ${JSON.stringify(
            {
                "x": 0,
                "y": -93,
                "z": 0,
                ...rotation
            }
        )},
    "scale": {
      "x": 0.8,
      "y": 0.8,
      "z": 0.8
    },
    "hideFrame": false,
    "hideBoard": false,
    "hideAd": true,
    "gameID": "golfcraft",
    "showScenario": false,
    "showJoinVoice": false,
    "soundDistance": 100,
    "serverWs": "wss://mana-fever.com",
    "serverHttp": "https://mana-fever.com"
    }
 }`
    };

    let meta = new Meta({getUserData, getCurrentRealm}, landOwnerData)
    engine.addSystem(meta);
}
