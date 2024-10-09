import {hideMessage, showMessage} from "../../src/components/server-notification";

declare const console:any;
const _log = console.log;
console.log = (...args:any[]) => {
    _log("GFC", ...args);
}
console.log("HELLO")
import {createPublicationMenu, preparePublish} from "./editor-publication-menu";
import {getUserData} from "@decentraland/Identity";
import {loadParts} from "../../golfplay/src/editor/parts-repository";
import {sleep} from "../../../common/utils";

let publicationMenu;
const box = new Entity();
const selectedCourse = {
    ID:288,
    alias:"test-map-desert-1"
};

box.addComponent(new OnPointerDown(async ()=>{
    showMessage({message:"Preparing data ..."});
    const partsData = await loadParts(false);
    const userData:any = await getUserData();
    let publishData;
    try{
        publishData = await preparePublish(selectedCourse, userData.publicKey, partsData);
    }catch(error){
        showMessage({timeout:10000, message:"An error happened"});
        return;
    }

    console.log("prepeared publish data", publishData);
    if(!publishData){
        return;
    }
    //change PlayFabId depending on current wallet, but not really deterministic, is used in signedFetch on publish to check that the address match in PlayFab
    publicationMenu = publicationMenu || await createPublicationMenu({PlayFabId:"59DB5EA948C1AE85", playerDisplayName:"pablo"});
    publicationMenu.open(publishData);
    publicationMenu.onClose((closeResult)=>{
        console.log("closeResult", closeResult);
    });
}));
box.addComponent(new BoxShape());
box.addComponent(new Transform({
    position:new Vector3(8,1,8)
}));
engine.addEntity(box);