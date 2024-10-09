import { createFashionStore } from "./fashionshop";
import buildingPositions from "../components/lobby/building-positions"
//import catalog =  require("../../../wearable-store-service-ft/catalog.json");
const stores:any[] = [];

let mechaRollupEntity:Entity;
let potiRollupEntity:Entity;
let tvheadRollupEntity:Entity;
let lowpolyRollupEntity:Entity;
let dokiRollupEntity:Entity;

//const CATALOG_ENDPOINT = "https://service.golfcraftgame.com/golfcraft/wearables-catalog";
const CATALOG_ENDPOINT = "https://golfcraftgame.com/api/wearables-catalog";
//const CATALOG_ENDPOINT = 'http://localhost:2568/wearables-catalog';

const egypt_3dthumbnails = {
    "space-canopus": "EmptyCollectionAnubis",
    "space-aldebaran": "EmptyCollectionBastet",
    "space-antares": "EmptyCollectionHorus",
    "space-perseo": "EmptyCollectionOsiris",
    "space-orion": "EmptyCollectionSekhmet"
}

const egypt_offsets = {
    "boots": [1.4, 1.0, -0.5], // [derecha, arriba, adelante]
    "lowerbody": [1.4, 2.15, -0.5],
    "upperbody": [1.4, 3.3, -0.5],
    "helmet": [1.4, 4.4, -0.5]
}

export const createFashionLobby = ({onSale}) => { 

    executeTask(async () => {
        try {
            let response = await fetch(CATALOG_ENDPOINT);
            let catalog = await response.json();
            log(catalog);
            Object.values(catalog).forEach(({name, items, contract})=>{
                if (name!="Space") return;
                items.forEach(item=>{
                    // Get position from building
                    const id = item.id.split("-", 2).join("-");
                    log("id:", id)
                    const empty_name = egypt_3dthumbnails[id];
                    const item_position = buildingPositions[empty_name].position;
                    // Offset
                    const offset = egypt_offsets[item.id.split("-")[2]];

                    var item_rotation = buildingPositions[empty_name].rotation;
                    log("new_position:", item_position);
                    log("new_rotation:", item_rotation);
                    //log("item:", item)
                    stores.push(
                        createFashionStore({
                            name:item.name,
                            ftprice:item.price.FT,
                            stock:item.maxStock-(item.sold||0),
                            wearableId:item.wearableId,
                            contract,
                            position: new Vector3(...item_position),
                            rotation: new Quaternion(...item_rotation),
                            offset: new Vector3(...offset),
                            modelSrc: `models/fashion/${item.id}.glb`,
                            label: item.image_url||"",
                            minPlayerLevel: item.minPlayerLevel||-1,
                            maxMintsByAddress: item.maxMintsByAddress||-1,
                            onSale
                        })
                    );
                })
            })
        } catch {
            log("failed to reach URL");
        }
    })

    /*
    lowpolyRollupEntity = new Entity();
    lowpolyRollupEntity.addComponent(new Transform({
        position: new Vector3(15.64,15.96-0.97,10.40),
        rotation: Quaternion.Euler(0, 63, 0),
        scale: new Vector3(1,1,1)
    }));
    lowpolyRollupEntity.addComponent(new GLTFShape('models/fashion/lowpoly_banner.glb'));
    lowpolyRollupEntity.addComponent(new OnPointerDown(() => {
        teleportTo("-11,-106");
    },
    {
        hoverText: `Go to Lowpoly Store`,
        button: ActionButton.POINTER
    }));
    engine.addEntity(lowpolyRollupEntity);

    mechaRollupEntity = new Entity();
    mechaRollupEntity.addComponent(new Transform({
        position: new Vector3(22.25,15.95-0.97,7.45),
        rotation: Quaternion.Euler(0, -30, 0),
        scale: new Vector3(1,1,1)
    }));
    mechaRollupEntity.addComponent(new GLTFShape('models/fashion/matsumecha-banner.glb'));
    mechaRollupEntity.addComponent(new OnPointerDown(() => {
        openExternalURL("https://twitter.com/DuckiezKing");
    },
    {
        hoverText: `Follow me on Twitter`,
        button: ActionButton.POINTER
    }));
    engine.addEntity(mechaRollupEntity);

    potiRollupEntity = new Entity();
    potiRollupEntity.addComponent(new Transform({
        position: new Vector3(27.37,15.92-0.97,7.37),
        rotation: Quaternion.Euler(0, -30, 0),
        scale: new Vector3(1,1,1)
    }));
    potiRollupEntity.addComponent(new GLTFShape('models/fashion/poti-banner.glb'));
    potiRollupEntity.addComponent(new OnPointerDown(() => {
        openExternalURL("https://l.tobik.cc/GolfCraft");
    },
    {
        hoverText: `Discover Tobik`,
        button: ActionButton.POINTER
    }));
    engine.addEntity(potiRollupEntity);

    tvheadRollupEntity = new Entity();
    tvheadRollupEntity.addComponent(new Transform({
        position: new Vector3(31.81,15.92-0.97,8.08),
        rotation: Quaternion.Euler(0, -30, 0),
        scale: new Vector3(1,1,1)
    }));
    tvheadRollupEntity.addComponent(new GLTFShape('models/fashion/tv-head-banner.glb'));
    tvheadRollupEntity.addComponent(new OnPointerDown(() => {
        //openExternalURL("https://twitter.com/studio_sparkles");
        teleportTo("35,-65");
    },
    {
        hoverText: `Studio Sparkles`,
        button: ActionButton.POINTER
    }));
    engine.addEntity(tvheadRollupEntity);


    dokiRollupEntity = new Entity();
    dokiRollupEntity.addComponent(new Transform({
        position: new Vector3(41.28,16.06-0.97,29.11),
        rotation: Quaternion.Euler(0, 30+180, 0),
        scale: new Vector3(1,1,1)
    }));
    dokiRollupEntity.addComponent(new GLTFShape('models/fashion/doki-banner.glb'));
    dokiRollupEntity.addComponent(new OnPointerDown(() => {
        openExternalURL("https://twitter.com/DokiDCL");
    },
    {
        hoverText: `Doki`,
        button: ActionButton.POINTER
    }));
    engine.addEntity(dokiRollupEntity);
    */
};

export function setUserData(userData){
    stores.forEach(item=>item.setUserData(userData));
}

export function hideFashionLobby(){
    try{
        stores.forEach(item=>item.hideFashionStore());
        /*engine.removeEntity(mechaRollupEntity);
        engine.removeEntity(potiRollupEntity);
        engine.removeEntity(tvheadRollupEntity);
        engine.removeEntity(lowpolyRollupEntity);
        engine.removeEntity(dokiRollupEntity);*/
    }catch(error){
        console.log("hideFashionLobby error", error)
    }
}

export function showFashionLobby(){
    try{
        stores.forEach(item=>item.showFashionStore());
        /*engine.addEntity(mechaRollupEntity);
        engine.addEntity(potiRollupEntity);
        engine.addEntity(tvheadRollupEntity);
        engine.addEntity(lowpolyRollupEntity);
        engine.addEntity(dokiRollupEntity);*/
    }catch(error){
        console.log("hideFashionLobby error", error)
    }
}

// This should go on utils
function transformFromDict(dict:any) {
    return new Transform({
        position: new Vector3(dict["position"][0], dict["position"][1], dict["position"][2]),
        rotation: new Quaternion(dict["rotation"][0], dict["rotation"][1], dict["rotation"][2], dict["rotation"][3]),
        scale: new Vector3(dict["scale"][0], dict["scale"][1], dict["scale"][2]),
    })
}