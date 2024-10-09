handleProcessExit();
const fs = require("fs");
const Web3 = require("web3");
const fetch = require('node-fetch');
var PlayFab = require("playfab-sdk");
const manaAbi = require('./abi/mana');
const addresses = {
    mana: "0x0f5d2fb29fb7d3cfee444a200298f468908cc942",//mainnet
   // mana: "0x2a8fd99c19271f4f04b1b7b9c4f7cf264b626edb",//ropsten
    receiver: "0xe8643b09cf5a016aa2f1c2e9371dceadd362bb00"
};
const playfabSecret = fs.readFileSync(".playfab-secret").toString().trim();
const provider = new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws/v3/bd92bcabef804f2aa818843953f04c3f", {
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
//provider.on('connect', () => callDiscordHook('connected web3 provider'));
provider.on('error', (err) => callDiscordHook('error web3 provider'+ err));
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

mana.events.Transfer({
    filter:{
        to:addresses.receiver
    }
}, (error, result)=>{
    if(error){
        callDiscordHook(`Error on mana payment service ${error && error.message || error}`);
        return;
    }

    const transactionHash = result.transactionHash;
    const from =  result.returnValues.from;
    const manaAmount = result.returnValues.value/Math.pow(10,18);
    callDiscordHook(`Processing tx ${result.transactionHash}, mana amount: ${manaAmount}`);
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
    }, (error, result)=>{
        if(error){
            callDiscordHook(`tx from unknown address` + JSON.stringify({transactionHash, address:from.toLowerCase()}));
            return;
        }
        const PlayFabId = result.data.Data[0].PlayFabId;
        if(!PlayFabId){
            console.log("NO PLAYFABID FORM GENERIC ID address: ", from)
            callDiscordHook(`no matching address for tx ` + transactionHash);
        }else{
            if(!shop[manaAmount]){
                callDiscordHook(`no matching mana amount for tx `+ transactionHash);
            }
            const {GC, Gems, FT} = shop[manaAmount];
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
            })

            callDiscordHook(`tx processed ${transactionHash} for user ${PlayFabId} with address ${from.toLowerCase()}`);
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
        await callDiscordHook(`Uncaught Exception: ${err.message}`);
        process.exit(1);
    });
    process.on('unhandledRejection', async (reason, promise) => {
        await callDiscordHook('Unhandled rejection at ', promise, `reason: ${err.message}`);
        process.exit(1)
    });
}

function callDiscordHook(str){
    console.log(str);

    var body = {
            username:"bot",
            content: `Coinshop service: ${str}`
        };

    var url = "https://discord.com/api/webhooks/890767344530522152/sETzraO8m9alF6ntg8aM6ElOSmybRdc9oVBl6EQ-_IYoneJZ3lv1OtIH8T9C_ddCs4Ds";

    return fetch(url,
        {
            method:"POST",
            body:JSON.stringify(body),
            headers:{'Content-Type':"application/json"}
        })
}