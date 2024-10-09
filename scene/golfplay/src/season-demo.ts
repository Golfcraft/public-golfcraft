import {GolfplayClientSeasonFactory} from "../../src/components/lobby/golfplay-client-season";
import {getUserData} from "@decentraland/Identity"
import MESSAGE from "../../../server/rooms/mesages";
import {fadeInOverlay, fadeOutOverlay} from "../../src/components/ui/overlay";
import {hideWaitPlayers, showWaitForPlayers} from "../../src/components/lobby/season-game-countdown";
import {formatTime, sleep} from "../../../common/utils";
import {createOrShowNextGameUi} from "../../src/components/lobby/season-next-game-ui";
declare const console;

export const createSeasonDemo = async (parent, {colyseus, wip = true, onStarting, onFinish, onStarted, userDataState}) => {
    const callbacks = {
        onStarting,
        onFinish,
        onStarted
    };

    const {createClientGolfPlay} = GolfplayClientSeasonFactory({golfplayBaseUrl: engine["__COURSE_MODELS_BASE__"]});
    const userData = await getUserData();
    const {displayName, publicKey, hasConnectedWeb3, userId} = userData; //excluding avatar
    let starting = false;

    return {
        startGame
    };

    async function startGame(){
        if(starting) return;

        const state = {
            currentGame:0,
            countdown:0
        };
        starting = true;
        await fadeInOverlay(0.5);

        let golfplay;
        callbacks.onStarting && callbacks.onStarting();
        try{
            const waitResult:any = await showWaitForPlayers(5,[],userData,0,async function cancel(){
                console.log("cancel season game");
                hideWaitPlayers();
                room?.leave(true);
                golfplay?.dispose();

                await fadeOutOverlay(1);
                callbacks.onFinish && callbacks.onFinish();
                starting = false;
                state.currentGame = 0;
                state.countdown = 0;
                room?.leave(true);
            });
            if(waitResult.cancelled) return;
            const room = await colyseus.joinOrCreate(//TODO we should move room into createSeasonClientGolfPlay
                "season-room",
                {
                    user: {...userData, avatar:undefined},
                    userId,
                    PlayFabId: undefined,//its calculated by address on SeasonRoom
                    roomInstanceId: Date.now()
                },
            );
            if(waitResult.cancelled) {
                room?.leave(true);
                return;
            }
            starting = false;
            callbacks.onStarted();
            room.onMessage(MESSAGE.GAME_DEFINITIONS, async ({gameDefinitions, ghostsData})=>{
                console.log("MESSAGE.GAME_DEFINITIONS", gameDefinitions, ghostsData);
                handleGolfplay();

                async function handleGolfplay({rewards, timeout, tierSub, newTierSub, rewardsBonus}:any = {}){
                    console.log("handleGolfplay", formatTime(Date.now(), true), state.currentGame, gameDefinitions[state.currentGame]);
                    if(state.currentGame){
                        executeTask(async () => {
                            await createOrShowNextGameUi(
                                userData,
                                state.currentGame,
                                room.state.results.toJSON(),
                                tierSub,
                                newTierSub,
                                undefined,
                                state.currentGame === 4?10000:5000,
                                rewards,
                                rewardsBonus
                            );
                            fadeOutOverlay(1);
                            if(state.currentGame < 4){
                                await createGame(state.currentGame);
                                golfplay.ready()
                            }else{
                                console.log("FINISH")
                                //TODO restore everything
                                callbacks.onFinish && callbacks.onFinish();
                                room.leave();
                            }
                        })
                    }else{
                        executeTask(async () => {
                            try{
                                const waitResult:any = await showWaitForPlayers(10, ghostsData[state.currentGame], userData, state.currentGame, async function cancel(){
                                    console.log("cancel season game");
                                    hideWaitPlayers();
                                    await fadeOutOverlay(1);
                                    room?.leave(true);
                                    golfplay?.dispose();
                                    state.currentGame = 0;
                                    callbacks.onFinish && callbacks.onFinish();
                                });

                                console.log("hideWait", waitResult)
                                await sleep(3000);
                                hideWaitPlayers();
                                await fadeOutOverlay(1);
                                if(waitResult.cancelled) return;
                                console.log("READY")
                                await createGame(state.currentGame);
                                golfplay.ready();

                            }catch(error){
                                console.log("showwait try error",error)
                            }
                        });

                    }

                    async function createGame(currentGame){
                        console.log("createGame", currentGame);
                        const golfclubs = userDataState.golfclubs;
                        const activeGolfClub = golfclubs && (golfclubs.find(item => item.CustomData?.tokenId === userDataState.activeGolfClubTokenId) || golfclubs.find(item => item.ItemId === "golfclub-1")) || {
                            ItemId:"1"
                        };

                        if(state.currentGame < 4){
                            golfplay = await createClientGolfPlay(parent, {
                                gameDefinition:gameDefinitions[state.currentGame],
                                room,
                                wip,
                                golfclub: {
                                    id:activeGolfClub.ItemId.replace('golfclub-',''),//TODO if the player has other design, user it
                                    power:Number(activeGolfClub.CustomData?.attribute_power || 0),
                                    control:Number(activeGolfClub.CustomData?.attribute_control || 0),
                                    aim:Number(activeGolfClub.CustomData?.attribute_aim || 0),
                                },
                                currentGame:state.currentGame,
                                currentUserName:userData.displayName,
                                ghostsData,
                                colyseus
                            });

                            golfplay.onFinish((data) => {
                                console.log("FINISHED", data);
                            });

                            golfplay.onComplete(async ({tierSub, newTierSub, rewards, rewardsBonus}) => {
                                console.log("COMPLETED", rewards,rewardsBonus, state.currentGame);
                                state.currentGame++;//after here in last game, takes value 4
                                golfplay.dispose();
                                if( state.currentGame <= 4 ){
                                    handleGolfplay({rewards, tierSub, newTierSub, rewardsBonus});//TODO when last game
                                } else {
                                    //TODO not reachable?
                                    state.currentGame = 0;
                                }
                            });
                        }
                    }
                }
            });
        }catch(error){
            console.log("startGame try error",error)
        }
    }
}


