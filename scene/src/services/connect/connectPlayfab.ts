import Colyseus = require('colyseus.js');
import PF from "../../../../lib/playfab/_playfab";
const {ExecuteCloudScript, LoginWithCustomID, UpdateUserData, UpdateUserTitleDisplayName} = PF;
import * as EthereumController from "@decentraland/EthereumController"
import {createLoginUX} from "./connectDialog";

import { globalStore } from '../globalStore/globalStore';
let lobbyRoom:Colyseus.Room;
import { getProvider } from "@decentraland/web3-provider";
import { getUserAccount } from "@decentraland/EthereumController"
import {getTierFromSub, sleep} from '../../../../common/utils';
import {signedFetch} from "@decentraland/SignedFetch";
import {hideMessage, showMessage} from "../../components/server-notification";
import {getServerWsURL, selectServer} from "./server-selection";
import {USE_REMOTE_SERVER} from "../../../../common/constants";
const BASE_PARCEL = [47,-45];

function inRangeParcels(parcel){
    const [x,y] = parcel;
    return Math.abs(x-BASE_PARCEL[0]) < 10 && Math.abs(y-BASE_PARCEL[1]) < 10;
}

const productiveServers = {
    hephaestus:"https://peer-ec1.decentraland.org", // DCL - US East 1
    hela:"https://peer-ec2.decentraland.org", // DCL - US East 2
    heimdallr:"https://peer-wc1.decentraland.org", // DCL - US West
    baldr:"https://peer-eu1.decentraland.org", // DCL - EU
    artemis:"https://peer-ap1.decentraland.org", // DCL - AP1
    loki:"https://interconnected.online", // Esteban
    dg:"https://peer.decentral.io", // Baus
    odin:"https://peer.melonwave.com", // Ari
    unicorn:"https://peer.kyllian.me", // Kyllian
    marvel:"https://peer.uadevops.com", // SFox
    athena:"https://peer.dclnodes.io", // DSM
}


async function xLoginWithCustomID (loginUX, {CreateAccount, CustomId, TitleId, user, realm, serverUrl}) {
   if(!user.hasConnectedWeb3){//TODO
    if(~realm.indexOf("localhost")){        
        return  {...(await loginAndInitialize(TitleId, user)), error:null};
    }else{
        loginUX.show();
        loginUX.updateText("GolfCraft game requires metamask extension")
        return {error:"NO_WEB3_CONNECTED"};
    }
   } 

   if(user.hasConnectedWeb3 ){
    loginUX.hide();
    const getLoginCustomId = () => {
        return new Promise(async (resolve, reject)=>{
            const data = await signedFetch(`${USE_REMOTE_SERVER?"https://golfcraftgame.com":"http://localhost:2569"}/api/get-login-id`, {
                method:"POST",
                headers:{"Content-Type":"application/json"}
            }).then(r=>JSON.parse(r.text));

            const {CustomId} = data;
            if(CustomId){
                resolve({CustomId});
                loginUX.hide();
                return;
            }

            loginUX.updateText("You need to sign in with Metamask\nto connect to Golfcraft");
            loginUX.showButton();
            loginUX.setActionCallback(async () => {
                try{
                    loginUX.updateText("Signing on metamask ...");
                    loginUX.hideButton();
                    const resultSign:any = await signGolfcraftLogin(user.publicKey);
                    
                    resolve({msgParams:resultSign.msgParams, CustomId:resultSign.signature});

                }catch(error){
                    loginUX.updateText("You need to sign in with Metamask\nto connect to Golfcraft");
                    loginUX.showButton();
                }
            });
        });
    }

    const {msgParams, CustomId} = await getLoginCustomId();
    //msgParams = {}
    const loginResult = await loginAndInitialize(TitleId, user, msgParams, CustomId);
    if(!loginResult?.InfoResultPayload?.UserData?.address?.Value){
        await UpdateUserData({
            Data:{address:user.publicKey}
        });
    }
    
    return loginResult;
   }else{
       console.log("use has not web3");
   }

   async function loginAndInitialize(TitleId, user, msgParams?, customId?){
    let loginResult;

    try{
        loginResult = await LoginWithCustomID({
            InfoRequestParameters:{
                GetUserReadOnlyData:true,
                GetUserInventory:true,
                GetUserVirtualCurrency:true,
                GetPlayerStatistics:true,
                GetCharacterInventories:false,
                GetCharacterList:false,
                GetPlayerProfile:false,
                GetTitleData:true,
                GetUserAccountInfo:true,
                GetUserData:true
            }, 
            CreateAccount, 
            CustomId:customId || "testUser1",
            TitleId
        });

    }catch(error){
        console.log("Login error",error);
        return {error:"LOGIN_ERROR"};
    }

    const {UserInventory, UserVirtualCurrency, UserReadOnlyData, PlayerStatistics, TitleData} = ((loginResult.NewlyCreated || !loginResult.InfoResultPayload?.UserReadOnlyData?.initialized?.Value)
        ? (await initializePlayer(user))
        : loginResult.InfoResultPayload);

    return {
        TitleData,
        UserReadOnlyData:destructureDataValues(UserReadOnlyData),
        UserInventory,
        UserVirtualCurrency,
        PlayFabId:loginResult.PlayFabId,
        PlayerStatistics:destructureStatisticsValues(PlayerStatistics),
        error:null
    };

    async function initializePlayer(user){
        const {FunctionResult} = await ExecuteCloudScript({
            FunctionName:'initializePlayer',//TODO impersonation is possible here
            FunctionParameter:{
                user:{
                    publicKey:user.publicKey
                },
        /*         signature,
                message */
            }
        });        
        
        return FunctionResult;
    }
   }
};

export const destructureDataValues = (collection) => {
    return Object.keys(collection).reduce((acc, key)=>{
        acc[key] = collection[key].Value?.toString();
        return acc;
    },{})
    
}

export const destructureStatisticsValues = (statisticsResult) => {
    return statisticsResult.reduce((acc, current) => {        
        acc[`statistic_${current.StatisticName}`] = Math.max(current.Value,0);
        return acc;
    },{});
}

async function initializeWearablesBonus(){
    const {FunctionResult} = await ExecuteCloudScript({
        FunctionName:"checkWearables"
    });
    return FunctionResult;
}
async function connectPlayer(parent, {user, pfTitleId, realm, serverUrl, client}, triggerEvent){
    const loginUX = createLoginUX(parent);
    const callbacks = {
        onReconnect:null
    };
    await sleep(1000);
    console.log("initializing login", user, realm);
    const config = await fetch("https://golfcraftgame.com/api/config").then(r=>r.json());
    console.log("admin_config",config)
    const playFabLoginResult = await xLoginWithCustomID(loginUX, {
        CreateAccount:true,
        CustomId:user.userId,
        TitleId:pfTitleId,
        user,
        serverUrl,
        realm
    });
   const wearablesBonus = initializeWearablesBonus();
   const affiliateCode = await getAffiliateCode(playFabLoginResult.PlayFabId);
    if(playFabLoginResult.error) return {error:"LOGIN_ERROR"};
    UpdateUserTitleDisplayName({
        DisplayName:user.displayName
    })

    triggerEvent({
        type:"PLAYFAB_LOGIN",
        data: {...playFabLoginResult, wearablesBonus, affiliateCode, config}
    });    
    
    try{
        console.log("playFabLoginResult.PlayerStatistics",playFabLoginResult.PlayerStatistics)
        lobbyRoom = await client.joinOrCreate("gameLobbyRoom", {realm, user, PlayFabId:playFabLoginResult.PlayFabId, gameId:1, tier:getTierFromSub(playFabLoginResult.PlayerStatistics["statistic_tier-sub"])});

        const sessionId = lobbyRoom.sessionId;
        const roomId = lobbyRoom.id;
        triggerEvent({
            type:"COLYSEUS_JOINED_ROOM",
            data:"gameLobbyRoom"
        });
        loginUX.hide();

        lobbyRoom.onLeave(async (code) => {
            console.log("connection left lobbyRoom")
            globalStore.game.getState().connected = false;
            globalStore.game.getState().reconnecting = true;
            if(code < 4000){
                while(!globalStore.game.getState().connected){
                    try {
                        lobbyRoom = await client.reconnect(roomId, sessionId);
                        globalStore.game.getState().connected = true;
                        globalStore.game.getState().reconnecting = false;
                        
                        callbacks.onReconnect && callbacks.onReconnect({
                            lobbyRoom
                        });
                      } catch (e) {  
                        console.error("reconnect error", e);
                        await sleep(1000);
                      }
                }
            }
        });
        hideMessage();
        return {
            config,
            lobbyRoom,
            playFabLoginResult,
            wearablesBonus,
            affiliateCode,
            colyseus:client,
            onReconnect:(fn)=>{
                callbacks.onReconnect = fn;
                return ()=>callbacks.onReconnect = null;
            }
        };
    }catch(error){
        return {error};
    }

    async function getAffiliateCode(PlayFabId){
        console.log("getAffiliateCode...")
        try{
            const {affiliateID} = await fetch(`https://golfcraftgame.com/api/prisma-find-first/affiliate_player`, {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({
                    where:{
                        PlayFabId
                    }
                })
            }).then(r=>r.json());
            const affiliate = await fetch(`https://golfcraftgame.com/api/prisma-find-first/affiliates`,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({
                    where:{
                        ID:affiliateID
                    }
                })
            }).then(r=>r.json())
            console.log("affiliate result", affiliate);
            return affiliate?.code;
        }catch(error){
            console.log("affiliateCode error", error);
            return;
        }

    }
   
}

export {
    connectPlayer
}

async function signGolfcraftLogin(address:string){
    const provider = await getProvider();
    return new Promise(async (resolve, reject)=>{
      try {
        const msg = {
          Game:"Golfcraft",
          Address:await getUserAccount(),
          Action:"Login"
        };
        const params = JSON.stringify({
          domain:{
            chainId:1,
            name:"Golfcraft",
            version:"1"
          },
          message:msg,
          primaryType:"Game",
          types:{
            Game:[{name:"Game",type:"string"}],
            Address:[{name:"Address",type:"address"}],
            Action:[{name:"Action", type:"string"}]
          }
        })
          provider.sendAsync(
           {
            jsonrpc: '2.0',
            id: 1,
            method: "eth_signTypedData_v4",
            params: [
              address,
              params
            ],
            from:address
           }, (error:any, response:any)=>{   
             if(error){
               reject(error)
             } else {
              resolve({signature:response.result, msgParams:params});
             } 
           }
          );
      }catch(err){
        reject(err);
      }
      
    })
  }

  /* async function LoginWithCustomID({address, msgParams, signature, serverUrl}){
    console.log("fetching login", serverUrl);  
    const res =  await fetch(
        ~serverUrl.indexOf("localhost")?"http://localhost:2567/login":`https://${serverUrl}/login`,
        {
            method:"POST",
            headers: { "Content-Type": "application/json" },
            body:JSON.stringify({
                signature,
                address,
                msgParams
            })
        }
    ).then(r=>r.json());
    console.log("SYNTHETIC LOGIN RESULT", res);

    return res;
  } */
/* import Dexie from 'dexie';
declare const console;
Dexie.dependencies.indexedDB = indexedDB;
const db = new Dexie('golfcraft');
db.version(1).stores({
    sign: 'address, signature'
}); 
const last = await db.sign.toCollection().last();
console.log("last", last); 
if(last){
    db.close();
   
}else{
    await db.sign.add({
        address,
        signature:CustomId
    });
    db.close();
} */