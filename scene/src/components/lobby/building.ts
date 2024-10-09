import { movePlayerTo } from "@decentraland/RestrictedActions"
import courseMockTrainingHole from "../../../../common/course-definitions/courseMockTrainingHole";
import {createButtonList} from "../button-list";
import buildingPositions from "./building-positions"
import {atlasAnalytics} from "../../atlas-analytics-service"

export {
    createBuilding,
    destroyBuilding,
    getBuilding,
    PANELS
}



const PANELS = {
    PUBLICATION_MENU: {
        position: new Vector3(15-24,34.9,28-24),
        rotation: Quaternion.Zero(),
    },
    TOURNAMENT: {
        position: new Vector3(-17.3, 8.61, -2.8),
        rotation: Quaternion.Euler(0, -95, 0),
    },
    LIVE_TOURNAMENT_LOCAL: {
        position: new Vector3(35-24, 1, 27-24),
        rotation: Quaternion.Euler(0, -65, 0),
        title:"Localhost Server"
    },
    LIVE_TOURNAMENT_EU: {
        position: new Vector3(2.64-24, 8.6, 39.73-24),
        rotation: Quaternion.Euler(0, -65, 0),
        title:"United States Server"
    },
    LIVE_TOURNAMENT_US: {
        position: new Vector3(9-24, 8.6, 44-24),
        rotation: Quaternion.Euler(0, -45, 0),
        title:"United States Server"
    },
    TOURNAMEND_LEADERBOARD: {
        position:new Vector3(8.5-24, 8.5, 17-24),
        rotation:Quaternion.Euler(0, -49-90, 0),
    },
    BRIDGE_DM: {
        position: new Vector3(35.3-24,24.5,18-24),
        rotation: Quaternion.Euler(0, 170, 0),
    },
    BRIDGE_DM100: {
        position: new Vector3(30.5-24,24.5,18.5-24),
        rotation: Quaternion.Euler(0, 200, 0),
    },
    BRIDGE_FT: {
        //  position: new Vector3(36,1,20),
        //   position: new Vector3(26,34,15),//4th floor
        position: new Vector3(39.7,24.5,20),
        rotation: Quaternion.Euler(0, 140, 0),
    },
    BRIDGE_FT500: {
        //  position: new Vector3(36,1,20),
        //   position: new Vector3(26,34,15),//4th floor
        position: new Vector3(41,24.5,24),
        rotation: Quaternion.Euler(0, 80, 0),
    },
    CONFESSIONS: {
        position: new Vector3(19-24,25.6,35-24),
        rotation:Quaternion.Euler(0,-90,0)
    },
    GOLFCLUBS: {
        position:new Vector3(3-24,1.2,38-23),
        rotation:Quaternion.Euler(0, -70, 0),
    },
    SEASON: {
        position:new Vector3(-7, 1.2, 21.5),
        rotation:Quaternion.Euler(0, 0, 0),
    },
    SEASON_LEADERBOARD: {
        position: new Vector3(-16, 1.2, 20),
        rotation:Quaternion.Euler(0,-30,0),
    },
    DAYS_CONNECTED: {
        position: new Vector3(29-17, 24.5, 45.8-24),
        rotation:Quaternion.Euler(0,0,0),
    },
    MEDIA_LINKS: {
        //position:new Vector3(-4.8,1.5,0),
        //rotation:Quaternion.Euler(0, 90, 0),
        position:new Vector3(8.75, 1.2, -21),
        rotation:Quaternion.Euler(0, 180, 0),
    },
    EVENT_IMAGE: {
        //position:new Vector3(5,3.5,0),
        //rotation:Quaternion.Zero(),
        position:new Vector3(-4.8,1.3,0),
        rotation:Quaternion.Euler(0, 90, 0),
    }
}

let building_entity:Entity

function getBuilding(){return building_entity}
let collider_main:Entity

let buildingInstantiated = false;

const egypt_3dthumbnails = {
    "EmptyCollectionAnubis": "space-canopus",
    "EmptyCollectionBastet": "space-aldebaran",
    "EmptyCollectionHorus": "space-antares",
    "EmptyCollectionOsiris": "space-perseo",
    "EmptyCollectionSekhmet": "space-orion"
}


function destroyBuilding() {
    building_entity.setParent(null);
    engine.removeEntity(building_entity);

    // Hide building collider underground
    if (collider_main!=undefined) {
        collider_main.getComponentOrNull(Transform).position.y = 0.02-60;
    }
}

function createCollider(parent) {
    if (collider_main==undefined) {
        collider_main = new Entity("ColliderMain")
        collider_main.setParent(parent);
        collider_main.addComponent(new Transform({
             position: new Vector3(16*1.5, 0.02, 16*1.5),
         }))
         collider_main.addComponent(new GLTFShape("models/building/entire_building_collider.gltf"))
    } else {
        collider_main.getComponentOrNull(Transform).position.y = 0.02;
    }
}

function createBuilding (parent) {
    createCollider(parent);
    if (buildingInstantiated) {
        building_entity.setParent(parent);
        //engine.addEntity(building_entity);
        return;
    }

  
    building_entity = new Entity();
    building_entity.addComponent(new GLTFShape("models/building/entire_building.gltf")); 
    building_entity.setParent(parent);
    building_entity.addComponent(new Transform({
         position: new Vector3(16*1.5, 0.02, 16*1.5),
     }));

    /*Object.keys(egypt_3dthumbnails).forEach(element => {
        log("wearable: ", element);
        const item = egypt_3dthumbnails[element];
        log("item: ", item);
        log("pos: ", buildingPositions[element]);
        const e = new Entity();
        e.addComponent(new GLTFShape(`models/fashion/${item}.glb`));
        e.addComponent(transformFromDict(buildingPositions[element]));
        e.setParent(building_entity); 
    });*/


    const sound_fountain_floor4 = new Entity();
    sound_fountain_floor4.setParent(building_entity);
    sound_fountain_floor4.addComponent(transformFromDict(buildingPositions["EmptyFountainSoundFloor4"]));
    const clip_fountain = new AudioClip("sound/japanese_fountain.mp3");
    const source_fountain = new AudioSource(clip_fountain);
    sound_fountain_floor4.addComponent(source_fountain);
    //source_fountain.playing = true;
    source_fountain.loop = true;
    source_fountain.volume = 0.15;

    const sound_fountain_lobby = new Entity();
    sound_fountain_lobby.addComponent(transformFromDict(buildingPositions["EmptyFountainSoundLobby"]));
    sound_fountain_lobby.addComponent(source_fountain);
    sound_fountain_lobby.setParent(building_entity);

    /*   const lobbyMusic = new Entity();
       lobbyMusic.setParent(building_entity);
       lobbyMusic.addComponent(transformFromDict(buildingPositions["EmptyFountainSoundFloor4"]));

       const lobbyMusicClip = new AudioClip("sound/halloween_music.mp3");
       const lobbyMusicSource = new AudioSource(lobbyMusicClip);
       lobbyMusic.addComponent(lobbyMusicSource);
       lobbyMusicSource.playing = lobbyMusicSource.loop = true;
       lobbyMusicSource.volume = 0.5;*/

     var bp:any = buildingPositions;
     Object.keys(bp).forEach(function(e: string) {
        if (!bp[e].gltf) return;
        if (~["entire_building.gltf", "entire_building_collider.gltf", "land_egypt.gltf", "land_urban.gltf", "land_jungle.gltf", "land_mountain.gltf"].indexOf(bp[e].gltf)) return;
        if ((new Date()).getMonth() != 5 && e.startsWith("event_pride")) return; // Pride month: June
        if (/*Date.now() >= new Date("2022-11-05T23:59:59.000Z").getTime() && */e.startsWith("event_halloween_")) return;
        //if (/*Date.now() <= new Date("2022-12-16T23:59:59.000Z").getTime() && */e.startsWith("event_xmas_")) return;
        if (/*Date.now() > new Date("2023-09-22T23:59:59.000Z").getTime() &&*/ ~e.indexOf("valencia")) return;
        var building_element_entity = new Entity();
        building_element_entity.addComponent(new GLTFShape("models/building/"+bp[e].gltf)); 
        building_element_entity.setParent(building_entity);
        building_element_entity.addComponent(transformFromDict(bp[e]));
     })

    const buttonShape = new GLTFShape("models/building/button_elevator.gltf");
    const buttonDefinitions = [
        {
            label: "Crafting",
            action: () => {
                movePlayerTo(new Vector3(17, 37, 20), new Vector3(15, 37, 16))
                atlasAnalytics.submitGenericEvent(`gbc-floor-4`)
            }
        },
        {
            label: "Misc",
            action: () => {
                movePlayerTo(new Vector3(31, 30, 30), new Vector3(31, 30, 22))
                atlasAnalytics.submitGenericEvent(`gbc-floor-3`)
            }
        },
        {
            label: "Fashion",
            action: () => {
                movePlayerTo(new Vector3(30, 18, 18), new Vector3(34, 18, 15))
                atlasAnalytics.submitGenericEvent(`gbc-floor-2`)
            }
        },
        {
            label: "Tournaments",
            action: () => {
                movePlayerTo(new Vector3(31, 11, 34), new Vector3(12, 11, 28))
                atlasAnalytics.submitGenericEvent(`gbc-floor-1`)
            }
        },
        {
            label: "Lobby / season",
            action: () => {
                movePlayerTo(new Vector3(18, 4, 34), new Vector3(14, 4, 43))
                atlasAnalytics.submitGenericEvent(`gbc-floor-0`)
            }
        }
    ];
    createButtonList(building_entity, {
        activeIndex:4,
        buttonShape,
        buttonDefinitions,
        position:transformFromDict(buildingPositions["EmptyButtonsLobby"]).position, //new Vector3(20,5,24),
        rotation:transformFromDict(buildingPositions["EmptyButtonsLobby"]).rotation //Quaternion.Euler(0,90,0)
    });
    createButtonList(building_entity, {
        activeIndex:3,
        buttonShape,
        buttonDefinitions,
        position:transformFromDict(buildingPositions["EmptyButtonsFloor1"]).position, //new Vector3(25,12,21),
        rotation:transformFromDict(buildingPositions["EmptyButtonsFloor1"]).rotation //Quaternion.Euler(0,-15,0)
    });
    createButtonList(building_entity, {
        activeIndex:2,
        buttonShape,
        buttonDefinitions,
        position:transformFromDict(buildingPositions["EmptyButtonsFloor2"]).position, //new Vector3(23,19,28),
        rotation:transformFromDict(buildingPositions["EmptyButtonsFloor2"]).rotation //Quaternion.Euler(0,-15+180,0)
    });
    createButtonList(building_entity, {
        activeIndex:1,
        buttonShape,
        buttonDefinitions,
        position:transformFromDict(buildingPositions["EmptyButtonsFloor3"]).position, //new Vector3(20,28,23.5),
        rotation:transformFromDict(buildingPositions["EmptyButtonsFloor3"]).rotation //Quaternion.Euler(0,90,0)
    });
    createButtonList(building_entity, {
        activeIndex:0,
        buttonShape,
        buttonDefinitions,
        position:transformFromDict(buildingPositions["EmptyButtonsFloor4"]).position, //new Vector3(27,38,26.5),
        rotation:transformFromDict(buildingPositions["EmptyButtonsFloor4"]).rotation //Quaternion.Euler(0,-120,0) 
    });


    buildingInstantiated = true;
}


function transformFromDict(dict:any) {
    return new Transform({
        position: new Vector3(dict["position"][0], dict["position"][1], dict["position"][2]),
        rotation: new Quaternion(dict["rotation"][0], dict["rotation"][1], dict["rotation"][2], dict["rotation"][3]),
        scale: new Vector3(dict["scale"][0], dict["scale"][1], dict["scale"][2]),
    })
}