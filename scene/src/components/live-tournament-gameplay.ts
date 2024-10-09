import {GolfplayClientFactory} from "./lobby/golfplay-client";
import {globalStore} from "../services/globalStore/globalStore";
import {getMusicForCollection, reproduceMapMusic} from "../services/map-music";
import {sleep, waitFor} from "../../../common/utils";
import MESSAGE from "../../../server/rooms/mesages";
import {getTopBar} from "../../src/components/ui/topbar";
import {fadeInOverlay, fadeOutOverlay} from "./ui/overlay";
import {VisualBallFactory} from "../../golfplay/src/components/ball";
import {createOrGetLiveTournamentResultsUI} from "./live-tournament-results";
import {createOrGetLiveTournamentGameplayUI} from "./live-tournament-gameplay-ui";

export const createLiveTournamentGameplay = async (parent, {room, colyseus, courseIds, numberOfMaps, onFinish, instanceId}) => {
    console.log("createLiveTournamentGameplay", {room, colyseus, courseIds, instanceId}, room.state.currentMapIndex);
    const callbacks = {onFinish};
    const gameplayUI = createOrGetLiveTournamentGameplayUI(room);
    const state = {
        currentGame:room.state.currentMapIndex||0,
        countdown:0,
        countdownTime:0,
        started:false,
        starting:false,
        music:"",
        gameDefinitions:courseIds.map(alias => ({
            type:"competition",
            subType:"1",
            courseId:alias
        }))
    };

    const {createClientGolfPlay} = GolfplayClientFactory({golfplayBaseUrl: engine["__COURSE_MODELS_BASE__"]});
    const userDataState = globalStore.userData.getState();
    console.log("userDataState",userDataState)
    const golfclubs = userDataState.golfclubs;
    const activeGolfClub = golfclubs && (golfclubs.find(item => item.CustomData?.tokenId === userDataState.activeGolfClubTokenId) || golfclubs.find(item => item.ItemId === "golfclub-1")) || {
        ItemId:"1"
    };
    let resultScreen;
    let timeInterval;
    let clientGolfPlay;
    let serverTimeOffset = 0;
    const {createVisualBall} = VisualBallFactory({baseResourceUrl:engine["__COURSE_MODELS_BASE__"]});
    console.log("room.onMessage", room, room.state.players.length);
    console.log("room.state.toJSON()", JSON.stringify( room.state.toJSON(), null, "  " ));
    room.onMessage(MESSAGE.PLAYER_HOLE, async ({serverTime, showCountdown})=>{
        console.log("PLAYER_HOLE", {serverTime, showCountdown})
        if(showCountdown){
            serverTimeOffset = Date.now() - serverTime;
            state.countdown = 59;
            state.countdownTime = Date.now();//serverTime - serverTimeOffset;//TODO be aware we can have offset, e.g. local is 1 min ahead
        }
    });

    room.onMessage(MESSAGE.LIVE_TOURNAMENT_END, async ()=>{
        console.log("LIVE_TOURNAMENT_END");
        room.leave();
        await sleep(3000);
        resultScreen?.hide();
        gameplayUI.hide();
        callbacks.onFinish();
        getTopBar().hide();
    });

    room.onMessage(MESSAGE.COMPLETED, async ()=>{
        gameplayUI.hide();
        console.log("COMPLETED and fadeIn", Date.now(), JSON.stringify(state));
        const stateJSON = room.state.toJSON();
        console.log("stateJSON", JSON.stringify(stateJSON,null, "  "));

        if(state.currentGame < (numberOfMaps-1)){
            console.log("prepare for next map");
            state.currentGame++;
            state.starting = true;
        }else{
            console.log("prepare end of tourney");
            state.starting = false;
            getTopBar().hide();
        }
        state.countdown = 0;
        state.countdownTime = 0;
        state.started = false;
        clientGolfPlay.dispose();
        clearInterval(timeInterval);
        resultScreen = createOrGetLiveTournamentResultsUI(stateJSON);
        clientGolfPlay.dispose();
        await fadeInOverlay(1);
    });

    room.onMessage(MESSAGE.START, async ({startTime, serverTime, collectionId})=>{//TODO duplicated code, abstract to service
        resultScreen?.hide();
        let playerBalls;
        if(!state.currentGame){ //TODO create balls only first time
            console.log("room.state.players",room.state.players.map(p=>p.displayName).join(","))
            playerBalls = room.state.players.map((player) => {
                if(player.address.toLowerCase() !== userDataState.address.toLowerCase()){
                    console.log("visualBall",player.displayName, player.ball.position.toJSON())
                    const visualBall = createVisualBall(parent, {
                        position:new Vector3(player.ball.position.x, player.ball.position.y,player.ball.position.z),
                        displayName:player.displayName
                    });
                    player.ball.position.onChange = ()=>{
                        visualBall.setPosition(player.ball.position)
                    }
                    return visualBall;
                }
            });
        }

        console.log("START",{startTime, serverTime, collectionId}, Date.now());

        const gameDefinition = state.gameDefinitions[state.currentGame];
        console.log("gameDefinition",state.currentGame,gameDefinition);
        const localStartTime = startTime - (serverTime-Date.now());
        const topBar = getTopBar();
        clientGolfPlay = await createClientGolfPlay(parent, {
            gameDefinition,
            room,
            roomBall:room.state.players[0].ball,
            golfclub: {
                id:activeGolfClub.ItemId.replace('golfclub-',''),//TODO if the player has other design, user it
                power:Number(activeGolfClub.CustomData?.attribute_power || 0),
                control:Number(activeGolfClub.CustomData?.attribute_control || 0),
                aim:Number(activeGolfClub.CustomData?.attribute_aim || 0),
            },
            wip:true,
            colyseus,
            expressionState:{}});
        topBar.show();
        gameplayUI.show();
        timeInterval = setInterval(()=>{
            if(!state.started && localStartTime <= Date.now()){
                if(!collectionId){
                    state.music = getMusicForCollection(Math.floor(Math.random()*2));
                    reproduceMapMusic(state.music);
                }
                state.started = true;
                console.log("STARTED", !!clientGolfPlay);

                executeTask(async ()=>{
                    await waitFor(()=>clientGolfPlay);
                    clientGolfPlay.start();
                    console.log("clientGolfPlay started")
                })
                state.starting = false;
            }

            if(!state.started)  topBar.updateTime(localStartTime-Date.now(), false);
            if(state.countdown){
                const countdownMs = Math.max(0,(state.countdown * 1000) -  (Date.now() - state.countdownTime));
                topBar.updateTime(
                    countdownMs
                )
            }
            if(!shouldShowTime() && topBar.isVisible()){
                console.log("hideTime");
                topBar.hide()
            }
            if(shouldShowTime() && !topBar.isVisible()){
                console.log("showTime")
                topBar.show()
            }

            function shouldShowTime(){
                if(!state.started) return true;
                if(state.countdown) return true;
                if(state.started) return false;
            }
        },100);
    });

}