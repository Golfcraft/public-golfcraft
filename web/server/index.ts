import {coursesApi} from "./courses/api";
handleProcessExit();
require('dotenv').config();
import express from 'express';
import cors from 'cors';
import path from "path";
import {tournamentApi} from "./tournaments/api";
import fetch from "cross-fetch";
import {PlayFabServer} from "playfab-sdk";
import {PrismaClient} from "@prisma/client";
import {dailyMissionsApi} from "./daily-missions";
import {raffle} from "./raffle/raffle";
import {promisify} from "util";
import {deserializeRecipe, getCatFromTier, getPointsToTier, getTierFromSub} from "../../common/utils";
import {textImageApi} from "./text-image/text-image";
import {seasonsApi} from "./seasons";
import {runChecks} from "../../chain-playfab/security/securityChecks";
import * as dcl from 'decentraland-crypto-middleware';
//handleProcessExit();

const fallback = require("express-history-api-fallback");
const fs = require("fs");
console.log("FOO")
if(!process.env.PLAYFAB_TITLE_ID || !process.env.PLAYFAB_SECRET_KEY){
    console.log("missing PlayFab config");
    process.exit(1);
}
PlayFabServer.settings.titleId = process.env.PLAYFAB_TITLE_ID;
PlayFabServer.settings["DeveloperSecretKey"] = PlayFabServer.settings.developerSecretKey = process.env.PLAYFAB_SECRET_KEY;

console.log("starting ...");
callDiscordHook("Starting server ...");
const GOLF_API_KEY = process.env.GOLF_API_KEY;
const port = Number(process.env.PORT || 2569) + Number(process.env.NODE_APP_INSTANCE || 0);
const app = express();
const router = express.Router();
const prisma = new PrismaClient();
const whitelist = ['https://play.decentraland.org', 'https://decentraland.org'];
const corsOptions = {
    //origin: process.env.PROD ? 'https://play.decentraland.org':"*"
   /* origin:(origin, callback)=>{
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS '+origin));
        }
    }*/
    origin:"*"
}
var distPath = path.resolve(__dirname, "..", "client", "dist");
var staticPath = path.resolve(__dirname, "..", "client", "dist", "static");


router.use(cors({
    corsOptions: process.env.PROD?corsOptions:undefined
}));

console.log("clientRootPath",staticPath);
console.log("__dirname",__dirname);
router.use(express.json());
(async ()=>{
    coursesApi(router, app, prisma);
    tournamentApi(router, prisma);
    seasonsApi(router, prisma);

    await dailyMissionsApi(router, process.env.PROD);
    await textImageApi(router);

    let foundWearables = 0;
    let foundWearablesLastTime = 0;
console.log(".-")
    router.post("/api/set-affiliate-code", async (req, res)=>{
        //TODO check signature from effemeral address

        const {code, playerAddress, PlayFabId, displayName} = req.body;
console.log("set-affiliate-code",code, playerAddress, PlayFabId, displayName)
        const affiliate = await prisma.affiliates.findFirst({
            where:{code}
        });
        if(!affiliate) return res.status(404).send({error:"NOT FOUND"})
        const foundPlayer = await prisma.affiliate_player.findFirst({
            where:{playerAddress}
        });

        if(foundPlayer){
            return res.status(404).send({error:"ERROR: CREATOR CODE WAS ALREADY SET"})
        }else{
            await prisma.affiliate_player.create({
                data:{
                    affiliateID:affiliate.ID,
                    playerAddress,
                    PlayFabId,
                    displayName
                }
            })
        }
        return res.send({ok:true});
    });

    router.get("/api/get-affiliate-info/:affiliateID", async (req, res)=>{
        try{
            const {affiliateID} = req.params;
            const affiliatePlayers:any[] = await prisma.affiliate_player.findMany({
                where:{
                    affiliateID:Number(affiliateID),
                }
            });
            let totalPlayedGames = 0;
            let affiliatesPerRankCategory = [0,0,0,0,0,0,0,0,0,0];
            let totalDaysConnected = 0;
            let totalSeasonPoints = 0;

            for(let affiliatePlayer of (affiliatePlayers||[])){
                affiliatePlayer.playedGames = await prisma.player_game.count({
                    where:{
                        PlayFabId:affiliatePlayer.PlayFabId
                    }
                });
                [affiliatePlayer.tierSub, affiliatePlayer.daysConnected] = await promisify(PlayFabServer.GetPlayerStatistics)({PlayFabId:affiliatePlayer.PlayFabId, StatisticNames:["tier-sub-max", "connected-days"]})
                    .then(r=>[r.data?.Statistics[0]?.Value||0,r.data?.Statistics[1]?.Value||0]);
                totalDaysConnected += affiliatePlayer.daysConnected;
                totalSeasonPoints += affiliatePlayer.tierSub;
                const tierCat = getCatFromTier(getTierFromSub(affiliatePlayer.tierSub));
                affiliatesPerRankCategory[tierCat]++;
                totalPlayedGames += affiliatePlayer.playedGames;
            }



            //TODO return:
            /**
             * - total number of affiliates
             * - number of affiliates on each rank
             * - number of total played games by affiliates
             * - affiliates collection, and for each one:
             * -- played games
             * -- tier-sub-max
             * -- days connected
             */
            return res.send({
                affiliatePlayers,
                affiliatesPerRankCategory,
                totalPlayedGames,
                totalSeasonPoints,
                totalDaysConnected
            });
        }catch(error){
            console.error("error",error)
            return res.status(500).send({error});
        }
    })

    router.get("/api/generate-affiliate-report", async(req,res) => {
        console.log("generate-affiliate-report");
        try{
            const affiliateIDs = (   await prisma.affiliates.findMany({select:{ID:true}})).map(i=>i.ID);
            console.log("affiliateIDs",affiliateIDs)
            const affiliatePlayers = await prisma.affiliate_player.findMany({});
            let str = ``;
            for (let ID of affiliateIDs){
                let affiliateReward = 0;
                const affiliateInfo = await fetch("https://golfcraftgame.com/api/get-affiliate-info/"+ID, {
                    method:"GET", headers:{"Content-Type":"application/json"}
                }).then(r=>r.json());
                if(affiliatePlayers.find(p=>p.affiliateID === ID)){//if there is any player, otherwise we dont generate report

                    const affiliate = await prisma.affiliates.findFirst({where:{ID:Number(ID)}});
                    str += `\n\n\n\n REPORT FOR ${affiliate.code}\n`;
                    const {affiliatesPerRankCategory, totalPlayedGames, totalSeasonPoints, totalDaysConnected} = affiliateInfo;
                    str += `\n\n  affiliatesPerRankCategory:${affiliatesPerRankCategory} | totalPlayedGames:${totalPlayedGames} | totalSeasonPoints:${totalSeasonPoints} | totalDaysConnected:${totalDaysConnected} | totalDaysConnected:${totalDaysConnected}`
                    let affiliateReward = 0;
                    for(let player of affiliateInfo.affiliatePlayers){
                        const playerReward = calculateAffiliatePlayerReward(player);
                        str += `\n\n Players:`;
                        str += `\n    ${player.displayName} season-points:${player.tierSub} daysConnected:${player.daysConnected} playedGames:${player.playedGames} reward:${playerReward} MANA`;
                        affiliateReward += playerReward
                    }
                    str += `\naffiliate total reward: ${affiliateReward} MANA`

                }

            }
            callDiscordHook(str, "https://discord.com/api/webhooks/1160285302615719997/asyqonvPI9Jt5g--p3MxKJJuiTkzPFVp9gLHwGXZIBMYG_3JAUbb1phzk9M4H_OXswlc");

            res.send(str.replace(/\n/g, "<br>"));
        }catch(error){
            res.status(500).send(error);
        }

        function calculateAffiliatePlayerReward({playedGames, daysConnected, tierSub}){
            if(daysConnected >= 45 && tierSub >= getPointsToTier(5*7) && playedGames >= 500){
                return 45;
            }else if(daysConnected >= 40 && tierSub >= getPointsToTier(5*6) && playedGames >= 320){
                return 40;
            }else if(daysConnected >= 30 && tierSub >= getPointsToTier(5*5) && playedGames >= 180){
                return 30;
            }else if(daysConnected >= 15 && tierSub >= getPointsToTier(5*4) && playedGames >= 90){
                return 15;
            }else if(daysConnected >= 10 && tierSub >= getPointsToTier(5*3) && playedGames >= 30){
                return 10;
            }else if(daysConnected >= 5 && tierSub >= getPointsToTier(5*2) && playedGames >= 10){
                return 5
            }else{
                return 0;
            }
        }
    });

    router.get("/api/halloween-found-wearables", async (req, res)=>{
        const HALLOWEEN_WEARABLE_STATISTIC = "wearable:halloween-2022";

        if(foundWearablesLastTime + 120000 < Date.now()){
            const {data} = await promisify(PlayFabServer.GetLeaderboard)({
                StatisticName:HALLOWEEN_WEARABLE_STATISTIC,
                MaxResultsCount:100,
                StartPosition:0
            });
            const reducedLeaderboardResult = data.Leaderboard.reduce((acc, current)=>{
                acc = acc + current.StatValue;
                return acc;
            }, 0);
            foundWearables = reducedLeaderboardResult;
            foundWearablesLastTime = Date.now();
        }
        return res.send({result:foundWearables});
    });
    router.get("/api/config", async (req, res) => {
        try{
            const configRows = await prisma.config.findMany();
            return res.send(configRows.reduce((acc, {ID, key, value})=> (acc[key] = JSON.parse(value), acc),{}));
        }catch(error:any){
            console.log("/api/config/ error",error, error?.mesage);
            return res.status(500).send({error, message:error?.message});
        }

    })
    router.post("/api/report-claimed-wearable", async (req, res)=>{
        const {ID, claimed} = req.body;
        await prisma.wearables_catalog.update({
            where:{ ID },
            data:{ claimed }
        });
        return res.send();
    });

    router.get("/api/wearables-catalog", async (req, res) => {
        const collections = await prisma.wearables_collections.findMany();
        var data
        try {
            data = await prisma.wearables_catalog.findMany({
            });
        } catch(error) {
            return res.status(500).send({error})
        }
        return res.send(data.filter(i=>req.query.use2?i.disabled === 2:!i.disabled).reduce((acc, current) => {
            acc[current.contract] = acc[current.contract] || {};
            acc[current.contract].items = acc[current.contract].items || [];
            acc[current.contract].contract = current.contract;
            acc[current.contract].name = collections.find(c=>c.address === current.contract)?.name;
            acc[current.contract].items.push({
                ID: current.ID,
                name: current.name,
                relay: !!current.relay,
                id: current.itemId,
                image_url: current.image_url,
                wearableId: current.wearableId,
                price: deserializeRecipe(current.price),
                position: current.position && current.position.split(",") || [0, 0, 0],
                rotation: current.rotation && current.rotation.split(",") || [0, 0, 0],
                maxStock: current.maxStock,
                supply: current.supply,
                minPlayerLevel: current.minPlayerLevel || 0,
                maxMintsByAddress: current.maxMintsByAddress || null,
                sold: current.claimed,
                storage: current.storage,
                tierReward: current.tierReward
            });
            return acc;
        }, {}));
    });

    //TODO raffleApi(router);
    router.post("/api/raffle", async (req, res)=>{
        try {
            const {seed, prizes, tickets} = req.body;
            return res.send(raffle(seed, prizes, tickets));
        }catch(error){
            return res.status(500).send({error})
        }
    });

    router.post("/api/prisma-find-many/:table", async (req, res)=>{
        try{
            return res.send(await prisma[req.params.table].findMany(req.body));
        } catch(error){
            return res.status(500).send({error});
        }
    });
    router.post("/api/prisma-find-first/:table", async (req, res)=>{
        try{
            const result = await prisma[req.params.table].findFirst(req.body);
            return res.send(result);
        } catch(error){
            return res.status(500).send({error});
        }
    });
    router.use("*/static", express.static(staticPath));
    router.use(fallback("index.html", {root:distPath}));

    const contextPath = process.env.CONTEXT_PATH || "";
    app.use(router);
    app.listen(port, ()=>{
        console.log("listening ...",port);
    });
})();


function handleProcessExit(){
    try{
        process.on('SIGTERM', async (signal) => {
            await callDiscordHook(`Process ${process.pid} received a SIGTERM signal`);
            process.exit(0);
        })

        process.on('SIGINT', async (signal) => {
            await callDiscordHook(`Process ${process.pid} has been interrupted`);
            process.exit(0);
        })
        process.on('uncaughtException', async (err) => {
            console.trace();
            console.error(err);
            await callDiscordHook(`🔥 Uncaught Exception: ${err.message}`);

            process.exit(1);
        });
        process.on('unhandledRejection', async (reason, promise) => {
            console.trace();
            console.error(reason.toString());
            await callDiscordHook(`‼️ unhandledRejection: ${JSON.stringify(reason)} ${JSON.stringify(promise)}`);

            process.exit(1)
        });
    }catch(err){
        console.error(err);
    }
}

function callDiscordHook(str:any, url = "https://discordapp.com/api/webhooks/967226733273186314/l-kA8U8QmYwdlpKMUBnYDVqHgLDKW_n0AiqJzYk2V3BVGCLyyOri-cAYz333j6TtvhyE"){
    console.log(str);
    if(!process.env.PROD) return;
    var body = typeof str === "string"?{
        username:"Bot admin",
        content: `${str}`
    }:str;

    return fetch(url,
        {
            method:"POST",
            body:JSON.stringify(body),
            headers:{'Content-Type':"application/json"}
        })
}

function eW(fn){ //middleware wrapper with try catch error handling
    return async (req, res, next)=>{
        try{
            await fn(req, res, next);
        }catch(error){
            return res.status(500).send({error});
        }
    }
}
async function apiKeyMiddleware(req, res, next){
    const {address, itemId, PlayFabId, apiKey} = req.body;
    if(apiKey !== GOLF_API_KEY){
        return res.status(500).send({error:"wrong api key"})
    }
    next();
}
let lastTimeUnlock = {};
async function controlMiddleware(req, res, next){
    const authchain0 = await JSON.parse(req.header(`x-identity-auth-chain-0`));
    const {address, PlayFabId} = req.body;

    if (lastTimeUnlock[PlayFabId] && ((lastTimeUnlock[PlayFabId] + 5000) > Date.now())) {
        return res.status(500).send({error: "don't spam please"});
    }
    lastTimeUnlock[PlayFabId] = Date.now();

    if(authchain0.payload.toLowerCase() !== address.toLowerCase()){
        console.log("payload", authchain0.payload.toLowerCase(), address.toLowerCase());
        callDiscordHook(`IMPERSONATION  ${new Date().toLocaleString()}${address.toLowerCase()} signed:${authchain0.payload.toLowerCase()} ${PlayFabId}`)
        return res.status(500).send({error:"Error x"});
    }

    if(!await checkAddressIsPlayFabId(address, PlayFabId)){
        callDiscordHook(`IMPERSONATION ${new Date().toLocaleString()} Not match PlayFabID ${address.toLowerCase()} signed:${authchain0.payload.toLowerCase()} ${PlayFabId}`)
        return res.status(500).send({error:"Error x"});
    }

    next();
}
async function checkAddressIsPlayFabId(address, PlayFabId){
    const Data = await promisify(PlayFabServer.GetPlayFabIDsFromGenericIDs)({
        "GenericIDs": [
            {
                "ServiceName": "address",
                "UserId": address.toLowerCase()
            }
        ]
    }).then(r=>r.data.Data);

    if(Data[0].PlayFabId !== PlayFabId){
        console.error("FT: Impersonation?", Data[0].PlayFabId, PlayFabId, address,);
        return false;
    }

    return true;
}
function handleSignedFetchError(err){
    callDiscordHook(`SignedFetch error ` + err.message);
    return ({ok: false, message:err.message});
}