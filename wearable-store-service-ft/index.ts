require("dotenv").config();
handleProcessExit();
import express from 'express'
import cors from 'cors'
import { runChecks } from './security/securityChecks'
var bodyParser = require('body-parser');
import PlayFabServer from 'playfab-sdk/Scripts/PlayFab/PlayFabServer';

import {promisify} from "util";
import abi from "./abi/wearables1.json";
import abi_storage from "./abi/storage.json";
import abi_deployer from "./abi/deployer.json";
import fs = require("fs");
//import {tryFetchJSON} from "../common/utils";
import {getLevelInfo} from "../common/utils";
import {Biconomy} from "@biconomy/mexa";
let sigUtil = require("eth-sig-util");
import { Buffer } from 'buffer';

const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
//const MAX_GAS_PRICE = 1000;

if(!process.env.PLAYFAB_TITLE_ID){
  console.log("missing .env vars");
  process.exit(1);
}

let use_wss = false
let provider: any
if (use_wss) {
    provider = new Web3.providers.WebsocketProvider(process.env.WEB3_WS_PROVIDER || "wss://ws-nd-387-013-487.p2pify.com/c1e5307bf4fc046e608bfca833a73c6a", {
        keepAlive:true,
        clientConfig: {
            // Useful to keep a connection alive
            keepalive: true,//TODO REVIEW: don't keep alive, just connect each time?
            keepaliveInterval: 60000 // ms
          },
        // Enable auto reconnection
        reconnect: {
            auto: true,
            delay: 5000, // ms
            maxAttempts: 5,
            onTimeout: false
        }
    });
} else {
    provider = new Web3.providers.HttpProvider(process.env.WEB3_HTTP_PROVIDER || "https://nd-387-013-487.p2pify.com/c1e5307bf4fc046e608bfca833a73c6a");
}

// This provokes some errors to be missed by handleProcessExit
/*
provider.on('connect', () => {
    console.log("provider connected");
    provider.on('error', e => handleDisconnects(e));
    provider.on('end', e => handleDisconnects(e));
});

function handleDisconnects(error:any) {
    callDiscordHook(`🔌 Provider disconnected`);
    process.exit(1);
}
*/

const localKeyProvider = new HDWalletProvider({
  privateKeys: [process.env.PRIVATE_KEY],
  providerOrUrl: provider,
});

var biconomy_loaded = false;
var processing_transaction = false;

const biconomy = new Biconomy(localKeyProvider, {apiKey: process.env.BICONOMY_KEY, strictMode: true, debug: true});
biconomy.onEvent(biconomy.READY, () => {
    biconomy_loaded = true;
    callDiscordHook(`🅱️ Biconomy ready`);
}).onEvent(biconomy.ERROR, (error, message) => {
    console.log("error",error);
    callDiscordHook(`🟨 Error loading Biconomy: ${message}`);
});

const web3 = new Web3(biconomy);
// const publicKey = "0xD5305B38E8F98A589184eF452af996837201Ce0b";
const account = web3.eth.accounts.privateKeyToAccount( process.env.PRIVATE_KEY)

//const nonces:any = {};

const domainType = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "verifyingContract", type: "address" },
    { name: "salt", type: "bytes32" },
];

const metaTransactionType = [
    { name: "nonce", type: "uint256" },
    { name: "from", type: "address" },
    { name: "functionSignature", type: "bytes" }
];

const getSignatureParameters = signature => {
    if (!web3.utils.isHexStrict(signature)) {
        throw new Error(
            'Given value "'.concat(signature, '" is not a valid hex string.')
        );
    }
    var r = signature.slice(0, 66);
    var s = "0x".concat(signature.slice(66, 130));
    var vs = "0x".concat(signature.slice(130, 132));
    var v = web3.utils.hexToNumber(vs);
    if (![27, 28].includes(v)) v += 27;
    return {
        r: r,
        s: s,
        v: v
    };
};

PlayFabServer.settings.titleId = process.env.PLAYFAB_TITLE_ID;
PlayFabServer.settings["DeveloperSecretKey"] = PlayFabServer.settings.developerSecretKey = process.env.PLAYFAB_SECRET_KEY;

export const VALID_PARCELS: number[][] = [
  [49,-45],
  [48,-45]
];

const port = process.env.PORT || 2568;
const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser());
const PUBLIC_WEARABLE_DISCORD_CHANNEL_URL = "https://discord.com/api/webhooks/906781944380031006/nMF7o9M-MtiWlV510kJshIpH_Pxj-w2K7evahDhHeWMnz4TFNMc_kFOT15hgCsXFcS6O";
if(!fs.existsSync(`stock-sales.json`)){
  fs.writeFileSync(`stock-sales.json`, JSON.stringify({}));
}
console.log("sales", JSON.parse(fs.readFileSync(`stock-sales.json`, "utf8")));

async function changeStock(catalogItem:any) {
    catalogItem.claimed = (catalogItem.sold||0)+1;
    await fetch(`https://golfcraftgame.com/api/report-claimed-wearable`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(catalogItem)
    });
}

app.get(`*\/wearables-catalog`, async (req, res) => {
  return res.send(await fetch(`https://golfcraftgame.com/api/wearables-catalog`).then(r=>r.json()));
});
const lastTimeUnlock = {};

app.post('*\/buy-wearable-ft', async (req, res) => {
  if (!biconomy_loaded || processing_transaction) {
      callDiscordHook(`⛔️ Server not ready. Biconomy:${biconomy_loaded}, Processing:${processing_transaction}`);
      return res.status(500).json({error:"Server not ready, try again in a few seconds"});
  }
  console.log("remoteAddress", req.headers['cf-connecting-ip'] , req.headers['x-forwarded-for'] , req.headers["x-real-ip"], req.connection?.remoteAddress, req.socket?.remoteAddress);
  const {wearableId, contract, PlayFabId, address, user} = req.body;
  const authchain0 = await JSON.parse(req.header(`x-identity-auth-chain-0`));
  if(authchain0.payload.toLowerCase() !== address.toLowerCase()){
    console.log("payload", authchain0.payload.toLowerCase(), address.toLowerCase());
    return res.status(500).json({error:"Error x"});
  }

  if(lastTimeUnlock[PlayFabId] && lastTimeUnlock[PlayFabId]+2000 > Date.now()){
    console.log("don't spam please", PlayFabId, address);
    return res.status(500).json({error:"don't spam please"});
  }
  let validationCheck;
  try {
    validationCheck = await runChecks(req, VALID_PARCELS);
  }catch(err){
    console.error(err);
  }
  if (validationCheck) {
    console.log("validationCheck is ok");
    lastTimeUnlock[PlayFabId] = Date.now();
    const Data = await promisify(PlayFabServer.GetPlayFabIDsFromGenericIDs)({
      "GenericIDs": [
        {
          "ServiceName": "address",
          "UserId": address
        }
      ]
    }).then(r=>r.data.Data);
    console.log("checking impersonation", Data);

    if(Data[0].PlayFabId !== PlayFabId){
      callDiscordHook(`FT IMPERSONATION ${JSON.stringify({DataPlayFabId: Data[0].PlayFabId, PlayFabId, address, authAddress:authchain0?.payload?.toLowerCase() })}`)
      console.error("FT: Impersonation?", Data[0].PlayFabId, PlayFabId, address, authchain0?.payload?.toLowerCase());
      return res.status(500).json({error:"Error :/"});
    }

    const catalog = await fetch(`https://golfcraftgame.com/api/wearables-catalog`+(req.query.use2?`?use2=true`:"")).then(r=>r.json());
    if (catalog[contract] === undefined) {
        return res.status(500).json({error:"Contract not found"});
    }

    const catalogItem = catalog[contract].items.find(i=>i.wearableId === wearableId);
    console.log("checking stock",catalogItem.sold, catalogItem.maxStock);
      if(catalogItem.sold >= catalogItem.maxStock){
        return res.status(500).json({error:"Out of stock"});
      }

    let wearables: any;
    if (catalogItem.storage) {
        if (catalogItem.relay) {
            wearables = new web3.eth.Contract(abi_deployer, "0x1c496bB4f44839007247f994Ac925343b4521819");
        } else {
            wearables = new web3.eth.Contract(abi_storage, catalogItem.storage);
        }
    } else {
        wearables = new web3.eth.Contract(abi, contract);
    }
    //TODO ensure PlayFabId is bound to defined address
    let userInventory: any
    try {
        userInventory = await promisify(PlayFabServer.GetUserInventory)({PlayFabId});
    } catch(err) {
        callDiscordHook(`🟨 Error obtaining user inventory ${PlayFabId}`);
        return res.status(500).json({ error: 'Error obtaining user inventory' });
    }
    const {data} = userInventory
    const {VirtualCurrency} = data;
    if(Number(VirtualCurrency.FT||0) < catalogItem.price.FT){
      return res.status(500).send({error:"Not enough fashion tickets"});
    }

    var playerStatistics: any
    var userReadOnlyData: any
    if (catalogItem.minPlayerLevel || catalogItem.maxMintsByAddress) {
        playerStatistics = await promisify(PlayFabServer.GetPlayerStatistics)({PlayFabId});
        userReadOnlyData = await promisify(PlayFabServer.GetUserReadOnlyData)({PlayFabId});
        userReadOnlyData = userReadOnlyData.data
    }

    if (catalogItem.minPlayerLevel) {
        const playerXP = Number(userReadOnlyData.Data.xp.Value);
        const playerLevel = getLevelInfo(playerXP).currentLevel;
        if (playerLevel < catalogItem.minPlayerLevel) {
            return res.status(500).send({error:`You should be at level ${catalogItem.minPlayerLevel} or more`});
        }
    }

    const wearableKey = "wearable:"+catalogItem.id
    if (catalogItem.maxMintsByAddress) {
        var playerMintsForWearable = playerStatistics.data.Statistics.find(s=>s.StatisticName === wearableKey)?.Value || 0;
        if (playerMintsForWearable >= catalogItem.maxMintsByAddress) {
            return res.status(500).send({error:`You can only mint ${catalogItem.maxMintsByAddress} units of this wearable`});
        }
    }

    callDiscordHook(`👉 User buying ${address} (${PlayFabId}) ${catalogItem.id} with ${catalogItem.price.FT} FT`)
    await promisify(PlayFabServer.SubtractUserVirtualCurrency)({PlayFabId, VirtualCurrency:"FT", Amount:catalogItem.price.FT});

    if (catalogItem.maxMintsByAddress) {
        PlayFabServer.UpdatePlayerStatistics({
            PlayFabId:PlayFabId,
            Statistics:[{
                StatisticName:wearableKey,
                Value:playerMintsForWearable+1
            }]
        },()=>{});
    }

    if (catalogItem.storage) {
        // Send from storage
        if (catalogItem.from) {
            // NFTs are stored outside storage
            console.log("sendNFTFrom (not suppoerted)");
            return res.status(500).json({ error: 'Not implemented' });
        } else {
            // NFTs are in storage
            console.log("sendNFT");
            processing_transaction = true;
            //return res.status(500).json({ error: 'Not implemented' });
            let functionSignature: any
            let name: string
            let version: string
            if (catalogItem.relay) {
                // Storage without metatransactions
                // Relay through deployer
                console.log("Relay: storage ", catalogItem.storage, "wearable contract ", contract, "to ", address);
                functionSignature = wearables.methods.relaySendNFT(catalogItem.storage, contract, address).encodeABI();
                name = "Golfcraft Deployer";
                version = "3";
            } else {
                // Storage with metatransactions
                functionSignature = wearables.methods.sendNFT(contract, address).encodeABI();
                name = "Golfcraft Storage";
                version = "3";
            }
            //console.log("wearables", wearables);
            console.log("wearables.address", wearables.address);
            console.log("wearables._address", wearables._address);
            await sendMetaTransactions(functionSignature, wearables, name, version, async (error, txHash) => {
                processing_transaction = false;
                if (error) {
                    console.error(JSON.stringify(error));
                    callDiscordHook(`🟥 ${address} (${PlayFabId}) Transaction error, returning FT`);
                    await promisify(PlayFabServer.AddUserVirtualCurrency)({PlayFabId, VirtualCurrency:"FT", Amount:catalogItem.price.FT});
                    await promisify(PlayFabServer.UpdatePlayerStatistics)({PlayFabId, Statistics:[{
                            StatisticName:wearableKey,
                            Value:playerMintsForWearable
                    }]});
                    return res.status(500).json({ error: 'Transaction error' });
                }
                await changeStock(catalogItem);
                callDiscordHook(`🟩 ${address} (${PlayFabId}) Transaction hash is  ${txHash}\n${name} ${catalogItem.sold}`);
                return res.status(200).json({ valid: true, msg: 'Valid request' });
            });
        }
    } else {
        console.log("issueTokens");

        let functionSignature = wearables.methods.issueTokens([address],[wearableId]).encodeABI();
        let name = "Decentraland Collection";
        let version = "2";

        await sendMetaTransactions(functionSignature, wearables, name, version, async (error, txHash) => {
            if (error) {
                console.error(JSON.stringify(error));
                callDiscordHook(`🟥 ${address} (${PlayFabId}) Transaction error, returning FT`);
                await promisify(PlayFabServer.AddUserVirtualCurrency)({PlayFabId, VirtualCurrency:"FT", Amount:catalogItem.price.FT});
                return res.status(500).json({ error: 'Transaction error' });
            }
            changeStock(catalogItem);
            callDiscordHook(`🟩 ${address} (${PlayFabId}) Transaction hash is  ${txHash}`);
            return res.status(200).json({ valid: true, msg: 'Valid request' });
        });
    }
  } else {
    callDiscordHook(`🟨 FT: Failed validation! ${address} ${authchain0?.payload?.toLowerCase()} ${PlayFabId}`);
    console.error('rejected', req.ips, req.header(`x-identity-metadata`));
    console.error("authchain0",authchain0);
    console.error("headers", JSON.stringify(req.headers));
    console.error("remoteAddress", req.headers['cf-connecting-ip'] , req.headers['x-forwarded-for'] , req.headers["x-real-ip"], req.connection?.remoteAddress, req.socket?.remoteAddress);
    return res
      .status(400)
      .json({ valid: false, error: "Validation error, try from another Realm" })
  }

})

app.listen(port, () => {
  callDiscordHook(`🚀 wearable store service launched ${port}\n`);
})

type DiscordJSON = {
  content:string,
  username?:string,
  embeds?:any[],
}
function callDiscordHook(str:string|DiscordJSON, url = "https://discord.com/api/webhooks/890767344530522152/sETzraO8m9alF6ntg8aM6ElOSmybRdc9oVBl6EQ-_IYoneJZ3lv1OtIH8T9C_ddCs4Ds"){
  console.log(str);
  var body = typeof str === "string"?{
          username:"Bot",
          content: `${str}`
      }:str;

  return fetch(url,
      {
          method:"POST",
          body:JSON.stringify(body),
          headers:{'Content-Type':"application/json"}
      })
}

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
    console.trace();
    console.error(err);
      await callDiscordHook(`🔥 Uncaught Exception: ${err.message}`);

      process.exit(1);
  });
  process.on('unhandledRejection', async (reason, promise) => {
      console.trace();
      await callDiscordHook(`‼️ unhandlerdRejection: ${JSON.stringify(reason)} ${JSON.stringify(promise)}`);

      process.exit(1)
  });
}

async function sendMetaTransactions(functionSignature: any, wearables: any, name: string, version: string, callback: (error: any, txHash: any)=>{}) {
    let contract_address = wearables.address
    if (wearables.address === undefined) {
        contract_address = wearables._address
    }
    const nonce = parseInt(await wearables.methods.getNonce(account.address).call());

    //let functionSignature = wearables.methods.issueTokens([address],[wearableId]).encodeABI();
    let message: any = {};
    message.nonce = nonce;
    message.from = account.address;
    message.functionSignature = functionSignature;

    let chainId = 137;

    let domainData = {
        name: name,
        version: version,
        verifyingContract: contract_address,
        salt: '0x' + (chainId).toString(16).padStart(64, '0')
    };

    const dataToSign = {
        types: {
            EIP712Domain: domainType,
            MetaTransaction: metaTransactionType
        },
        domain: domainData,
        primaryType: "MetaTransaction",
        message: message
    };

    console.log("dataToSign", dataToSign);

    const signature = sigUtil.signTypedMessage(Buffer.from(process.env.PRIVATE_KEY, 'hex'), { data: dataToSign }, 'V4');
    let { r, s, v } = getSignatureParameters(signature);
    let executeMetaTransactionData = wearables.methods.executeMetaTransaction(account.address, functionSignature, r, s, v).encodeABI();
    let txParams = {
        "from": account.address,
        "to": contract_address,
        "value": "0x0",
        "gas": "500000",
        "data": executeMetaTransactionData
    };
    const signedTx = await web3.eth.accounts.signTransaction(txParams, `0x${process.env.PRIVATE_KEY}`);
    return await web3.eth.sendSignedTransaction(signedTx.rawTransaction, callback);
}