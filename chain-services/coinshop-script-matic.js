require("dotenv").config();
handleProcessExit();
const fs = require("fs");
const Web3 = require("web3");
const fetch = require('node-fetch');
var PlayFab = require("playfab-sdk");
const manaAbi = require('./abi/mana');
const { promisify } = require("util");
const {checkTransactionTrade} = require("./trade-bot");
const addresses = {
    mana: "0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4", //PoS MANA contract
    receiver: "0x5Ca6690fFC030fB09DbB49C24CDC78c1c8b59B9E"
};
//wss://ws-nd-179-440-754.p2pify.com/fdb4a0215e20659fc6510916501a1f4f
//wss://ws-nd-387-013-487.p2pify.com/c1e5307bf4fc046e608bfca833a73c6a
const LASTBLOCK_FILENAME = '.last-block';
if(!fs.existsSync(LASTBLOCK_FILENAME)){
    fs.writeFileSync(LASTBLOCK_FILENAME, "22273091", "utf8");
}
let lastBlock = Number(fs.readFileSync(LASTBLOCK_FILENAME, 'utf8'));
console.log("lastBlock",lastBlock);
const MS_HOUR = 1000 * 60 * 60;
const playerStatisticPlayFabId = "348E683C67E09F9B";
const playfabSecret = fs.readFileSync(".playfab-secret").toString().trim();
console.log("initializing provider...", process.env.WEB3_WS_PROVIDER);
const provider = new Web3.providers.WebsocketProvider(process.env.WEB3_WS_PROVIDER, {
    keepAlive:true,
    clientConfig: {
        // Useful to keep a connection alive
        keepalive: true,
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
const web3 = new Web3(provider);
console.log("listening provider ...")
//provider.on('connect', () => callDiscordHook('connected web3 provider'));
provider.on('error', (err) => {
    console.log("provider on error", err);
    callDiscordHook('error web3 provider'+ err)
});
provider.on('close', ()=>{
    callDiscordHook("web3 connection closed");
});


const mana = new web3.eth.Contract(manaAbi, addresses.mana);

PlayFab.settings.titleId = "BEAFE";
const PlayFabServer = PlayFab.PlayFabServer;
PlayFabServer.settings.DeveloperSecretKey = playfabSecret;
PlayFab.settings.DeveloperSecretKey = playfabSecret;
PlayFab.settings.developerSecretKey = playfabSecret;
PlayFab.PlayFabClient.settings.developerSecretKey = playfabSecret;

const shop = {
    40:{
        GC:500,
        Gems:5,
        FT:50
    },
    //
    2: {
        GC:50,
        Gems:1,
        FT:5,
        trainingBoost: 2
    },
    7: {
        GC:200,
        Gems:4,
        FT:30,
        trainingBoost: 8
    },
    12: {
        GC:400,
        Gems:8,
        FT:60,
        trainingBoost: 16
    },
    20: {
        GC:800,
        Gems:16,
        FT:125,
        trainingBoost: 32
    },
    35: {
        GC:1600,
        Gems:32,
        FT:250,
        trainingBoost: 64
    },
    60: {
        GC:3200,
        Gems:64,
        FT:500,
        trainingBoost: 120
    }
};

callDiscordHook("initializing service");

PlayFabServer.GetTitleData({
    "Keys": [
      "unclaimed_tokenId_address"
    ]
  }, async (error, result)=>{
      if(error){
          await callDiscordHook(`ERROR: ${error.errorMessage}`);
          return;
      }
      if(result.data.Data.unclaimed_tokenId_address){
        await callDiscordHook("successfully fetched playfab data")
      }else{
       await callDiscordHook("no data");
      }

  });

const processedTx = [];

//TODO fromBlock
mana.events.Transfer({
    fromBlock: lastBlock,
    filter:{
        to:addresses.receiver
    }
}, (error, result)=>{
    if(error){
        callDiscordHook(`Error on mana payment service ${error && error.message || error}`);
        return;
    }
    try{
        checkTransactionTrade(result, web3,callDiscordHook);
    }catch(err){ console.error(err); }

    const transactionHash = result.transactionHash;
    const blockNumber = result.blockNumber;
    const from =  result.returnValues.from;
    const manaAmount = result.returnValues.value/Math.pow(10,18);
    callDiscordHook(`Processing tx ${result.transactionHash}, mana amount: ${manaAmount} block: ${blockNumber}`);
    if(processedTx.indexOf(result.transactionHash) >= 0) {
        callDiscordHook("duplicated tx ", result.transactionHash);
        return;
    }
    processedTx.push(result.transactionHash);

    PlayFabServer.GetPlayFabIDsFromGenericIDs({
        GenericIDs:[
            {
                "ServiceName": "address",
                "UserId":from.toLowerCase()
            }
        ]
    }, async (error, result)=>{
        if(error){
            callDiscordHook(`error on GetPlayFabIDsFromGenericIDs with address ${from.toLowerCase()}: ` + error);
            return;
        }
        const PlayFabId = result.data.Data[0].PlayFabId;
        if(!PlayFabId){
            console.log("NO PLAYFABID FORM GENERIC ID address: ", from)
            callDiscordHook(`no matching address for tx ` + transactionHash);
        }else{
            if(!shop[manaAmount]){
                callDiscordHook(`no matching mana amount for tx `+ transactionHash);
                return;
            }
            
            const {GC, Gems, FT, trainingBoost} = shop[manaAmount];
            PlayFabServer.AddUserVirtualCurrency({
                Amount:GC,
                PlayFabId,
                VirtualCurrency:"GC"
            }, (error, result)=>{
                if(error) callDiscordHook("REVIEW failed to add GC");
            });
            PlayFabServer.AddUserVirtualCurrency({
                Amount:FT,
                PlayFabId,
                VirtualCurrency:"FT"
            }, (error, result)=>{
                if(error) callDiscordHook("REVIEW failed to add GC");
            });
            PlayFabServer.GrantItemsToUser({
                ItemIds:(new Array(Gems)).fill("Gem"),
                PlayFabId
            }, (error, result)=>{
                if(error) callDiscordHook("REVIEW failed to grant Gems");
            });
            const {data} = await promisify(PlayFabServer.GrantItemsToUser)({
                ItemIds:(new Array(trainingBoost)).fill("trainingBoost"),
                PlayFabId
            }).then(r=>r, ()=>{
                callDiscordHook("REVIEW failed to grant trainingBoost");
            });
            
            const {ItemGrantResults} = data||{};
            
            const grantedTrainingBoostItem = (ItemGrantResults||[]).find(i=>i.ItemId === "trainingBoost")
            if(grantedTrainingBoostItem){
                await promisify(PlayFabServer.UpdateUserInventoryItemCustomData)({
                    PlayFabId,
                    ItemInstanceId:grantedTrainingBoostItem.ItemInstanceId,
                    Data:{
                        Expiration:getNewExpirationISO(Number(trainingBoost||0))
                    }
                })
            }
            
            //TODO generate stream event
            PlayFabServer.UpdatePlayerStatistics({
                PlayFabId:playerStatisticPlayFabId,
                Statistics:[{
                    StatisticName:'coinshop',
                    Value:manaAmount
                }]
            },()=>{})
            
            lastBlock = blockNumber+1;
            await promisify(fs.writeFile)(LASTBLOCK_FILENAME, lastBlock.toString(), "utf8");
            
            PlayFabServer.GetUserAccountInfo({PlayFabId}, async (err,result)=>{
                if(err){
                    callDiscordHook(`ERROR on tx processed ${transactionHash} for user ${PlayFabId} with address ${from.toLowerCase()}, ${err}`);
                }else{
                    const {data} = result;
                    const {DisplayName} = data.UserInfo.TitleInfo;
                    callDiscordHook(`
                        [${DisplayName}](https://developer.playfab.com/en-US/c/BEAFE/players/${PlayFabId}/overview) with address [${from.toLowerCase()}](https://polygonscan.com/address/${from})
                        Paid **${manaAmount} MANA** for receiving:
                        ${JSON.stringify(shop[manaAmount])}
                        [${transactionHash}](https://polygonscan.com/tx/${transactionHash})
                    `);
                    
                }
            });

            function getNewExpirationISO(Amount){
                const baseExpirationTime = new Date().getTime();
        
                return new Date(baseExpirationTime + Amount * MS_HOUR ).toISOString();
            }
        }
    });
});

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
        console.error("uncaughtException");
        console.trace();
        await callDiscordHook(`Uncaught Exception`);
        process.exit(1);
    });
    process.on('unhandledRejection', async (reason, promise) => {
        await callDiscordHook('Unhandled rejection');
        process.exit(1)
    });
}

function callDiscordHook(str){
    console.log(str);

    var body = {
            username:"bot",
            content: `(matic-e) Coinshop service: ${str}`
        };

    var url = "https://discord.com/api/webhooks/906687084436258858/iW1VXmC2KEaWVWT6q-z5m61X4iNm1qojijol5CceqPVYtRa6mz-XgAUC10LWipN_WuO4";

    return fetch(url,
        {
            method:"POST",
            body:JSON.stringify(body),
            headers:{'Content-Type':"application/json"}
        })
}
