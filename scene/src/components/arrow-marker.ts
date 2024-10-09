import { sleep } from "../../../common/utils";
import { globalStore } from "../services/globalStore/globalStore";

export const createArrowMarker = (parent) => {
    const entity = new Entity();
    const shape = new GLTFShape("models/arrow-mark.glb")
    const transform = new Transform({
        position: new Vector3(0, 4.5, -7)
    });

    //entity.setParent(parent);
    entity.addComponent(new Billboard());
    entity.addComponent(shape);
    entity.addComponent(transform);
    const listenState = async ()=>{
            await sleep(1);
            const gameState = globalStore.game.getState();
            const userData = globalStore.userData.getState();
            if(gameState.playing || gameState.editing){
                entity.setParent(null);
                engine.removeEntity(entity);
                //TODO unlisten
                unlistenGame();
                unlistenUser();
                return;
            }
            if(userData["statistic_tier-sub"] >= 5) {
                entity.setParent(null);
                engine.removeEntity(entity);
                //TODO unlisten
                unlistenGame();
                unlistenUser();
                return;
            }

            if(!gameState.connected && !gameState.connecting) return;   
            if(gameState.connected && (!userData["statistic_current_mission"] ||userData["statistic_current_mission"] < 7)){
                entity.setParent(parent);
                transform.position.set(25-24, 4.5, 32-24 );
                //transform.position.set(14-24, 4.5, 45-24 );
                return;
            }else if(gameState.connected && (!userData["statistic_tier-sub"] || userData["statistic_tier-sub"] < 5) ){
                entity.setParent(parent);
                transform.position.set(14-24, 5.5, 45-24 );
                return;
            }
    };

    const unlistenGame = globalStore.game.onChange(listenState);
    const unlistenUser = globalStore.userData.onChange(listenState, "statistic_current_mission");
    listenState();
}