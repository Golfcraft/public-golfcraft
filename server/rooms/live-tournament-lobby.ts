import { Room, Client } from "colyseus";
import { Schema, ArraySchema, MapSchema, type } from "@colyseus/schema";
import { PlayFabServer} from "playfab-sdk";
import MESSAGE from "./mesages";
import { ClientState } from "@colyseus/core";
import {getNFTCoursesQuery} from "../../common/course-definitions/query-nft-courses";
import fetch from "cross-fetch";
import {sleep, tryFn} from "../../common/utils";
let lobbyRoom = null;
import { matchMaker } from "colyseus";
import {USE_REMOTE_SERVER} from "../../common/constants";
import * as crypto from 'crypto';
import {promisify} from "util";
import {registerLobby} from "./live-room-manager";
import {callDiscordHook} from "../../common/discord";

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

    client;

    constructor({address, realm, displayName, PlayFabId, client}) {
        super();
        this.address = address;
        this.realm = realm;
        this.displayName = displayName;
        this.PlayFabId = PlayFabId
        this.client = client;
    }
}

class LiveTournamentLobbyRoomState extends Schema {
    @type([ PlayerState ])
    players = new ArraySchema<PlayerState>();

    @type("boolean")
    playing = false

    @type("boolean")
    open = false

    @type("number")
    numberOfMaps:number;

    @type("number")
    maxDifficulty:number;

    @type("boolean")
    useOwnMaps:boolean;

    lastActivityTime:number;

    constructor(){
        super();
        this.lastActivityTime = Date.now();
    }
}

class LiveTournamentLobbyState extends Schema {
    @type([ LiveTournamentLobbyRoomState ])
    rooms = new ArraySchema<LiveTournamentLobbyRoomState>(
        new LiveTournamentLobbyRoomState(),
        new LiveTournamentLobbyRoomState(),
        new LiveTournamentLobbyRoomState(),
        new LiveTournamentLobbyRoomState()
    );
    constructor() {
        super();
    }
}

const MAX_TIME_INACTIVE = 60000;

export class LiveTournamentLobbyRoom extends Room<LiveTournamentLobbyState> {
    interval;

    onCreate(options: any): void | Promise<any> {
        this.interval = setInterval(()=>{
            tryFn(()=>{
                this.state.rooms.forEach((room,roomIndex) => {
                    if(!room.playing && Date.now() - room.lastActivityTime > MAX_TIME_INACTIVE){
                        this.resetRoom(roomIndex);
                    }
                });
            })
        },1000);
        this.resetRoom.bind(this);
        this.setState(new LiveTournamentLobbyState())
        this.onMessage(MESSAGE.CREATE_LIVE_ROOM, (client, {
            roomIndex = 0, realm, address, displayName, PlayFabId,
            numberOfMaps, useOwnMaps, maxDifficulty, courseIds})=>{
            callDiscordHook(`${displayName} is creating a Live tournament!`, "https://discord.com/api/webhooks/1009065576817229966/gufYreTUOraoUZJvf43sKi_wr15hqEQ-wnXo1lPlO91THK5q3SLFAb2t-J_1cPRXk54D")
            this.state.rooms[roomIndex].lastActivityTime = Date.now();
            this.state.rooms[roomIndex].numberOfMaps = numberOfMaps;
            this.state.rooms[roomIndex].maxDifficulty = maxDifficulty;
            this.state.rooms[roomIndex].useOwnMaps = useOwnMaps;
            //TODO check if room is playing or open or with players already, then cancel the action
            if(this.state.rooms[roomIndex].players.length === 0){
                this.state.rooms[roomIndex].players.push(new PlayerState({
                    address, realm, PlayFabId, displayName, client
                }));
                this.state.rooms[roomIndex].open = true;
            }else{
                client.send(MESSAGE.CLIENT_LOG, "Cannot create live tournament");
            }
        });

        this.onMessage(MESSAGE.HOST_ACTIVITY_PROBE, (client, {roomIndex})=>{
            console.log("HOST_ACTIVITY_PROBE",roomIndex)
            this.state.rooms[roomIndex].lastActivityTime = Date.now();
        });

        this.onMessage(MESSAGE.JOIN_LIVE_ROOM, (client, {roomIndex, realm, address, displayName, PlayFabId}) => {
            const room = this.state.rooms[roomIndex];
            if(room.open && !this.state.rooms[roomIndex].playing){
                room.players.push(new PlayerState({realm, client, address, displayName, PlayFabId}));
            }
        });

        this.onMessage(MESSAGE.LEAVE_LIVE_ROOM, (client, {roomIndex, address, PlayFabId, realm, displayName}) => {
            const room = this.state.rooms[roomIndex];
            const playerIndex = room.players.findIndex(p => p.client === client);
            if(playerIndex === 0){
                 this.resetRoom(roomIndex)
            }else if(playerIndex >= 1){
                room.players.splice(playerIndex, 1);
            }
        });

        this.onMessage(MESSAGE.START_LIVE_ROOM, (client,{roomIndex, realm, address, displayName, PlayFabId, courseIds})=>{
            console.log("START_LIVE_ROOM", {roomIndex, realm, address, displayName, PlayFabId, courseIds})
            const room = this.state.rooms[roomIndex];
            room.players.forEach(p => p.client.send(MESSAGE.START_LIVE_ROOM, {roomIndex, courseIds}));
            this.state.rooms[roomIndex].playing = true;
            this.state.rooms[roomIndex].open = false;
        });

        registerLobby(this);
    }

    resetRoom(roomIndex:number){
        const room = this.state.rooms[roomIndex];
        room.players.splice(0, room.players.length);
        room.playing = false;
        room.open = false;
    }

    onLeave(client: Client, consented?: boolean): void | Promise<any> {
        //TODO check all rooms
        this.state.rooms.forEach((room, roomIndex) => {
            const playerIndex = room.players.findIndex(p => p.client === client);
            if(playerIndex === 0 && !room.playing){
                this.resetRoom(roomIndex);
            }else if(playerIndex >= 1){

            }
        })

    }

    onJoin(client: Client, options?: any, auth?: any): void | Promise<any> {
    }

    onDispose(){
        clearInterval(this.interval)
    }
}