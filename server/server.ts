import {TournamentRoom} from "./rooms/Tournament-Room";
import {MultiplayerDemoRoom} from "./rooms/Multiplayer-Demo-Room";

console.log("initializing server ...");
import dotenv from'dotenv';
const fetch = require("node-fetch");
import {tryFetch} from "./utils/try-fetch";
dotenv.config();
handleProcessExit();
import { initializeMaterials } from '../scene/golfplay/physics/world';
import { getLobbyRoom } from "./rooms/GameLobbyRoom";

import CANNON from "cannon";
(<any>global).CANNON = CANNON;
initializeMaterials();

import PlayFabServer from 'playfab-sdk/Scripts/PlayFab/PlayFabServer';
import PlayFabAdmin from 'playfab-sdk/Scripts/PlayFab/PlayFabAdmin';
if(!process.env.PLAYFAB_TITLE_ID){
  console.log("missing .env vars");
  process.exit(1);
}

if(!process.env.SERVER){
  console.log("missing SERVER env var");
  process.exit(1);
}

PlayFabServer.settings.titleId = process.env.PLAYFAB_TITLE_ID;
PlayFabServer.settings["DeveloperSecretKey"] = PlayFabServer.settings.developerSecretKey = process.env.PLAYFAB_SECRET_KEY;
PlayFabAdmin.settings.titleId = process.env.PLAYFAB_TITLE_ID;
PlayFabAdmin.settings["DeveloperSecretKey"] = PlayFabAdmin.settings.developerSecretKey = process.env.PLAYFAB_SECRET_KEY;
import express from 'express';
import cors from 'cors';

import { createServer } from 'http';
import { Server, RelayRoom } from 'colyseus';
import { monitor } from '@colyseus/monitor';
import { GameLobbyRoom } from './rooms/GameLobbyRoom';
import { TrainingRace } from './rooms/Training-Race';
import { TestRoom} from './rooms/Test-Room';
import {TrainingZone} from "./rooms/Training-Zone";
import {TrainingVoxters} from "./rooms/Training-Voxters";
import {TrainingHole} from "./rooms/Training-Hole";
import {CompetitionGroupRoom} from "./rooms/Competition-Group";
import MESSAGE from "./rooms/mesages";
import basicAuth = require("express-basic-auth");
import { json } from 'body-parser';
import { promisify } from 'util';
import {ValidateRoom} from "./rooms/Validate-Room";
import {PingRoom} from "./rooms/Ping-Room";
import {TestRoom2} from "./rooms/Test-Room2";
import {RaceEventRoom} from "./rooms/Race-Event-Room";
import {MissionRoom} from "./rooms/Mission-Room";
import {SeasonRoom} from "./rooms/Season-Room";
import {DclAwardsRoom} from "./rooms/DclAwardsRoom";
import {LiveTournamentLobbyRoom} from "./rooms/live-tournament-lobby";
import {LiveTournamentRoom} from "./rooms/live-tournament-room";

require('dotenv').config();
const port = Number(process.env.PORT || 2567) + Number(process.env.NODE_APP_INSTANCE || 0);
const app = express();
/*app.use(express.json({limit: '25mb'}));
app.use(express.urlencoded({limit: '25mb'}));*/
var whitelist = ['https://play.decentraland.org', 'https://decentraland.org', 'https://pirate-fever.estornut.vercel.app']
const corsOptions = {
  //origin: process.env.PROD ? 'https://decentraland.org':"*"
  origin:(origin, callback)=>{
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS '+origin));
    }
  }
}

if(process.env.PROD){
  //console.log = function(){}
}
if(!process.env.GOLF_API_KEY){
    throw Error("missing GOLF_API_KEY");
}
app.use(cors({
  corsOptions: process.env.PROD?corsOptions:undefined
}));

app.use(express.json());

const gameServer = new Server({
    server: createServer(app),
    pingInterval: process.env.PROD ? 1500 : 0,
});

gameServer.define('validate-room', ValidateRoom)
    .filterBy(['roomInstanceId'])
    .enableRealtimeListing();

gameServer.define('test-room', TestRoom)
.filterBy(['roomInstanceId'])
.enableRealtimeListing();

gameServer.define('test-room2', TestRoom2)
.filterBy(['courseId'])
.enableRealtimeListing();

gameServer.define('race-event-room', RaceEventRoom)
    .filterBy(['courseId'])
    .enableRealtimeListing();

gameServer.define('training-race', TrainingRace)
.filterBy(['roomInstanceId'])
.enableRealtimeListing();

gameServer.define('training-zone', TrainingZone)
.filterBy(['roomInstanceId'])
.enableRealtimeListing();

gameServer.define('training-voxters', TrainingVoxters)
.filterBy(['roomInstanceId'])
.enableRealtimeListing();

gameServer.define('training-hole', TrainingHole)
.filterBy(['roomInstanceId'])
.enableRealtimeListing();

gameServer.define('mission-room', MissionRoom)
.filterBy(['roomInstanceId'])
.enableRealtimeListing();

gameServer.define('demo-room', MultiplayerDemoRoom)
    .filterBy(['roomInstanceId'])
    .enableRealtimeListing();

gameServer.define('season-room', SeasonRoom)
    .filterBy(['roomInstanceId'])
    .enableRealtimeListing();

gameServer.define('dcl-awards-room', DclAwardsRoom)
    .enableRealtimeListing();

gameServer.define('gameLobbyRoom', GameLobbyRoom, {gameServer})
//.filterBy(['realm'])
.enableRealtimeListing();
gameServer.define("LiveTournamentLobbyRoom", LiveTournamentLobbyRoom)
    .enableRealtimeListing();

gameServer.define("live-tournament", LiveTournamentRoom).filterBy(["roomIndex","instanceId"]).enableRealtimeListing();

gameServer.define('ping', PingRoom);

gameServer.define(`competition-group`, CompetitionGroupRoom)
.filterBy(['roomInstanceId'])
.enableRealtimeListing();//TODO we filter for now userId, but at some point we could like to show them all together
gameServer.define(`tournament`, TournamentRoom)
    .filterBy(['roomInstanceId'])
    .enableRealtimeListing();//TODO we filter for now userId, but at some point we could like to show them all together
const basicAuthMiddleware = basicAuth({
    // list of users and passwords
    users: {
        "golfcraft": "juegazo",
    },
    
    // sends WWW-Authenticate header, which will prompt the user to fill
    // credentials in
    challenge: true
});
var router = express.Router();

app.use('*/ping', (req, res)=>{
  res.status(200).send("OK")
});

const GROUP_MATCHER_URL = process.env.PROD?"http://52.12.188.146/golfcraft-competition":"http://localhost:2568";

tryFetch(1, `${GROUP_MATCHER_URL}/groups`, {method:"GET"}).then(async g=>console.log("groups",await g.json()), (err)=>console.error(err))

const lastTimeUnlock = {};

const apiKey = process.env.PLAYFAB_API_KEY;

app.post(`*/unlock-all`, async (req, res) => {
  const {DisplayName, PlayFabId} = req.body;  
  console.log("unlock-all", {DisplayName, PlayFabId});
  if(lastTimeUnlock[PlayFabId] && lastTimeUnlock[PlayFabId]+500 > Date.now()){
    console.log("unlock too fast", DisplayName, PlayFabId);
    return res.status(400).send("too fast");
  }
  lastTimeUnlock[PlayFabId] = Date.now();
  try{
    const result = await promisify(PlayFabServer.ExecuteCloudScript)({
      FunctionName:'unlockAll',
      PlayFabId,
      FunctionParameter:{
        apiKey,
        DisplayName,
        PlayFabId
      }
    });
    console.log("result", result);
    const {data} = result;
    const {FunctionResult} = data;
    console.log("unlocked all", FunctionResult);
    return res.json({FunctionResult});
  }catch(err){
    console.log("error", err);
    return res.status(400).send();
  }
  
});
app.post(`*/unlockWithXp`, async (req, res) => {
  const {DisplayName, PlayFabId, ContainerItemId} = req.body;

  console.log("unlockWithXp", {DisplayName, PlayFabId, ContainerItemId});

  if(lastTimeUnlock[PlayFabId] && lastTimeUnlock[PlayFabId]+500 > Date.now()){
    console.log("unlock too fast", DisplayName, PlayFabId);
    return res.status(400).send("too fast");
  }
  lastTimeUnlock[PlayFabId] = Date.now();
  try{
    const {data} = await promisify(PlayFabServer.ExecuteCloudScript)({
      FunctionName:'unlockWithXp',
      PlayFabId,
      FunctionParameter:{
        apiKey,
        DisplayName,
        PlayFabId,
        ContainerItemId
      }
    });
    console.log("data",data);
    const {FunctionResult} = data;
    return res.json({FunctionResult});
  }catch(err){
    console.log("error" ,err);
    return res.status(400).send();
  }
});

app.use("*/request-competition-group-room", async (req, res) => {
    try{
        const {userId, displayName, PlayFabId, competition_points} = req.body;
        console.log("request-competition-group-room", {userId, displayName, PlayFabId, competition_points});
        const {data} =  await promisify(PlayFabServer.GetUserInventory)({
            PlayFabId
        });
        //console.log("useInventory", data);

        if(data.Inventory.filter(i=>i.ItemClass === "Chest").length >= 10){
            return res.status(400).json({error:"Too many chests"});
        }

        try{
            const result = await fetch(`${GROUP_MATCHER_URL}/request-competition-group-room`, {
                method:"POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify({
                    userId, displayName, PlayFabId,
                    competition_points,
                    server:process.env.SERVER
                })
            }).then(r=>r.json());

            return res.send(result);
        }catch(err){
            console.log("RES ERROR", err, req.body.userId);
            return res.status(400).send({error:err||null});
        }
    }catch(error){
        return res.status(500).send({error})
    }

});



app.post("*/notify-group-update", async (req, res)=>{ //TODO group_matcher_server must call this endpoint when someone finishes
  const {groupId, players} = req.body;
  const lobbyRoom = getLobbyRoom();
  if(lobbyRoom){
    if(!players.forEach){
      console.log("players wrong value", players);
    }
    players.forEach(player => {
      if(player.server === process.env.SERVER){
        const winnerLobbyClient = player && lobbyRoom.clientsMapBySessionId[player.lobbySessionId];
        winnerLobbyClient && winnerLobbyClient.send(MESSAGE.UPDATE_COMPETITION_GROUP);
      }
    })
  }
});

app.post("*/notify-group-finish", async (req, res)=>{
  const {groupId, players} = req.body;
  const lobbyRoom = getLobbyRoom();

  if(lobbyRoom){
    if(!players.forEach){
      console.log("winners wrong value", players);
    }
    players.forEach(winner => {
      const winnerLobbyClient = winner && lobbyRoom.clientsMapBySessionId[winner.lobbySessionId];
      winnerLobbyClient && winnerLobbyClient.send(MESSAGE.UPDATE_COMPETITION_GROUP_REWARDS);
    })
  }
})

app.get('*/competition-group-list', async (req, res)=>{
  const userId = req.query.userId;
  const lobbySessionId = req.query.lobbySessionId;
  let url  =`${GROUP_MATCHER_URL}/competition-group-list?userId=${userId}`;
  if(lobbySessionId){
    url += `&lobbySessionId=${lobbySessionId}`;
  }
  return res.json( await tryFetch(3, url, undefined).then(r=>r.json(), (error)=>({error})));
});

app.use('*/monitor', basicAuthMiddleware, monitor());
/**app.post('*\/login', (req, res) => {//TODO not used for now
  console.log("req",req);
  try{
    const {signature, address, msgParams} = req.body;
    const recovered = recoverTypedSignature_v4({
      data:JSON.parse(msgParams),
      sig:signature
    });
    if(recovered.toLowerCase() === address.toLowerCase()){
      //res.sendStatus(200);
      PlayFabServer.LoginWithServerCustomId(<any>{
        CreateAccount:true,
        CustomId:address,
        InfoRequestParameters:{
          GetUserReadOnlyData:true,
          GetUserInventory:true,
          GetUserVirtualCurrency:true,
          GetPlayerStatistics:true
        },
        "X-SecretKey":process.env.PLAYFAB_SECRET_KEY,
        TitleId:"BEAFE"
      },(error, result)=>{
        console.log("pf Login res", error, result);
        if(!error){
          if(result.data.NewlyCreated){

          }
          res.status(200).send(result.data);
        }else{
          res.status(403).send(error);
        }
        
      });
    }else{
      throw new Error("wrong signature");
    }

  }catch(err){
    console.log(err);
    res.sendStatus(403);
  }
});*/
gameServer.listen(port);
console.log("listening...");

function handleProcessExit(){
  process.on('SIGTERM', async (signal) => {        
      await callDiscordHook(`Process ${process.pid} received a SIGTERM signal`);
      process.exit(0);
    })
    
    process.on('SIGINT', async (signal) => {
      await callDiscordHook(`Process ${process.pid} has been interrupted`);
      process.exit(0);
    })
  process.on('uncaughtException', async (err) => {
      await callDiscordHook(`Uncaught Exception: ${err.message}`);
      process.exit(1);
  });
  process.on('unhandledRejection', async (reason, promise) => {
      await callDiscordHook(`unhandlerdRejection: ${reason} ${promise}`);
     // process.exit(1)
  });

  async function callDiscordHook(str:string){
    console.log(str);
    return;//TODO
    var body = {
            username:"bot",
            content: `WS SERVER: ${str}`
        };
  
    var url = "https://discord.com/api/webhooks/890767344530522152/sETzraO8m9alF6ntg8aM6ElOSmybRdc9oVBl6EQ-_IYoneJZ3lv1OtIH8T9C_ddCs4Ds";
  
    return await fetch(url,
        {
            method:"POST",
            body:JSON.stringify(body),
            headers:{'Content-Type':"application/json"}
        })
  }
}
