import { Room } from "colyseus";
import { Schema, ArraySchema, MapSchema, type } from "@colyseus/schema";
import { PlayFabServer} from "playfab-sdk";
import MESSAGE from "./mesages";
import { ClientState } from "@colyseus/core";
import {callDiscordHook} from "../../common/discord";
import {getNFTCoursesQuery} from "../../common/course-definitions/query-nft-courses";
import fetch from "cross-fetch";
import {sleep} from "../../common/utils";
let lobbyRoom = null;
import { matchMaker } from "colyseus";
import {USE_REMOTE_SERVER} from "../../common/constants";
import * as crypto from 'crypto';
import {promisify} from "util";

export const getLobbyRoom = () => lobbyRoom;
const setLobbyRoom = (room) => lobbyRoom = room;

const PASSIVE_INCOME_TIME = 1000 * 60 * 10;
const PASSIVE_INCOME_INTERVAL = 1000 * 60 * 2;
const PASSIVE_INCOME_AMOUNT = 20;

class PlayerState extends Schema {
    sessionId;

    @type("string")
    PlayFabId;

    @type("string")
    displayName;

    @type("string")
    address;

    @type("string")
    realm;

    @type("uint8")
    activeGolfclub = 1;//1 is default which won't be shown

    @type("uint16")
    tier;

    constructor({sessionId, PlayFabId, address, displayName, realm, tier}){
        super();
        this.sessionId = sessionId;
        this.PlayFabId = PlayFabId;
        this.address = address;
        this.displayName = displayName;
        this.realm = realm;
        this.activeGolfclub = 1;
        this.tier = tier;
    }
}

class DemoRoomLobby extends Schema {
    @type([ PlayerState ])
    players = new ArraySchema<PlayerState>();

    @type("string")
    roomInstanceId;

    @type("string")
    courseId;
}

class LobbyState extends Schema {
    @type(DemoRoomLobby)
    demoRoom = new DemoRoomLobby();

    @type({ map: PlayerState })
    players = new MapSchema<PlayerState>();

    @type({ map: "string" })
    PlayFabSessions = new MapSchema<string>();

    createPlayer(sessionId: string, PlayFabId:string, address:string, displayName:string, realm:string, tier:number) {
        this.players.set(sessionId, new PlayerState({sessionId, PlayFabId, address, displayName, realm, tier}));
        this.PlayFabSessions.set(PlayFabId, sessionId);
    }

    removePlayer(sessionId: string) {
        const PlayFabId = this.players.get(sessionId)?.PlayFabId;
        const playerIndex = this.demoRoom.players.findIndex((player)=>player.sessionId === sessionId);
        this.demoRoom.players.splice(playerIndex, 1);
        this.players.delete(sessionId);
        if(this.PlayFabSessions.get(PlayFabId)){
            this.PlayFabSessions.delete(PlayFabId);
        }else{
            console.log("BUG deleting PlayFabSessions", PlayFabId);
        }
    }
}

export class GameLobbyRoom extends Room<LobbyState> {
    public clientsMapBySessionId = {};
    private interval;
    private playerPassiveIncomes = {};
    onCreate({}){
        this.setState(new LobbyState());
        setLobbyRoom(this);
        this.checkPassiveIncome = this.checkPassiveIncome.bind(this);
        setInterval(()=>this.checkPassiveIncome(), PASSIVE_INCOME_INTERVAL);

        this.onMessage(MESSAGE.ACTIVE_GOLFCLUB, (client, id)=>{
            console.log("change", id)
            const player = this.state.players.get(client.sessionId)
            player.activeGolfclub = Number(id);
            console.log("player", player.toJSON());
        });

        this.onMessage(MESSAGE.LEAVE_DEMO_ROOM, (client) => {
            //TODO look for client on this.state.demoRoom and remove it
            const currentPlayer = this.state.players.get(client.sessionId);
            while(this.state.demoRoom.players.findIndex((player)=>player.address === currentPlayer.address) >= 0){
                const playerIndex = this.state.demoRoom.players.findIndex((player)=>player.address === currentPlayer.address);
                this.state.demoRoom.players.splice(playerIndex, 1);
            }
        });

        this.onMessage(MESSAGE.JOIN_DEMO_ROOM, async (client, {realm, user, PlayFabId, displayName, address}) => {
            //TODO if players.length  === 0, set roomInstanceId and courseId
            if(!this.state.demoRoom.players.length){
                this.state.demoRoom.courseId = await fetch(`${USE_REMOTE_SERVER?"https://golfcraftgame.com":"http://localhost:2569"}/api/courses`,
                    {method:"POST", body:JSON.stringify(getNFTCoursesQuery()), headers:{"Content-Type":"application/json"}})
                    .then(r=>r.json())
                    .then(d=>d.map(d=>d.alias))
                    .then(arr=>arr[Math.floor(Math.random()*arr.length)]);

                this.state.demoRoom.roomInstanceId = `Demo-${Date.now()}`;
            }
            this.state.demoRoom.players.push(new PlayerState({sessionId:client.sessionId, PlayFabId, address, displayName, realm, tier:0}))
            //TODO send to client
        });


        this.onMessage(MESSAGE.START_DEMO, async (client, data) => {
           const roomListingData = await matchMaker.createRoom("demo-room", {
               gameDefinition:{
                   type:"competition",
                   subType:"1",
                   courseId:this.state.demoRoom.courseId
               },
               roomInstanceId:this.state.demoRoom.roomInstanceId
           });
           console.log("roomListingData",roomListingData)
           this.state.demoRoom.players.forEach((player, index)=>{
                this.clientsMapBySessionId[player.sessionId].send(
                    MESSAGE.START_DEMO,
                    {roomInstanceId:this.state.demoRoom.roomInstanceId, courseId:this.state.demoRoom.courseId}
                );
           });
           while(this.state.demoRoom.players.length){
               this.state.demoRoom.players.pop();
           }
           this.state.demoRoom.roomInstanceId = null;
        });
    }

    onAuth(client, {PlayFabId, user}, request){
        console.log("onAuth", user?.displayName, PlayFabId);
        const already = this.state?.PlayFabSessions[PlayFabId];
        if(already){
            const foundClient = this.clients.find(c=>c.sessionId === already);
            console.log("foundClient",foundClient)
            foundClient?.leave();
        }
        return {"ip":request.headers['x-forwarded-for'] || request.connection.remoteAddress};
    }

    async onJoin(client, {realm ,user, PlayFabId, tier}, authData){
        const A_DAY = 1000*60*60*24;
        console.log("onJoin", user?.displayName, PlayFabId);
        //TODO get statistic last-day-connected-time

        this.clientsMapBySessionId[client.sessionId] = client;
        this.playerPassiveIncomes[client.sessionId] = {            
            lastCheck:Date.now(),
            PlayFabId,
            client
        };
        this.state.createPlayer(client.sessionId, PlayFabId, user.publicKey, user.displayName, realm, tier);
        const salt = "nfv6nva5qmu!EKD8kbu"
        const ipHash = crypto.createHash('sha256').update(authData.ip+salt).digest('hex').substring(0, 5);
        console.log("IP Hash:", ipHash);

        if(!~realm.indexOf("127.0.0.1")){
            callDiscordHook(`${user.displayName} is at Golfcraft, realm ${realm}, hash ${ipHash}`, "https://discord.com/api/webhooks/995137329280851968/Y5SPQouSrhP9USxxWkHM4wSNqyg10aPLWmysgSH6GUMkqGYc1e5HEZA3XOM3G7KFRRKC");
        }

        const [lastDayConnectedTimeS, lastTimeEnergyBonusReceived] = await promisify(PlayFabServer.GetPlayerStatistics)({
            StatisticNames:["last-day-connected-time", "last-energy-bonus-time"],
            PlayFabId
        }).then(r=>[
            r?.data?.Statistics?.length && r.data.Statistics[0]?.Value || 0,
            r?.data?.Statistics?.length && r.data.Statistics[1]?.Value || 0
        ]);
        console.log("lastDayConnectedTimeS", lastDayConnectedTimeS);
        console.log("lastTimeEnergyBonusReceived", lastTimeEnergyBonusReceived);
        if((Date.now() - ((lastDayConnectedTimeS||0)*1000)) > A_DAY){
            promisify(PlayFabServer.UpdatePlayerStatistics)({
                Statistics:[
                    {Value:Math.ceil(Date.now()/1000), StatisticName:"last-day-connected-time"},
                    {Value:1, StatisticName:"connected-days"}
                ],
                PlayFabId
            });
        }
        if((Date.now() - ((lastTimeEnergyBonusReceived||0)*1000)) > A_DAY){
            let energyBonus = 0;
            const address = user.publicKey;
            try{
                const result = await fetch(`https://gateway-arbitrum.network.thegraph.com/api/1597c31c24fbc0bf0f8ee3ea14f2516a/subgraphs/id/Ccskr6qXCAGpb6h43rYNzQsQzmwMPgSTyPB3rwgyTYm5`, {
                    headers:{"Content-Type":"application/json"},
                    body:JSON.stringify({
                        "query":`{\n  golfclubs(where:{player:\"${address}\"}) {\n    id, golfclubid  }\n}`
                        }),
                    method:"POST"
                }).then(r => r.json(), (err) =>{ throw err });
                const idMap = result.data.golfclubs.map(g=>g.golfclubid).reduce((acc, current)=>{
                    acc[current]=true
                    return acc;
                },{});
                console.log("golfclub idMap",idMap)
                energyBonus += idMap? Object.keys(idMap).length :0;
            }catch (error){
                console.error("fetch theGraph golfclubs error",error)
            }

            if(energyBonus){
                promisify(PlayFabServer.UpdatePlayerStatistics)({
                    Statistics:[
                        {Value:Math.ceil(Date.now()/1000), StatisticName:"last-energy-bonus-time"},
                    ],
                    PlayFabId
                });
                console.log("energyBonus",energyBonus);
                promisify(PlayFabServer.AddUserVirtualCurrency)({
                    VirtualCurrency:"EN",
                    Amount:energyBonus,
                    PlayFabId
                });
                client.send("server", {message:`You have received <color=#00FFFF>${energyBonus} Energy</color>\n because <color=#ff00ff>NFT Golfclub</color> collection`, timeout:30000})
            }

        }
    }

    checkPassiveIncome(){
        const now = Date.now();
        Object.values(this.playerPassiveIncomes).forEach(({lastCheck, PlayFabId, client})=>{
            if((now - lastCheck) > PASSIVE_INCOME_TIME){
                try{
                    if(client.state !== ClientState.LEAVING){
                        client.send(MESSAGE.PASSIVE_INCOME)
                        PlayFabServer.AddUserVirtualCurrency({PlayFabId, VirtualCurrency:'GC', Amount:PASSIVE_INCOME_AMOUNT}, ()=>{});
                        this.playerPassiveIncomes[client.sessionId].lastCheck = now;
                    }
                }catch(err){
                    delete this.playerPassiveIncomes[client.sessionId];
                }
            }
        });
    }

    async onLeave(client, consented){
        try {
            if(consented){
                throw new Error('consented leave');
            }

            await this.allowReconnection(client, 30);
        } catch(error){
            delete this.playerPassiveIncomes[client.sessionId];
            delete this.clientsMapBySessionId[client.sessionId];

            this.state.removePlayer(client.sessionId);
        }
    }

    onDispose(){
        this.interval && clearInterval(this.interval);
        setLobbyRoom(null);
    }
}