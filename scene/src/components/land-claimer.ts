import * as ui from '@dcl/ui-scene-utils'
import { signedFetch } from '@decentraland/SignedFetch'
import {showMessage} from "./server-notification";
import {getPendingChecker} from "../services/pending-queue";
import {atlasAnalytics} from "../atlas-analytics-service";

const land_names = [
    "Egypt",
    "Space",
    "Urban",
    "Jungle",
    "Mountain",
    "Cocobay"
]

export const createLandClaimer = (parent:Entity, {shape, rotation = Quaternion.Zero(), position, userStorage, collectionId}:any)=>{
    const offsetEntity = new Entity();
    //offsetEntity.addComponent(new BoxShape())
    offsetEntity.addComponent(new Transform({
        position: new Vector3(24*2, 0, 24*2),
        rotation: Quaternion.Euler(0, 0, 0)
    }));
    engine.addEntity(offsetEntity);

    const entity = new Entity();
    //entity.setParent(parent);
    entity.setParent(offsetEntity);
    entity.addComponent(shape);
    entity.addComponent(new Transform({
        position, rotation
    }));
    const pendingChecker = getPendingChecker();
    const state = {sending:false};
    const prompt = new ui.OptionPrompt(
        'Please confirm',
        `Confirm to claim ${land_names[collectionId]}-Land with 500 Diamonds`,
        async () => {
            showMessage({message:"Sending request..."});
            const userData =userStorage.getState().user;
            const data = {
                displayName:userData.displayName,
                address:userData.publicKey,
                PlayFabId:userStorage.getState().PlayFabId,
                collectionId
            };
            const result = await signedFetch(`https://golfcraftgame.com/bridge/claim-land`, {
                method:"POST",
                headers: {"Content-Type": "application/json"},
                body:JSON.stringify(data)
            });
            const jsonResult = result.json || result.text && JSON.parse(result.text);
            if(jsonResult && jsonResult?.error){
                showMessage({timeout:5000,message:jsonResult.error})
            }else if(result.ok){
                showMessage({timeout:5000,message:"Request sent, wait while is completed"});
                pendingChecker.checkPending();

            }else{
                showMessage({timeout:5000,message:"Error"})
                console.log("Unhandled condition.", JSON.stringify(result));
            }
            state.sending = false;
        },
        () => state.sending = false,
        'Confirm',
        'Cancel'
    );
    prompt.closeIcon.onClick = new OnPointerDown((e)=>{
        prompt.hide();
        state.sending = false;
    });
    prompt.hide();
    entity.addComponent(new OnPointerDown((event)=>{
        if(state.sending) return;
        state.sending = true;
        prompt.show();
        atlasAnalytics.submitGenericEvent(`gbc-claim-land-prompt`)
    },{
        hoverText:`Claim ${land_names[collectionId]}-Land for 500 Diamonds`,
        button:ActionButton.POINTER,
        showFeedback:true
    }))


    return {
        hide:()=>{
            prompt.hide();
            entity.setParent(null);
            engine.removeEntity(entity);
        },
        show:()=>{
            entity.setParent(offsetEntity)
        }
    };
}
