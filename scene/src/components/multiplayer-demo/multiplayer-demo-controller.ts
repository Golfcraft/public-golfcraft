import {createMultiplayerDemoScreenUX} from "./multiplayer-demo-screen";
import {addStore, globalStore} from "../../services/globalStore/globalStore";
import MESSAGE from "../../../../server/rooms/mesages";
import {GameDefinition} from "../../../../common/game-definition-type";
import {reproduceAvatarSound} from "../../services/avatar-sound";
import {fadeInOverlay, fadeOutOverlay} from "../ui/overlay";
import {sleep} from "../../../../common/utils";
import {createRemoteGamePlay2} from "../../../golfplay/src/golfplay-test-remote2";
import {createMultiplayerGameplay} from "../../../golfplay/src/golfplay-multiplayer";

export const createMultiplayerDemoScreen = (parent, {position, rotation, lobbyRoom, colyseus, root})=>{
    const callbacks = {
        onStartGame:null
    };
    const entity = new Entity();
    entity.setParent(parent);
    const screenUX = createMultiplayerDemoScreenUX(
        entity,
        {
            position,
            rotation,
            currentUserAddress:globalStore.userData.getState().user.publicKey
    });
    screenUX.setPlayers(lobbyRoom.state.demoRoom?.players?.toJSON() || []);

    if(lobbyRoom.state?.demoRoom) lobbyRoom.state.demoRoom.onChange = (changes) => {
        console.log("demoRoom change", changes);
    };
    if(lobbyRoom.state?.demoRoom?.players) lobbyRoom.state.demoRoom.players.onAdd = (player) => {
        console.log("lobbyRoom.state.demoRoom.players", lobbyRoom.state.demoRoom.players.toJSON());
        screenUX.setPlayers(lobbyRoom.state.demoRoom.players.toJSON());
    }
    if(lobbyRoom.state?.demoRoom?.players) lobbyRoom.state.demoRoom.players.onRemove = (player) => {
        console.log("lobbyRoom.state.demoRoom.players", lobbyRoom.state.demoRoom.players.toJSON());
        screenUX.setPlayers(lobbyRoom.state.demoRoom.players.toJSON());
    }
    screenUX.onLeave(()=>{
        const userData = globalStore.userData.getState();
        console.log("onLeave", userData);
        lobbyRoom.send(MESSAGE.LEAVE_DEMO_ROOM, {
            PlayFabId:userData.PlayFabId,
            address:userData.user.publicKey,
            realm:undefined,
            displayName:userData.user.displayName
        });
        globalStore.game.setState({waitingToPlay:false});
    });

    screenUX.onJoin(()=>{
        const userData = globalStore.userData.getState();
        console.log("onJoin", userData);
        lobbyRoom.send(MESSAGE.JOIN_DEMO_ROOM, {
           PlayFabId:userData.PlayFabId,
           address:userData.user.publicKey,
           realm:undefined,
           displayName:userData.user.displayName
        });
        globalStore.game.setState({waitingToPlay:true});//TODO disallow starting any other game when waitingToPlay
    });

    screenUX.onStart(() => lobbyRoom.send(MESSAGE.START_DEMO));

    const gameState = globalStore.game.getState();

    lobbyRoom.onMessage(MESSAGE.START_DEMO, async ({roomInstanceId, courseId})=>{
        if(gameState.playing || gameState.starting) return;
        setTimeout(()=>{ reproduceAvatarSound("intro"); }, 1000);
        fadeInOverlay(1);

        globalStore.game.setState({
            waitingToPlay:false,
            starting:true,
            started:false,
            playing:true
        });
        const gameDefinition:GameDefinition = {
            type:"competition",
            subType: "1",
            courseId
        };
        //TODO
        const {user, realm, PlayFabId} = globalStore.userData.getState();
        console.log("courseId", courseId);
        console.log("roomInstanceId",roomInstanceId);
        const gamePlay = await createMultiplayerGameplay(colyseus, gameDefinition, root, PlayFabId, realm, roomInstanceId );
        console.log("created gameplay with ROOM !!!!!")
        const courseDefinition = gamePlay.getCourseDefinition();
        globalStore.game.getState().courseName = courseDefinition.displayName || courseDefinition.alias;
        globalStore.game.getState().courseAuthor = courseDefinition.authorName;
        globalStore.game.getState().courseIsSeason = courseDefinition.isSeason;
        callbacks.onStartGame && callbacks.onStartGame();
        await sleep(3000);

        await fadeOutOverlay(2);
        globalStore.game.setState({
            starting:false,
            started:true
        });
    });

    return {
        show:()=>{
            entity.setParent(parent)
        },
        hide:()=>{
            entity.setParent(null);
            engine.removeEntity(entity);
        },
        onStartGame:(fn)=>{
            callbacks.onStartGame = fn;
        }
    }
}