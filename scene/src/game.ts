import {getCanvas} from "../golfplay/services/canvas"; // In use! No need to call it



import { getUserData } from "@decentraland/Identity";
import { getCurrentRealm } from "@decentraland/EnvironmentAPI";
import { movePlayerTo } from "@decentraland/RestrictedActions";
import Meta from './meta';
import { initializeVoxtersPet } from "../metas/voxters-pet/src";
import { createFashionDisplay, hideFashionDisplay, showFashionDisplay } from "./components/lobby/fashion-display";
import { createFashionLobby, setUserData, hideFashionLobby, showFashionLobby } from "./fashionshop/fashionshop-machine";
import { createRandomReward, setUserRandomRewardData, hideRandomReward, showRandomReward } from "./components/lobby/random-rewards"
import { CreateMural } from '@ohmyverse/oh-my-pixel-utils'
import {USE_REMOTE_SERVER} from "../../common/constants";

declare const console:any;
const _log = console.log;
console.log = (...args) => {
    _log("GFC", ...args);
}

console.log("GOLFCRAFT GAME");

let voxterPetSystem = null;
try{
    (async ()=>{
        voxterPetSystem = await initializeVoxtersPet();
    })();
}catch(err){
    console.log("err voxterSystem", err)
}
//import hostdata from "./hostdata.json";
/*createFashionLobby({
  onSale:()=>{

    meta.refreshUserData();
  }
});*/

createFashionLobby();
createRandomReward();
//createFashionDisplay();

/*createPetLobby({
  onSale:()=>{
    meta.refreshUserData();
  }
});*/

//*** COLLAB CANVAS


const ompPosition = [43, 25, 33];
const ompRotation =[0,90,0];
const frameOffset = [18.52-17.8, -0.2-3.3, 8.56 - 9.3 ];

//*/

//createFriends()

const landOwnerData = {
  host_data: `{
    "golfcraftgame": {
      "position": {
        "x": 24,
        "y": 0,
        "z": 24
      },
      "rotation": {
        "x": 0,
        "y": 0,
        "z": 0
      },
      "scale": {
        "x": 1,
        "y": 1,
        "z": 1
      },
      "pfTitleId":"BEAFE",
      "showDebug":false,
      "serverUrl":"localhost"
    }
  }
  `
};


const _getUserData = async () => {
    let userData;
    while(!userData){
        userData = await getUserData();
        if(!userData){
            console.log("NO USER DATA, retry", userData);
        }
    }
    return userData;
}
const meta = new Meta({getUserData:_getUserData, getCurrentRealm, movePlayerTo}, landOwnerData);

meta.onEvent((event) => {
    var hideElements = () => {
        console.log("hideElements");
        voxterPetSystem && voxterPetSystem.hide && voxterPetSystem.hide();
        hideFashionLobby();
        hideRandomReward();
        hideFashionDisplay();


    }
    var showElements = () => {
        console.log("showElements");
        voxterPetSystem && voxterPetSystem.show && voxterPetSystem.show();
        showFashionLobby();
        showRandomReward();
        showFashionDisplay();
    }
    switch(event.type){
        case 'PLAY_START':{
            console.log("PLAY_START");
            hideElements();
            break;
        }
        case "PLAY_END":{
            console.log("PLAY_END");
            showElements();
            break;
        }
        case 'EDIT_START':{
            console.log("EDIT_START");
            hideElements();
            break;
        }
        case "EDIT_END":{
            console.log("EDIT_END");
            showElements();
            break;
        }
        case "USER_DATA_CHANGE":{
            log("USER_DATA_CHANGE");
            log(event.data);
            if(event && event.data && event.data.propertyChanged){
              setUserData({[event.data.propertyChanged]:event.data.value});
              setUserRandomRewardData({[event.data.propertyChanged]:event.data.value});
              //setUserPetData({[event.data.propertyChanged]:event.data.value});
            }else{
              setUserData(event.data.value);
              setUserRandomRewardData(event.data.value);
              //setUserPetData(event.data.value);
            }

            break;
        }
    }
});

//createTutorial(landOwnerData);

// Unused
/*
const root = new Entity();
engine.addEntity(root);

createGolfClubStand(root, {
  src:`models/star-trail.glb`,
  position:new Vector3(24, 8, 42),
  rotation:Quaternion.Euler(0,90,0)
})
*/

