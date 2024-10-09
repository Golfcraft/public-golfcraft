import * as ui from '@dcl/ui-scene-utils';
import {signedFetch} from "@decentraland/SignedFetch";
import {USE_REMOTE_SERVER} from "../../../common/constants";
import {getUserData} from "@decentraland/Identity";
import {globalStore} from "../services/globalStore/globalStore";
import {sleep} from "../../../common/utils";
let prompt = new ui.FillInPrompt(
    'Creator code',
    async (code: string) => {
        log(code);

        const data = await signedFetch(`${USE_REMOTE_SERVER?"https://golfcraftgame.com":"http://localhost:2569"}/api/set-affiliate-code`, {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({
                code:code.toUpperCase(),
                playerAddress:globalStore.userData.getState().userId.toLowerCase(),
                PlayFabId:globalStore.userData.getState().PlayFabId,
                displayName:globalStore.userData.getState().displayName
            })
        }).then(r=>JSON.parse(r.text));

        console.log("data--->",data);
        if(data?.ok){
            globalStore.userData.setState({affiliateCode:code.toUpperCase()})
        }

        ui.displayAnnouncement(data.error || "DONE!", 2);
    },
    'Submit!',
    'Enter code here ...'
)
prompt.hide();

export const createCreatorCodeButton = (parent) => {
    const entity = new Entity();
    entity.addComponent(new GLTFShape("models/building/tv-affiliates.gltf"));
    entity.addComponent(new Transform({
        position:new Vector3(9-24,10-1.68,26.5-24),
        rotation: Quaternion.Euler(0, 130, 0)
    }));
    entity.addComponent(new OnPointerUp(()=>{
        prompt.fillInBox.placeholder = globalStore.userData.getState().affiliateCode || 'Enter code here ...';
        prompt.show();
    },{
        button: ActionButton.POINTER,
        showFeedback: false
    }))
    entity.setParent(parent);
}