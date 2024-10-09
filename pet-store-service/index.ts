require("dotenv").config();
handleProcessExit();
import express from 'express'
import cors from 'cors'
import { runChecks } from './security/securityChecks'
var bodyParser = require('body-parser');
import PlayFabServer from 'playfab-sdk/Scripts/PlayFab/PlayFabServer';
import catalog from "./catalog.json";
import {promisify} from "util";
//import abi_wearable from "./abi/wearables1.json";
import abi_storage from "./abi/storage.json";
import abi_erc721 from "./abi/erc721.json";
import fs = require("fs");
import weightedRandom from "./weightedRandom";
const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const PUBLIC_VOXTER_DISCORD_CHANNEL_URL = "https://discordapp.com/api/webhooks/926524944765050900/I3qcONrVKEhp5JTRochU098E91An1s9oH7H-qkl2r-nKfVQKH8KHnkRn-0lg6aYsJdCa";
const MAX_GAS_PRICE = 1000;

if(!process.env.PLAYFAB_TITLE_ID){
    console.log("missing .env vars");
    process.exit(1);
}

const provider = new Web3.providers.WebsocketProvider(process.env.WEB3_WS_PROVIDER || "wss://ws-nd-387-013-487.p2pify.com/c1e5307bf4fc046e608bfca833a73c6a", {
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
const localKeyProvider = new HDWalletProvider({
    privateKeys: [process.env.PRIVATE_KEY],
    providerOrUrl: provider,
});

const web3 = new Web3(localKeyProvider);
const publicKey = "0xD5305B38E8F98A589184eF452af996837201Ce0b";
const account = web3.eth.accounts.privateKeyToAccount( process.env.PRIVATE_KEY)

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
// Set a new Bot
const SURPRISE_DISCORD_CHANNEL_URL = "https://discord.com/api/webhooks/923646071215894568/uYa8KymXenAfTpNiO7GkY9wqoRjtEDedbOPnWSdd1A7dkfMQoJrh68Nq23l118hrj9nc"
if(!fs.existsSync(`stock-sales.json`)){
    fs.writeFileSync(`stock-sales.json`, JSON.stringify({}));
}
console.log("sales", JSON.parse(fs.readFileSync(`stock-sales.json`, "utf8")));
let stockSales = JSON.parse(fs.readFileSync(`stock-sales.json`, 'utf8'));

app.get(`*\/pets-catalog`, async (req, res) => {
    res.json(catalog);
    return;
});
const lastTimeUnlock = {};
app.post('*\/buy-pet-pt', async (req, res) => {
    const {crateId, PlayFabId, address, user} = req.body;
    const catalogItem = catalog[crateId];
    const authchain0 = await JSON.parse(req.header(`x-identity-auth-chain-0`));
    if(authchain0.payload.toLowerCase() !== address.toLowerCase()){
     return res.status(500).json({error:"Error x"});
    }

    if(lastTimeUnlock[PlayFabId] && lastTimeUnlock[PlayFabId]+2000 > Date.now()){
      console.log("don't spam please", PlayFabId, address);
      return res.status(500).json({error:"don't spam please"});
    }

    callDiscordHook(`\n.\n.\nAddress: ${address} opening crate!`);

    if (!(await runChecks(req, VALID_PARCELS))) {
        callDiscordHook(`PT: Failed validation! ${address} ${authchain0?.payload?.toLowerCase()} ${PlayFabId}`);
        console.log('rejected')
        return res
        .status(400)
        .json({ valid: false, error: "Validation error, try from another Realm" })
    }else{
        lastTimeUnlock[PlayFabId] = Date.now();
        const Data = await promisify(PlayFabServer.GetPlayFabIDsFromGenericIDs)({
            "GenericIDs": [
                {
                "ServiceName": "address",
                "UserId": address
                }
            ]
        }).then(r=>r.data.Data);

        if(Data[0].PlayFabId !== PlayFabId){
            console.error("PT: Impersonation?", Data[0].PlayFabId, PlayFabId, address, authchain0?.payload?.toLowerCase());
            return res.status(500).json({error:"Error :/"});
        }
    }

    //TODO ensure PlayFabId is bound to defined address
    let getUserInventory: any
    try {
        getUserInventory = await promisify(PlayFabServer.GetUserInventory)({PlayFabId});
    } catch(err) {
        callDiscordHook(`Error obtaining user inventory`);
        return res.status(500).json({ error: 'Error obtaining user inventory' });
    }
    const {data} = getUserInventory
    const {VirtualCurrency} = data;
    if(Number(VirtualCurrency.PT||0) < catalogItem.price.PT){
        callDiscordHook(`Not enough fashion tickets`);
        return res.status(500).send({error:"Not enough fashion tickets"});
    }

    await promisify(PlayFabServer.SubtractUserVirtualCurrency)({PlayFabId, VirtualCurrency:"PT", Amount:catalogItem.price.PT});

    let chooseWeights = []
    let chooseItems = []
    for (var n in catalogItem.subcrates) {
        chooseWeights.push(catalogItem.subcrates[n].weight);
        chooseItems.push(n);
    }
    const selection = weightedRandom(chooseItems, chooseWeights);
    console.log("selection", selection);
    const selectedCrate = catalogItem.subcrates[selection.item];
    console.log("selectedCrate", selectedCrate);

    let results = [];
    let message: string = "";

    if (selectedCrate.items.length == 0) {
        message = "The crate is empty! :(";
    } else if (selectedCrate.items.length == 1) {
        message = "Congrats, you got 1 item! :)\n";
    } else {
        message = `Congrats, you got ${selectedCrate.items.length} items! :)\n`;
    }
    for (var item_id in selectedCrate.items) {
        const prize: any = selectedCrate.items[item_id];
        const prize_info = catalogItem.items[prize.id];
        console.log("prize_info", prize_info);

        let contract: any;
        try {
            if (prize_info.type=="storage_from") {
                contract = new web3.eth.Contract(abi_storage, prize_info.storage);
                console.log("sendNFTFrom");
                const transaction = contract.methods.sendNFTFrom(prize_info.contract, prize_info.from, address);
                results.push(await onchainTransaction(transaction));

                if(prize_info.id === "voxter-pet"){
                    //metadata token : https://mana-fever.com/voxters/1
                    //const userData = await fetch(`https://peer.decentraland.org/lambdas/profile/${address}`).then(r=>r.json());
                    callDiscordHook({
                        "username":"Bot",
                        "content": null,
                        "embeds": [
                          {
                            "color": null,//TODO Apply rare, legendary , etc?
                            "author": {
                              "name": `${user.displayName} won a voxter`,
                              "url": `https://opensea.io/${address}`
                            },
                           /*  "image": {
                              "url": `https://voxters.com/thumbnail`
                            },
                            "thumbnail": {
                              "url": userData.avatars[0].avatar.snapshots.face128
                            } */
                          }
                        ]
                      }, PUBLIC_VOXTER_DISCORD_CHANNEL_URL);
                }
            } else if (prize_info.type=="storage") {
                contract = new web3.eth.Contract(abi_storage, prize_info.storage);
                const transaction = contract.methods.sendNFT(prize_info.contract, address);
                results.push(await onchainTransaction(transaction));
            } else if (prize_info.type=="wearable_issue") {
                // TODO
                //wearables = new web3.eth.Contract(abi, catalogItem.contract);
            } else if (prize_info.type=="erc721_mint") {
                contract = new web3.eth.Contract(abi_erc721, prize_info.contract);
                const transaction = contract.methods.mint(address);
                results.push(await onchainTransaction(transaction));
            } else if (prize_info.type=="offchain_currency") {
                results.push(await offchainTransaction(PlayFabId, prize_info.handle, prize.amount, false));
            } else if (prize_info.type=="offchain_item") {
                results.push(await offchainTransaction(PlayFabId, prize_info.handle, prize.amount, true));
            }
        } catch (err) {
            console.log(err.message);
            //results.push({status: 500, error: err.message});
            // TODO: Why always trigers an error?
            results.push({status: 200, msg: "In your way"});
        }
        const last_result = results[results.length-1]
        if (last_result.status === 200) {
            message += `- ${prize.amount} ${prize_info.name} (Sent)\n`;
        } else {
            message += `- ${prize.amount} ${prize_info.name} (Error: ${last_result.error})\n`;
        }

    }

    console.log("results", results);
    console.log("message", message);

    let any_success = false;
    let errors: string = "";
    for (let n=0; n < results.length; n++) {
        if (results[n].status === 200) {
            any_success = true
        } else {
            errors += `${results[n].error}, `
        }
    }

    callDiscordHook(`Message: ${message}`);

    if (any_success) {
        return res.status(200).json({ valid: true, msg: 'Ok', message: message });
    } else {
        return res.status(500).json({ valid: false, error: errors, results: results, message: message });
    }

}
)

app.listen(port, () => {
    callDiscordHook(`surprise crate service launched ${port}`);
})

type DiscordJSON = {
    content:string,
    username?:string,
    embeds?:any[],
}
function callDiscordHook(str:string|DiscordJSON, url = SURPRISE_DISCORD_CHANNEL_URL){
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

function handleProcessExit() {
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
        process.exit(1)
    });
}

async function offchainTransaction(PlayFabId: any, handle: string, amount: number, is_item: boolean) {
    if (is_item) {
        try{
            await promisify(PlayFabServer.GrantItemsToUser)({
                ItemIds:(new Array(amount)).fill(handle),
                PlayFabId
            })
        } catch (err) {
            return {status: 500, error: `Error sending Item ${amount} ${handle}`};
        }
        return {status: 200, msg: `Valid request`};
    } else {
        try{
            await promisify(PlayFabServer.AddUserVirtualCurrency)({PlayFabId, VirtualCurrency:handle, Amount:amount});
        } catch (err) {
            return {status: 500, error: `Error sending Virtual Currency ${amount} ${handle}`};
        }
        return {status: 200, msg: `Valid request`};
    }
}

async function onchainTransaction(transaction: any) {
    //TODO call issueTokens
    let useOracle = true;
    let gasWei: string;
    let gasPriorityWei:String;
    if (useOracle) {
        let gas_data: any;
        try{
            const response = await fetch('https://gpoly.blockscan.com/gasapi.ashx?apikey=key&method=gasoracle');
            gas_data = await response.json();
        }catch(err){
            return {status: 500, error: 'Error fetching gas price, try again'};
        }
        if (gas_data.status != "1") {
            return {status: 500, error: 'Error fetching gas price, try again'};
        }
        const gasSafeGasPrice = Number(gas_data.result.SafeGasPrice); // Min
        const gasProposeGasPrice = Number(gas_data.result.ProposeGasPrice); //Medium
        const gasFastGasPrice = Number(gas_data.result.FastGasPrice); // Max
        const gasBaseFee = Number(gas_data.result.BaseFee || gas_data.result.suggestBaseFee);
        if (gasProposeGasPrice > MAX_GAS_PRICE) {
            return {status: 500, error: 'Gas price too high, try later'};
        }

        if (gasFastGasPrice <= MAX_GAS_PRICE) {
            gasWei = web3.utils.toWei(gas_data.result.FastGasPrice, 'gwei');
            gasPriorityWei = web3.utils.toWei(String(Math.ceil(gasFastGasPrice - gasBaseFee)), 'gwei');
        } else {
            gasWei = web3.utils.toWei(gas_data.result.ProposeGasPrice, 'gwei');
            gasPriorityWei = web3.utils.toWei(String(Math.ceil(gasProposeGasPrice - gasBaseFee)), 'gwei');
        }
    } else {
        // This method don't uses an Oracle,
        // but we don't know how much others
        // are paying for Priority Fee
        const baseFee = (await web3.eth.getBlock("pending")).baseFeePerGas
        const priorityFee = 10 * 1000000000
        const maxFee = (2 * baseFee) + priorityFee
        gasWei = String(maxFee)
    }

    // callDiscordHook(`User buying ${address} (${PlayFabId}) ${crateId}`);
    // await promisify(PlayFabServer.SubtractUserVirtualCurrency)({PlayFabId, VirtualCurrency:"PT", Amount:catalogItem.price.PT});


    console.log("gasWei", gasWei);
    console.log("gasPriorityWei", gasPriorityWei);
    try {
        transaction.send({
            from:account.address,
            maxFeePerGas:gasWei,
            maxPriorityFeePerGas: gasPriorityWei,
            type: "0x2"
        });
    } catch(err) {
        return {status: 500, error: 'Cant send transaction'};
    }

    return sendTransaction(transaction);
}

function sendTransaction(transaction: any) {
    return transaction.on("transactionHash", (hash: any)=>{
        console.log("tx hash", hash);
        callDiscordHook(`tx ${hash}`);
        /*fs.appendFile("txs.log", `TX:${hash}:${wearableId}:${catalogItem.price.FT}:${address}:${PlayFabId}\n`, (err)=>{
            if(err){
                console.log("error writing txs.log", err);
            }
        });*/
    })
    .on("receipt", () => {

    })
    .on("confirmation", async (confirmationNumber: number, receipt: any) => {
        //console.log("confirmation", receipt.transactionHash, confirmationNumber);
        if(confirmationNumber === 2){
            callDiscordHook(`confirmation ${receipt.transactionHash} ${confirmationNumber}`);
            /*fs.appendFile("txs.log", `TX_CONFIRMED:${receipt.transactionHash}:${wearableId}:${catalogItem.price.FT}:${address}:${PlayFabId}:${confirmationNumber}\n`, (err)=>{
                if(err){
                    console.log("error writing txs.log", err);
                }
            });
            const userData = await fetch(`https://peer.decentraland.org/lambdas/profile/${address}`).then(r=>r.json());
            callDiscordHook(`User bought ${address} (${PlayFabId}) ${contract} : ${wearableId} \n tx: ${receipt.transactionHash}`)
            callDiscordHook({
                "username":"Bot",
                "content": null,
                "embeds": [
                    {
                        "color": null,//TODO Apply rare, legendary , etc?
                        "author": {
                            "name": `${user.displayName} bought ${catalog[contract].items.find(i=>i.wearableId === wearableId).name}`,
                            "url": `https://market.decentraland.org/accounts/${address}?assetType=nft&section=wearables&vendor=decentraland&page=1&sortBy=newest&onlyOnSale=false`
                        },
                        "image": {
                            "url": `https://peer.decentraland.org/lambdas/collections/contents/urn:decentraland:matic:collections-v2:${contract.toLowerCase()}:${wearableId}/thumbnail`
                        },
                        "thumbnail": {
                            "url": userData.avatars[0].avatar.snapshots.face128
                        }
                    }
                ]
            }, PUBLIC_WEARABLE_DISCORD_CHANNEL_URL);*/

            // return res.status(200).json({ valid: true, msg: 'Valid request' });
        }
    })
    .on("error", async (error: string, receipt: any) => {
        console.log("tx error", typeof error, error);
        callDiscordHook(`tx error ${receipt?.transactionHash} ${error}`);
        /*fs.appendFile("txs.log", `ERROR:${receipt?.transactionHash}:${wearableId}:${catalogItem.price.FT}:${address}:${PlayFabId}:${error}\n`, (err)=>{
            if(err){
                console.log("error writing txs.log", err);
            }
        });*/

        if (String(error).indexOf('Transaction was not mined within') > -1) {
            // return res.status(200).json({ valid: true, msg: 'Valid request' });
            return {status: 200, msg: 'Valid request'};
        }

        //TODO avoid for now: await promisify(PlayFabServer.AddUserVirtualCurrency)({PlayFabId, VirtualCurrency:"FT", Amount:catalogItem.price.FT});
        // return res.status(500).json({ error: 'Transaction error' });
        return {status: 500, error: 'Transaction error'};
    }).catch((error: any) => {
        console.log("tx error 2", error);
        return {status: 500, error: 'Transaction error'};
    });
}
