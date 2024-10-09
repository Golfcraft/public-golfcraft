import {Room} from "colyseus";
import {Schema, ArraySchema, MapSchema, type} from "@colyseus/schema";
import {LEAVE_CODE, PRICE_COMPETITION_GROUP, USE_REMOTE_SERVER} from "../../common/constants";
import {tryFetch} from "../utils/try-fetch";
import {creatServerGolfPlay} from "./golfplay-server";
import {Gameplay, Vector3, Quaternion, ChestSchema} from "./GamePlayState";
import {getCourseDefinition} from "../../common/course-definitions/course-definition-repository";
import {GameDefinition} from "../../common/game-definition-type";
import {migrateCourseDefinitionAnimations, withNoiseOnStartPosition} from "../../common/course-animations-migration";
import MESSAGES from "./mesages";
import {createFrameReproduction} from "../../common/frame-reproductor";
import {createEventManager} from "../../scene/golfplay/src/services/EventManagerFactory";
import {EVENT} from "../../scene/golfplay/src/gameplay-handlers/handler-def";
import MESSAGE from "./mesages";
import {
    cloneJSON, defaultChestRewardChances, deserializeRecipe,
    getCatFromTier, getNumberOfFrames,
    getRandomFromList, getRandomInt,
    getTierFromSub,
    getTierPercentiles, mapPropertiesMultInt,
    sleep,
    waitFor
} from "../../common/utils";
import fetch from "cross-fetch";
import {promisify} from "util";
import {PlayFabAdmin, PlayFabServer} from "playfab-sdk";
import IPlayFabError = PlayFabModule.IPlayFabError;
import {CURRENCY} from "../../common/currency-codes";
import {callDiscordHook} from "../../common/discord";
import {pushChests} from "./chests-generator";
const API_URL = process.env.PROD ? `https://golfcraftgame.com` : `http://localhost:2569`;
const playfabServerApiKey = process.env.PLAYFAB_API_KEY;
const NUM_PLAYERS = 4;
const countdownByTierCat = [
    30000,
    28000,
    25000,
    20000,
    15000,
    15000,
    15000,
    15000,
    15000,
    15000,
    10000
];

const MATERIAL_FACTOR = {
    GC:36,
    WD:36,
    ST:18,
    IR:8,
    GD:2,
    DM:1,
    FT:6,
    EN:1,
    PT:2
};

class Ghost extends Schema {
    @type(Vector3)
    position = new Vector3(0,0,0)
    @type(Vector3)
    velocity = new Vector3(0,0,0)
    @type("string")
    name;
    @type("string")
    address;

    currentFrame = 0;
    frameCount = 0;
    finished = false;
    shooting = false;
}

class PlayerResults extends Schema {
    @type("string")
    address:string;

    //0 is current player, ...rest(3) are ghosts
    @type("string")
    name:string;

    @type(["number"])
    shots:number[] = new ArraySchema<number>(0,0,0,0)

    @type(["number"])
    time:number[] = new ArraySchema<number>(0,0,0,0)

    @type(["number"])
    score:number[] = new ArraySchema<number>(0,0,0,0)

    constructor(){
        super();
    }
}

class SeasonRoomState extends Gameplay {
    @type([Ghost])
    ghosts = new ArraySchema<Ghost>();//TODO just for test, we can remove later
    @type("int8")
    currentGame = 0;
    @type([PlayerResults])
    results = new ArraySchema<PlayerResults>(new PlayerResults(),new PlayerResults(),new PlayerResults(),new PlayerResults());
    @type("number")
    playerTierSub = 0;
    countdownTime = 0;
    seasonStartTime = Date.now();
    rewards = {GC:0, WD:0, ST:0, IR:0, GD:0, FT:0, EN:0, DM:0};
    finishedPlayer: boolean = false;

    constructor(courseDefinition) {
        super(courseDefinition, false);//courseDefinition was used for movingParts, but is not necessary now
    }

    setNewGame(courseDefinition){
        this.shoots = 0;
        this.started = false;
        this.finished = false;
        this.startTime = Number.MAX_SAFE_INTEGER;
        const initialPosDef =  courseDefinition.parts.find(p=>p.type === "initial_position");
        console.log("setNewGame",initialPosDef);
        const [x,y,z] = initialPosDef.position;
        const [qx,qy,qz,qw] =  initialPosDef.rotation;
        this.ball.updateFromCANNON({
            position:new Vector3(x,y,z),
            quaternion:new Quaternion(qx,qy,qz,qw)
        });
    }

    async setGhostsData(ghostsData){
        this.ghosts.splice(0, this.ghosts.length);

        ghostsData.forEach((ghostData, index) => {
            const ghost = new Ghost();
            if(!(ghostData?.frames?.length)) {
                console.log("ghost with no frames", ghostData?.ID)
                return;
            }

            const [,x,y,z] = ghostData.frames[0];
            ghost.position = new Vector3(x, y, z);
            ghost.velocity = new Vector3(0,0,0);
            console.log("ghost name", index+1, ghostData.displayName);
            this.results[index + 1].name = ghost.name = ghostData.displayName;
            this.results[index + 1].address = ghost.address = ghostData.address;
            this.ghosts.push(ghost);
        });
    }
}

type RecordedFrame = {
    type: number,
    value: number | number[] | null//num of frames | direction | position
};
const RECORDED_FPS = 30;
const RECORDED_FRAME_MS = 1000 / RECORDED_FPS;

enum RECORDED_FRAME {
    IDLE, SHOOT, MOVE, HOLE
}
const HALLOWEEN_WEARABLE_STATISTIC = "wearable:halloween-2022";//TODO make it dynamic set on chest_events table
const OPEN_CHEST_STATISTIC = "chests_open";

export class SeasonRoom extends Room<SeasonRoomState> {
    private interval: ReturnType<typeof setInterval>;
    private intervalGhosts: ReturnType<typeof setInterval>;
    private golfPlay;
    private gameDefinition;
    private courseDefinition;
    private frameReproduction = null;
    private ghostsData;
    lastPingTimeMs;
    lastPingMs;
    frameEventHandler = createEventManager();
    recordedFrames: RecordedFrame[] = [];
    recordPositionFrames: boolean = false;
    lastRecordedFrameTime = 0;
    PlayFabId;
    playerTierSub = 0;
    private selectedCourses: any[];
    async onAuth(client, {clientInfo, user}, request) {
        //TODO should check if the user has enough "daily energy"
        console.log("onAuth")
        try{
            const address = user.publicKey;
            const [{PlayFabId}] = await promisify(PlayFabServer.GetPlayFabIDsFromGenericIDs)({
                "GenericIDs": [
                    {
                        "ServiceName": "address",
                        "UserId": address
                    }]
            }).then(r=>r.data.Data);
            this.PlayFabId = PlayFabId;



            console.log("this.playerTierSub",this.playerTierSub);
            return true;
        }catch(e){
            console.log("onAuth error",e)
            return false;
        }
    }

    async prepareGhostsData(address, courseAliases,playerTierSub){

        const [minPercentile, maxPercentile] = getTierPercentiles(getTierFromSub(playerTierSub));
        console.log("prepareGhostsData",courseAliases,playerTierSub,minPercentile,maxPercentile);
        try{
            this.ghostsData = await fetch(
                API_URL + '/api/get-random-recorded-games',
                {
                    method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({
                        courseAliases,
                        address,
                        minPercentile,
                        maxPercentile
                    })
                }).then(r => {
                    try{
                        const data =  r.json();
                        return data;
                    }catch(error){
                        console.log("GRRG error get-random-recorded-games", error);
                        this.ghostsData = [[], [], [], []];
                    }
            });
        }catch(error){
            console.log("error", API_URL + '/api/get-random-recorded-games',error)
            this.ghostsData = [[], [], [], []];
        }
    }

    private user;
    private SEASON_REWARD_FACTOR;
    async onCreate({user, groupId}) {
        console.log("onCreate", JSON.stringify(user));
        const address = user.publicKey;
        const [{PlayFabId}] = await promisify(PlayFabServer.GetPlayFabIDsFromGenericIDs)({
            "GenericIDs": [
                {
                    "ServiceName": "address",
                    "UserId": address
                }]
        }).then(r=>r.data.Data);
        console.log("create", PlayFabId);
        this.PlayFabId = PlayFabId;
        this.user = user;
        this.SEASON_REWARD_FACTOR = await promisify(PlayFabServer.GetTitleData)({Keys:["SeasonRewardFactor"]}).then(r=>r.data.Data.SeasonRewardFactor && Number(r.data.Data.SeasonRewardFactor) || 0.25);
        this.update = this.update.bind(this);
        this.playerTierSub = (await promisify(PlayFabServer.GetPlayerStatistics)({
            PlayFabId:this.PlayFabId,
            StatisticNames:["tier-sub"],
        }).then(r=>r.data.Statistics[0]?.Value || 0, (error ) => {
            console.log("GetPlayerStatistics error",error);
            return 0;
        }));
        const playerTierCat = Math.max(0, getCatFromTier(getTierFromSub(this.playerTierSub)));

        let courseQuery = {
            "query":{
                "where":{
                    "minTierCat":{"lte":playerTierCat||0},
                    "maxTierCat":{"gte":playerTierCat||0},
                    "isSeason":1
                }
            },
            "table":"courses"
        }
        console.log("requesting course", JSON.stringify(courseQuery));
        const c1 = await tryFetch(1,API_URL+`/api/get-random-row?r=${Date.now()+0}`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(courseQuery)})
            .then(tryJsonResponse,handleErrorRandomCourseResponse).catch(handleErrorRandomCourseResponse);
        this.selectedCourses = [
            c1,
            await tryFetch(1,API_URL+`/api/get-random-row?r=${Date.now()+1}`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(courseQuery)}).then(tryJsonResponse,handleErrorRandomCourseResponse).catch(handleErrorRandomCourseResponse),
            await tryFetch(1,API_URL+`/api/get-random-row?r=${Date.now()+2}`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(courseQuery)}).then(tryJsonResponse, handleErrorRandomCourseResponse).catch(handleErrorRandomCourseResponse),
            await tryFetch(1,API_URL+`/api/get-random-row?r=${Date.now()+3}`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(courseQuery)}).then(tryJsonResponse,handleErrorRandomCourseResponse).catch(handleErrorRandomCourseResponse)
        ];
        //TODO sort all courses by course.minTierCat
        this.selectedCourses.sort((a,b)=>{
            return a.minTierCat - b.minTierCat;
        })

        async function tryJsonResponse(r){
            try{
                return await r.json()
            }catch(error){
                return Promise.reject(error)
            }

        }
        function handleErrorRandomCourseResponse(error){
            console.log("error", error, courseQuery)
        }
        console.log("preparing ghostData")
        await this.prepareGhostsData(user.userId, this.selectedCourses.map(c=>c?.alias), this.playerTierSub);
        console.log("prepared ghostData", this.ghostsData);
        await this.prepareMap({
            courseId:this.selectedCourses[0].alias,
            type:"season",
            subType:"1"
        });
        this.setState(new SeasonRoomState(this.courseDefinition));

        this.state.results[0].name = user.displayName;
        this.state.results[0].address = user.publicKey;

        this.onMessage(MESSAGES.READY, (client) => {
            this.state.startTime = Date.now() + 12000;
            console.log("READY",this.state.startTime, new Date(this.state.startTime).toISOString());
            client.send(MESSAGES.START, {
                startTime: this.state.startTime,
                serverTime: Date.now(),
                courseAlias:this.courseDefinition.alias
            });
        });
        this.onMessage(MESSAGE.CHEST, (client, {index})=>{
            console.log("chest", index);
            this.state.chests.at(index).used = true;
        });
        this.onMessage(MESSAGES.PING, (client) => {
            client.send(MESSAGES.PONG);
            this.lastPingTimeMs = Date.now();
        });
        this.onMessage(MESSAGE.PING2, () => {
            this.lastPingMs = Date.now() - this.lastPingTimeMs;//TODO apply?
        });

        this.onMessage(MESSAGE.FIX_BUGS, () => {
            this.state.started = true;
            this.state.finishedPlayer = false;
            this.golfPlay.setIdle(true);
        });

        this.onMessage(MESSAGES.SHOOT, async (client, {impulse, timeStep, delayMs}) => {
            console.log("SHOOT",this.state.finished,this.state.started);
            if (!this.state.finishedPlayer && this.state.started) {
                console.log("initialpos", this.courseDefinition.parts.find(p=>p.type === "initial_position"));
                console.log("SHOOT",this.state.ball.toJSON());
                if(this.recordedFrames.length === 2 && this.recordedFrames[0].type === RECORDED_FRAME.IDLE && this.recordedFrames[1].type === RECORDED_FRAME.IDLE ){
                    this.recordedFrames.shift();//TODO REVIEW WORKAROUND: remove first recorded frame if second is also IDLE, this happens in second map, because and OUT is triggered
                }
                const timeToSetIntoIdleFrame = getFramesSinceTime(this.lastRecordedFrameTime);

                (this.recordedFrames[this.recordedFrames.length-1].value as number[]).push(
                    timeToSetIntoIdleFrame
                );
                this.recordedFrames.push({
                    type: RECORDED_FRAME.SHOOT,
                    value: [impulse.x, impulse.y, impulse.z]
                });
                this.lastRecordedFrameTime = Date.now();
                setTimeout(() => {
                    this.recordPositionFrames = true;
                }, Math.max(0,delayMs-50));
                this.state.shoots = this.state.shoots + 1;
                this.state.results[0].shots[this.state.currentGame]++;
                const framesDelayMs = Math.max(0, delayMs - (this.lastPingMs || 0));
                const {frames, processingTimeMs} = this.golfPlay.getFrames({
                    timeStep,
                    impulse,
                    delayMs: framesDelayMs,
                    lastPingMs: this.lastPingMs
                });
                client.send(MESSAGE.SHOOT_FRAMES, {frames, timeStep, impulse});
                await sleep(Math.max(0, delayMs - (processingTimeMs || 0) - this.lastPingMs * 2));
                client.send(MESSAGE.START_SHOOT_FRAMES);
                await sleep(this.lastPingMs);

                this.golfPlay.setIdle(false);
                //gameplay
                //TODO HERE IS WHERE WE SHOULD HANDLE RECORDED FRAMES ? or add delayMs to client reproduction
                this.frameReproduction = createFrameReproduction({
                    frames,
                    timeStep,
                    onEvent: (event) => {
                        console.log("frameReproductor event", event);
                        this.frameEventHandler.trigger(event);
                    },
                    onUpdateBall: ({position, velocity}) => {
                        Object.assign(this.golfPlay.getPhysicBall().body.position, position);
                        Object.assign(this.golfPlay.getPhysicBall().body.velocity, velocity);
                    },
                    onFinish: () => {
                        this.frameReproduction = null;
                    }
                });
            }

            function getFramesSinceTime(time) {
                const diff = Date.now() - time;
                return Math.ceil(diff / RECORDED_FRAME_MS);//TODO review if floor is fine
            }
        });
    }

    async onJoin(client, {realm, user}) {
        console.log("join", this.PlayFabId, JSON.stringify(user));
        client.send(MESSAGE.GAME_DEFINITIONS, {gameDefinitions:this.selectedCourses.map(c=>({
                courseId: c.alias,
                type: "season",
                subType: "1"
            })), ghostsData:this.ghostsData});

        await this.prepareGame(client, {PlayFabId:this.PlayFabId, user});

        return 123;
    }

    async prepareMap(gameDefinition){
        console.log("prepareMap");
        this.gameDefinition = gameDefinition;
        console.log("getCourseDefinition call", this.gameDefinition);
        const originalCourseDef: any = await getCourseDefinition(this.gameDefinition, fetch, true);//TODO remove wip?
        console.log("originalCourseDef",!!originalCourseDef,!!originalCourseDef?.parts?.length);
        this.courseDefinition = migrateCourseDefinitionAnimations(originalCourseDef, [/*withNoiseOnStartPosition*/]);
        this.reproduceGhostsFrame = this.reproduceGhostsFrame.bind(this);
    }

    private update(dt) {
        if (this.state.finished) return;
        if (!this.state.started && this.state.startTime && Date.now() > this.state.startTime) {
            console.log("STARTED = TRUE");
            this.state.started = true;

            this.lastRecordedFrameTime = Date.now();
            const position = this.golfPlay.getPhysicBall().body.position;
            this.recordedFrames.push({
                type: RECORDED_FRAME.IDLE,
                value: [position.x, position.y, position.z]
            });
        }

        if (this.recordPositionFrames && ((Date.now() - this.lastRecordedFrameTime) > RECORDED_FRAME_MS)) {
            this.lastRecordedFrameTime = Date.now();
            const position = this.golfPlay.getPhysicBall().body.position;
            const velocity = this.golfPlay.getPhysicBall().body.velocity;
            this.recordedFrames.push({
                type: RECORDED_FRAME.MOVE,
                value: [position.x, position.y, position.z, velocity.x, velocity.y, velocity.z]
            });
        }

        if (this.frameReproduction) {
            this.frameReproduction.update(dt);
        }

        this.golfPlay.updateAnimations(dt);
    }

    async clockCheck({client, PlayFabId}) {
        //TODO there is no limit time, because recorded gameplays will make it finish before
    }

    ghostIdleStarTimes = [0,0,0];

    reproduceGhostsFrame(client, {user, PlayFabId}){//interval function
        if(this.state.finished) return;
        if(this.state.started){
            this.state.ghosts.forEach((ghost, ghostIndex) => {
                if(ghost.finished) return;
                if(!this.ghostsData[this.state.currentGame][ghostIndex]?.frames){
                    console.log("FAIL");
                }
                const frame = this.ghostsData[this.state.currentGame][ghostIndex]?.frames[ghost.currentFrame];
                const [type] = frame;
                if(type === RECORDED_FRAME.IDLE){

                    this.ghostIdleStarTimes[ghostIndex] = this.ghostIdleStarTimes[ghostIndex] || Date.now();

                    const [,x,y,z,framesToPass] = frame;
                    const timeDiff = Date.now() - this.ghostIdleStarTimes[ghostIndex];
                    const timeDiffInFrames = Math.floor(timeDiff / RECORDED_FRAME_MS);
                    if(timeDiffInFrames > framesToPass){
                        console.log("GHOST_IDLE_1");
                        this.ghostIdleStarTimes[ghostIndex] = 0;
                        ghost.currentFrame++;
                    }
                }else if(type === RECORDED_FRAME.MOVE){
                    const [,x,y,z,vx,vy,vz] = frame;
                    ghost.velocity.x = vx;
                    ghost.velocity.y = vy;
                    ghost.velocity.z = vz;
                    ghost.position.x = x;
                    ghost.position.y = y;
                    ghost.position.z = z;
                    ghost.currentFrame++;
                }else if(type === RECORDED_FRAME.SHOOT){
                    if(!ghost.shooting) {
                        this.state.results[ghostIndex+1].shots[this.state.currentGame]++;
                        setTimeout(()=>{
                            ghost.currentFrame++;
                            ghost.shooting = false;
                        },400);
                    }
                    ghost.shooting = true;
                    //TODO we can send socket to client to show golfclub of other player and run animation
                }else if(type === RECORDED_FRAME.HOLE){
                    console.log("GHOST HOLE")
                    //TODO we should notify a 20s countdown to the user
                    this.state.results[ghostIndex+1].time[this.state.currentGame] = this.ghostsData[this.state.currentGame][ghostIndex].time;
                    this.state.results[ghostIndex+1].shots[this.state.currentGame] = this.ghostsData[this.state.currentGame][ghostIndex].shots;
                    if(!this.state.countdownTime){
                        this.startHoleCountdown(client, {user, PlayFabId});//TODO instead we could use a callback with those params and decouple countdown from reproduceFrame
                    }else{//TODO if all balls made hole

                    }

                    ghost.finished = true;
                }
                ghost.frameCount++;
            });
        }
    }
    async startHoleCountdown(client, {user, PlayFabId}){
        this.state.countdownTime = Date.now();

        const countdownMs = countdownByTierCat[getCatFromTier(getTierFromSub(this.playerTierSub))]||30000;
        console.log("startHoleCountdown", Date.now(), countdownMs);
        this.broadcast(MESSAGE.COUNTDOWN, countdownMs);
        console.log("WaitFor", Date.now());
        let startWait = Date.now();
        await Promise.race([
            sleep(countdownMs),
            waitFor(()=>this.state.results.every(playersResults => Number(playersResults.time[this.state.currentGame]) > 0))
        ]);

        console.log("BROADCAST END_COUNTDOWN", Date.now()-startWait);
        this.broadcast(MESSAGE.END_COUNTDOWN);

        this.frameReproduction?.dispose();
        this.golfPlay?.dispose();
        this.state.finished = true;
        this.state.countdownTime = 0;
        setScoresAtRound(this.state.results, this.state.currentGame, Date.now() - this.state.startTime);
        const currencyCodes = Object.values(CURRENCY).filter(i=>i !== CURRENCY.COINS && i !== CURRENCY.ENERGY);

        const copiedResults = cloneJSON(this.state.results);
        const sortedAccumulatedResult = [...copiedResults].sort((a,b)=>{
            return b.score.reduce(sumAcc,0) - a.score.reduce(sumAcc,0);
        });
        const sortedResult = [...copiedResults].sort((a,b)=>{
            return b.score[this.state.currentGame] - a.score[this.state.currentGame];
        });

        //TODO should higer tier win more mats,xp,ft etc ?

        console.log("found player in results", sortedResult.findIndex(r => r.address === user.userId));
        const Value = 2-sortedResult.findIndex(r => r.address === user.userId);
        const accumulatedValue = 2-sortedAccumulatedResult.findIndex(r => r.address === user.userId);

        const courseRewards = Value > 0 ? {[getRandomFromList(currencyCodes)]:Value, GC:Value}:{};

        if(this.state.currentGame === 3){
            console.log("Adding tiersub", accumulatedValue);
        }

        this.broadcastPatch();

        if(this.state.currentGame !== 3){
            this.broadcast(MESSAGE.COMPLETED, {
                tierSub:undefined,
                newTierSub:undefined,
                rewards:courseRewards
            });
        }

        sumDrops(courseRewards, this.state.rewards);

        if(this.state.currentGame === 3){
            const base = JSON.parse(JSON.stringify(this.state.rewards));
            const [fWearables, fGolfclubs] = await (promisify(PlayFabServer.GetUserReadOnlyData)({PlayFabId, Keys:["wearablesBonus", "golfclubsBonus"] })).then(d=>{
                console.log("wearablesBonus, golfclubsBonus", d);
                return [
                    1 + (Number(d.data.Data.wearablesBonus?.Value || 0)/100),
                    1 + (Number(d.data.Data.golfclubsBonus?.Value || 0)/100)
                ];
            }).then(ns => [isNaN(ns[0])?1:ns[0],isNaN(ns[1])?1:ns[1]]);
            console.log("base rewards",this.state.rewards);

            const tierCatF = 1 + (getCatFromTier(getTierFromSub(this.playerTierSub))/5);

            Object.assign(this.state.rewards, mapPropertiesMultInt(this.state.rewards, fWearables));
            Object.assign(this.state.rewards, mapPropertiesMultInt(this.state.rewards, fGolfclubs));
            Object.assign(this.state.rewards, mapPropertiesMultInt(this.state.rewards, tierCatF));

            console.log("fWearables",fWearables);
            console.log("tierCatF",tierCatF);
            Object.keys(this.state.rewards).forEach((materialKey)=>{
                if(MATERIAL_FACTOR[materialKey]){
                    this.state.rewards[materialKey] =
                        Math.ceil(this.state.rewards[materialKey]
                        * MATERIAL_FACTOR[materialKey]
                        * (this.SEASON_REWARD_FACTOR || 0.25));
                }else{
                    console.log("REVIEW MATERIAL_FACTOR", materialKey)
                }
            });
console.log("accumulatedValue", JSON.stringify(sortedAccumulatedResult,null, "  "), accumulatedValue)
            this.broadcast(MESSAGE.COMPLETED, {
                tierSub:Math.max(0,this.playerTierSub),
                newTierSub:Math.max(0, this.playerTierSub + accumulatedValue),
                rewards:this.state.rewards,
                rewardsBonus:{
                    base,
                    wearables:fWearables,
                    golfclubs:fGolfclubs,
                    tier:isNaN(tierCatF)?0:tierCatF
                }
            });
            const FunctionParameter = {
                xpReward: (1 + getCatFromTier(getTierFromSub(this.playerTierSub))) * 10,
                rewards: this.state.rewards,
                tierSub: accumulatedValue,//tierSub points that will be added
                playerTierSub: Math.max(0,this.playerTierSub),
                apiKey: playfabServerApiKey,
                PlayFabId
            }
            console.log("calling completeSeasonMap with ", JSON.stringify({...FunctionParameter, apiKey:undefined}));
            const {data} = await promisify(PlayFabServer.ExecuteCloudScript)({
                PlayFabId,
                FunctionName:"completeSeasonMap",
                FunctionParameter
            });
        }
        await handleChestRewards(this.state.chests, this.user.displayName);
        if(this.state.currentGame !== 3){
           await this.prepareNext(client, {user, PlayFabId});
        }else{
            const playerGameData = {
                apiKey:process.env.GOLF_API_KEY,
                address:this.user.address || this.user.userId,
                PlayFabId,
                startTime:this.state.seasonStartTime,
                endTime:Date.now(),
                time:Date.now() - this.state.seasonStartTime,
                gameMode:"season",
                subType:1,
                data:null
            }
            console.log("playerGameData times",this.state.seasonStartTime, Date.now() )
            await fetch(`${API_URL}/api/player-game`, {
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                },
                body:JSON.stringify(playerGameData)
            });
        }

        async function handleChestRewards(chests, displayName){
            let i = chests.length;
            let foundWearables = 0;
            const rewards = {FT:0, DM:0, WD:0, ST:0, IR:0, GD:0};
            while(i--){
                const chest = chests.at(i);
                if(chest.used){
                    const reward = deserializeRecipe(chest.reward);
                    if(reward.wearable){
                        foundWearables++;
                        callDiscordHook(`${displayName} found a wearable in a gift!`,"https://discord.com/api/webhooks/906781944380031006/nMF7o9M-MtiWlV510kJshIpH_Pxj-w2K7evahDhHeWMnz4TFNMc_kFOT15hgCsXFcS6O")
                    }else{
                        const VirtualCurrency = Object.keys(reward)[0];
                        rewards[VirtualCurrency] += reward[VirtualCurrency];
                    }
                }
            }

            const foundChests = chests.filter(chest => chest.used).length;
            const openChestStatisticDef = {
                StatisticName:OPEN_CHEST_STATISTIC,
                Value:foundChests
            };
            console.log("handleChestRewards updating statistics", PlayFabId, rewards);//TODO always 0?
            const rewardKeys = Object.keys(rewards).filter(key=>rewards[key]);
            console.log("handleChestRewards rewardKeys",rewardKeys);
            for(let key of rewardKeys){
                console.log("handleChestRewards giving reward", PlayFabId, key, rewards[key]);
                await promisify(PlayFabServer.AddUserVirtualCurrency)({
                    PlayFabId,
                    VirtualCurrency:key,
                    Amount:rewards[key]
                });
            }
            if(rewardKeys.length){
                await promisify(PlayFabServer.UpdatePlayerStatistics)({
                    PlayFabId,
                    Statistics: foundWearables
                        ? [{
                            StatisticName: HALLOWEEN_WEARABLE_STATISTIC,
                            Value: foundWearables
                        },
                            openChestStatisticDef
                        ]
                        : [openChestStatisticDef]
                });
                console.log("updated statistics", PlayFabId);
            }
            chests.splice(0, chests.length);
        }
    }
    private chestEvent;

    async prepareGame(client, {user, PlayFabId}){
        console.log("prepareGame");
        const handleSLEEPOrOUT = () => {
            this.recordPositionFrames = false;
            const position = this.golfPlay.getPhysicBall().body.position;
            this.recordedFrames.push({
                type: RECORDED_FRAME.IDLE,
                value: [position.x, position.y, position.z]
            });
            this.lastRecordedFrameTime = Date.now();
        }
        this.state.setGhostsData(this.ghostsData[this.state.currentGame]);

        execFn(async()=>{
            await waitFor(()=>this.state.started, 50);
            console.log("START REPRODUCING GHOSTS FRAMES !!!")
            this.intervalGhosts = setInterval(() => this.reproduceGhostsFrame(client, {PlayFabId, user}), RECORDED_FRAME_MS);
        });
        const chestEvent = this.chestEvent = await tryFetch(1,`${API_URL}/api/prisma-find-first/chest_events`, {
            method:"POST",
            body:JSON.stringify({
                "where":{
                    "startDate":{
                        "lte":new Date().toISOString()
                    },
                    "endDate":{
                        "gte":new Date().toISOString()
                    }
                }
            }),
            headers:{"Content-Type":"application/json"},
        }).then(async r=>{
            try{return await r.json()}catch(error){console.log("error",error)}
        }, ()=>undefined);
        if(chestEvent && chestEvent.inSeason){
            this.state.chestModel = chestEvent.chestModel;
            await pushChests({
                PlayFabId,
                chestEvent,
                chestCollection:this.state.chests
            });
        }

        this.golfPlay = await creatServerGolfPlay({
            gameDefinition: <GameDefinition>this.gameDefinition,
            courseDefinition: this.courseDefinition,
            timeStep: 1 / (60 * 4)
        });
        this.clock.start();
        if(this.state.currentGame === 0){

        }
        this.interval = setInterval(() => this.clockCheck({client, PlayFabId}), 300);
        this.setSimulationInterval((deltaTime) => this.update(deltaTime / 1000), 15);

        this.frameEventHandler.dispose();
        this.frameEventHandler = createEventManager();
        this.frameEventHandler.onEvent(EVENT.ANY, async ({type, data}) => {//player events
            if (this.state.finished || this.state.finishedPlayer) return;
            this.golfPlay.updateHandlers(0);
            if(!this.state.started) return;
            if(type === EVENT.CLIENT_LOG){
                client.send(MESSAGES.CLIENT_LOG, data);
            }else if(type === EVENT.OUT){
                handleSLEEPOrOUT();
            }else if (type === EVENT.SLEEP) {
                handleSLEEPOrOUT();
            }else if (type === EVENT.HOLE) {
                console.log("player HOLE");
                const time = Date.now() - this.state.startTime;
                this.state.finishedPlayer = true;
                this.recordPositionFrames = false;
                this.recordedFrames.push({type:RECORDED_FRAME.HOLE, value:undefined});
                this.golfPlay?.dispose();
                this.state.results[0].time[this.state.currentGame] = Date.now() - this.state.startTime;

                if(!this.state.countdownTime){
                    console.log("player hole");
                    this.startHoleCountdown(client, {user, PlayFabId});
                }

                const dataToSave = {
                    courseID: this.courseDefinition.ID,
                    courseAlias: this.courseDefinition.alias,
                    courseName: this.courseDefinition.displayName || this.courseDefinition.alias,
                    address: user.userId,
                    displayName: user.displayName,
                    PlayFabId,
                    frames: serializeFrames(this.recordedFrames),
                    time,
                    shots:this.state.shoots
                }
                console.log("dataToSave",{...dataToSave, frames:"[...]"});
                if(mustIgnoreRecording(this.recordedFrames)){
                    console.log("IGNORED RECORDING")
                    return;
                }

                const result = await fetch(`${API_URL}/api/recorded-game`, {
                    method:"POST",
                    headers:{"Content-Type":"application/json"},
                    body:JSON.stringify(dataToSave)
                })
            }
        });

        function mustIgnoreRecording(recordedFrames){
            return recordedFrames.find(f => f.type === RECORDED_FRAME.IDLE && (f.value[3]) > getNumberOfFrames(15000, RECORDED_FPS));
        }
    }

    async prepareNext(client, {user, PlayFabId}){
        if(this.state.currentGame === 0){
            promisify(PlayFabServer.SubtractUserVirtualCurrency)({PlayFabId:this.PlayFabId, VirtualCurrency:"EN",Amount:1});
        }
        this.state.currentGame++;
        this.state.finishedPlayer = false;
        this.state.finished = false;
        this.state.started = false;

        if(this.state.currentGame !== 4){
            this.recordedFrames.splice(0, this.recordedFrames.length);
            this.state.startTime = Number.MAX_SAFE_INTEGER;
            this.recordPositionFrames = false;
            this.lastRecordedFrameTime = 0;

            clearInterval(this.interval);
            clearInterval(this.intervalGhosts);

            await this.prepareMap({
                courseId: this.selectedCourses[this.state.currentGame].alias,
                type: "season",
                subType: "1"
            });
            this.state.setNewGame(this.courseDefinition);
            await this.prepareGame(client, {user, PlayFabId} )

        }
    }

    async onLeave(client, consented) {
        console.log("leave", this.user?.displayName);
        try {
            if (consented) {
                throw new Error('consented leave ' + this.user?.displayName);
            }
            await this.allowReconnection(client, 10);
        } catch (error) {
            if(this.state.currentGame >= 2){
                const copiedResults = cloneJSON(this.state.results);
                const sortedAccumulatedResult = [...copiedResults].sort((a,b)=>{
                    return b.score.reduce(sumAcc,0) - a.score.reduce(sumAcc,0);
                });
                const accumulatedValue = 2-sortedAccumulatedResult.findIndex(r => r.address === (this.user.userId));

                console.log(`PLAYER ${this.user.displayName} LEFT GAME WITH RESULT ${accumulatedValue}`);

                if(this.playerTierSub > 20 && accumulatedValue < 0 && !(this.state.currentGame >= 3 && (this.state.finished || this.state.finishedPlayer))){
                    console.log("SUBSTRACT tier-sub", this.user.displayName, accumulatedValue)
                    await promisify(PlayFabServer.UpdatePlayerStatistics)({PlayFabId:this.PlayFabId,Statistics:[{StatisticName:"tier-sub", Value:-1}], CustomTags:{"season-game-abandoned":"yes"}})
                }
            }

            console.log("disposing golfplay", this.user?.displayName)
            this.golfPlay?.dispose();
        }
    }

    onDispose() {
        console.log("SeasonRoom dispose");
        if (this.frameReproduction) this.frameReproduction.dispose()
        this.clock.clear();
        this.interval && clearInterval(this.interval);
        this.intervalGhosts && clearInterval(this.intervalGhosts);
        this.golfPlay && this.golfPlay.dispose();
    }
}

function serializeFrames(frames) {
    //TODO REVIEW: value maybe is always array or null/undefined.
    return frames.map(f => [f.type, ...(Array.isArray(f.value) ? f.value.map(v => Number(v.toFixed(4))) : [f.value])]);
}

function setScoresAtRound(results, currentGame, spentTime){
    const copied = (results.toJSON && results.toJSON() || JSON.parse(JSON.stringify(results)));
    //TODO if any ghost didn't make hole, remove its holeTime
    //TODO didnt make hole if time > holeTime
    copied.sort((a,b)=>{
        const timeA = a.time[currentGame];
        const timeB = b.time[currentGame];
        const shotsA = a.shots[currentGame];
        const shotsB = b.shots[currentGame];
        if(isMissingHole(a) && !isMissingHole(b)) return +1;
        if(!isMissingHole(a) && isMissingHole(b)) return -1;
        if(isMissingHole(a) && isMissingHole(b)) return 0;
        if(shotsA === shotsB) return timeA - timeB;

        return shotsA - shotsB;
    });

    copied.forEach((copiedPlayerResult, index) => {
        if(copiedPlayerResult.time[currentGame]){
            console.log("score ", copiedPlayerResult.name, NUM_PLAYERS - index);
            copiedPlayerResult.score[currentGame] = NUM_PLAYERS - index;
        }else{
            console.log("score ", copiedPlayerResult.name, 0);
            copiedPlayerResult.score[currentGame] = 0;
        }
    });

    results.forEach((playerResults)=>{
        playerResults.score[currentGame] = copied.find(p => playerResults.name === p.name).score[currentGame];
    });

    console.log("setScoresAtRound", currentGame, results.toJSON());

    function isMissingHole(playerResults){
       return !playerResults.time[currentGame] || playerResults.time[currentGame] > (spentTime+200);
    }
}

function sumAcc(acc, current){
    return acc + current;
}

function execFn(fn){
    fn();
}

export function sumDrops(source, target){
    Object.keys(source).forEach(VirtualCurrencyName => {
        target[VirtualCurrencyName] = target[VirtualCurrencyName] || 0;
        target[VirtualCurrencyName] += source[VirtualCurrencyName]
    });
    return target;
}