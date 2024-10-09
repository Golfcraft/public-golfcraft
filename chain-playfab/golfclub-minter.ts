import { PlayFabServer } from "playfab-sdk";
import catalog from "../contracts/metadata-server/catalog.json";
import {promisify} from "util";
import abi from "./abi/golfclub.json";
import fetch from "cross-fetch";
import fs = require("fs");
import { callDiscordHook } from "../common/discord";

const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const defaultProviderURL ="https://nd-387-013-487.p2pify.com/c1e5307bf4fc046e608bfca833a73c6a";//matic mainnet
const LOG_FILE_NAME = `golfclub-minter.log`;
const MAX_GAS_PRICE = 1000;
if(!fs.existsSync(LOG_FILE_NAME)){
    fs.writeFileSync(LOG_FILE_NAME, "", "utf8");
}
if(!process.env.PLAYFAB_TITLE_ID){
    console.log("missing .env vars");
    process.exit(1);
}

PlayFabServer.settings.titleId = process.env.PLAYFAB_TITLE_ID;
PlayFabServer.settings["DeveloperSecretKey"] = PlayFabServer.settings.developerSecretKey = process.env.PLAYFAB_SECRET_KEY;

export const VALID_PARCELS: number[][] = [ //TODO adapt parcels
    [49,-45],
    [48,-45]
];

const port = process.env.PORT || 2568;
const MINT_PRICE_DM = 120;
async function getCurrentFreeGolfClubId():Promise<number>{
    const {data} = await promisify(PlayFabServer.GetTitleData)({
        Keys:["currentMintGolfClubId"]
    })
    return Number(data.Data.currentMintGolfClubId);
}

export function issueGolfclub(to:string, PlayFabId:string){//TODO queue? TO FILE? because sometimes the club is marked minting, but something fails when sending the tx, and maybe even no tx was sent
    console.log("issueGolfclub", to, PlayFabId);
    const provider = new Web3.providers.HttpProvider(process.env.WEB3_HTTP_PROVIDER_URL || defaultProviderURL);
    console.log("provider", !!provider)
    const localKeyProvider = new HDWalletProvider({
        privateKeys: [process.env.PRIVATE_KEY],
        providerOrUrl: provider,
    });
    const web3 = new Web3(localKeyProvider);
    const minterAccount = web3.eth.accounts.privateKeyToAccount( process.env.PRIVATE_KEY);

    return new Promise(async (resolve, reject)=>{
        try{
            const golfClubId = await getCurrentFreeGolfClubId();
            const golfclubContract = new web3.eth.Contract(abi, process.env.CONTRACT_ADDRESS);            
            const supply = (await golfclubContract.methods.getGolfclubSupply(golfClubId).call()).toString();
            const maxSupply = (await golfclubContract.methods.getMaxSupply(golfClubId).call()).toString();
            if(Number(supply) >= Number(maxSupply)){
                return reject("There is not supply on current golf club edition");
            }
            
            const {data} = await promisify(PlayFabServer.GetUserInventory)({PlayFabId})
            const {Inventory} = data;
            const standardGolfClub = Inventory.find((i)=>i.ItemId === "golfclub-1");
            if(standardGolfClub.CustomData.minting){
                return reject("Already minting");
            }
            //TODO ensure current golfclub has enough experience
            if(getLevelFromAttributes(standardGolfClub) < 16 ){
                return reject("Not enough level");
            }
            callDiscordHook(["Reset golfclub", PlayFabId, standardGolfClub.ItemInstanceId, JSON.stringify(standardGolfClub.CustomData)].join(" "));
            await promisify(PlayFabServer.SubtractUserVirtualCurrency)({PlayFabId, VirtualCurrency:"DM", Amount:MINT_PRICE_DM});
            await promisify(PlayFabServer.UpdateUserInventoryItemCustomData)({
                PlayFabId,
                ItemInstanceId:standardGolfClub.ItemInstanceId,
                Data:{
                    "minting":"true",
                    "xp": "0",
                    "attribute_control": "0",
                    "attribute_power": "0",
                    "attribute_aim": "0"
                }
            });

            fs.appendFile(LOG_FILE_NAME,`\n${new Date().toISOString()} Minting golf club for ${PlayFabId} (${to}) on item ${standardGolfClub?.ItemInstanceId}`,"utf8",()=>{})
            const gasPrice = await getGasPrice();
            callDiscordHook(`calling golfclubContract.methods.issue with gas ${gasPrice} for Player ${PlayFabId}, with address ${to}`)
            const transaction = golfclubContract.methods.issue(to, golfClubId).send({
                from:minterAccount.address,
                gasPrice
            });
       
            transaction.on("transactionHash", (transactionHash)=>{
                callDiscordHook(`txHash received for Player ${PlayFabId}, with address ${to}, tx: ${transactionHash}`);
            });

            transaction.on("receipt", ()=>{});
            transaction.on("confirmation", async (confirmationNumber, receipt)=>{
                if(confirmationNumber == 2){
                    fs.appendFile(LOG_FILE_NAME,`\n${new Date().toISOString()} Minted golf club for ${PlayFabId} (${to}) on item ${standardGolfClub?.ItemInstanceId}`,"utf8",()=>{})
                    resolve(receipt);
                }
            });
            transaction.on("error", (err, receipt)=>{
                fs.appendFile(LOG_FILE_NAME,`\n${new Date().toISOString()} Tx Error minting golf club for ${PlayFabId} (${to}) on item ${standardGolfClub?.ItemInstanceId} tx:${receipt?.transactionHash} ${err}`,"utf8",()=>{})
                reject("Error on transaction minting new golf club");
            });
        }catch(err){
            return reject({type:"Unknown error",error:err});
        }
    });

    async function getGasPrice(){
        let gas_data: any;
        try{
            const response = await fetch('https://gpoly.blockscan.com/gasapi.ashx?apikey=key&method=gasoracle');
            gas_data = await response.json();
        }catch(err){
            throw Error('Error fetching gas price, try again');
        }
        if (gas_data.status != "1") {
            throw Error('Error fetching gas price, try again');
        }
        const gasProposeGasPrice = Number(gas_data.result.ProposeGasPrice);
        const gasSafeGasPrice = Number(gas_data.result.SafeGasPrice);
        const gasFastGasPrice = Number(gas_data.result.FastGasPrice);
        if (gasSafeGasPrice > MAX_GAS_PRICE) {
            throw Error('Gas price too high, try later');
        }
        let gasWei: string;
        if (gasFastGasPrice <= MAX_GAS_PRICE) {
            gasWei = web3.utils.toWei(gas_data.result.FastGasPrice, 'gwei');
        } else {
            gasWei = web3.utils.toWei(gas_data.result.gasSafeGasPrice, 'gwei');
        }
        return gasWei;
    }
}

//TODO use signedFetch to ensure the address(efemeral)
//TODO expose endpoint
function getLevelFromAttributes(golfClub){
    return  1 + Number(golfClub.CustomData?.attribute_power || 0) +
            Number(golfClub.CustomData?.attribute_control || 0) +
            Number(golfClub.CustomData?.attribute_aim || 0);
}