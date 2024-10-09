import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();
import indexedGolfClubs from "./indexed-data.backup.json";
import {PlayFabServer} from "playfab-sdk";
import {promisify} from "util";
import {getDiamondsByGolfClubLevel} from "../../../common/calculate-golfclub-diamonds";

if(!process.env.PLAYFAB_TITLE_ID){
    console.log("missing .env vars");
    process.exit(1);
}

PlayFabServer.settings.titleId = process.env.PLAYFAB_TITLE_ID;
PlayFabServer.settings["DeveloperSecretKey"] = PlayFabServer.settings.developerSecretKey = process.env.PLAYFAB_SECRET_KEY;

(async ()=>{
    const ignoreds = [];
    for (const tokenId of Object.keys(indexedGolfClubs)) {
       /*
       //Snippet to fix mistake: for free golfclubs, diamonds shouldn't be returned.
       const golfclub = indexedGolfClubs[tokenId];
        const PlayFabId = golfclub.player.PlayFabId;
        //console.log("-",golfclub, PlayFabId);
        if(!golfclub.item.attributes.power || !PlayFabId){
            ignoreds.push(tokenId);
            continue;
        }
        if(~["2","5","7"].indexOf(golfclub.golfClubId.toString())){
            await promisify(PlayFabServer.SubtractUserVirtualCurrency)({PlayFabId, VirtualCurrency:"DM", Amount:120});
            console.log("Fixed", tokenId, golfclub.golfclubId, PlayFabId);
        }
*/

        /*
        console.log("tokenId", tokenId)
        const golfclub = indexedGolfClubs[tokenId];
        const PlayFabId = golfclub.player.PlayFabId;
        //console.log("-",golfclub, PlayFabId);
        if(!golfclub.item.attributes.power || !PlayFabId){
            ignoreds.push(tokenId);
            continue;
        }
        const Inventory = await promisify(PlayFabServer.GetUserInventory)({PlayFabId}).then(r=>r.data.Inventory.filter(i=>i.ItemClass="GolfClub"), (error)=>{
            console.log("error",error);
            process.exit(0);
        });
        const playfabGolfclub = Inventory.find(i=>i.ItemInstanceId === golfclub.item.ItemInstanceId);
        if(!playfabGolfclub){
            ignoreds.push(tokenId);
            continue;
        }
        //console.log("processing playfabGolfclub", playfabGolfclub?.ItemInstanceId);
        //TODO assert that indexed data and playfab matches
        if(!(
            golfclub.item.attributes.power.toString() === playfabGolfclub.CustomData.attribute_power.toString()
            && golfclub.item.attributes.control.toString() === playfabGolfclub.CustomData.attribute_control.toString()
            && golfclub.item.attributes.aim.toString() === playfabGolfclub.CustomData.attribute_aim.toString()
        )){
            console.log("NOT MATCH ATTRIBUTES", tokenId);
            console.log(golfclub.item.attributes, playfabGolfclub.CustomData);
        }
        const power = Math.max(Number(golfclub.item.attributes.power), Number(playfabGolfclub.CustomData.attribute_power));
        const control = Math.max(Number(golfclub.item.attributes.control), Number(playfabGolfclub.CustomData.attribute_control));
        const aim = Math.max(Number(golfclub.item.attributes.aim), Number(playfabGolfclub.CustomData.attribute_aim));
        const level = 1 + power + control + aim;


        const {ItemInstanceId} = playfabGolfclub;
        const DM = getDiamondsByGolfClubLevel(level);

        console.log("returning diamonds",tokenId, ItemInstanceId, level, DM);

        //TODO delete the golfclub from inventory
        const result = await promisify(PlayFabServer.RevokeInventoryItem)({
            PlayFabId,
            ItemInstanceId
        });
        console.log("revoked inventory",tokenId, PlayFabId, ItemInstanceId, !!result);
        //TODO grant the diamonds to the PlayFabId
        const grantResult = await promisify(PlayFabServer.AddUserVirtualCurrency)({PlayFabId, VirtualCurrency:"DM", Amount:DM});
        console.log("given DM", tokenId, PlayFabId, ItemInstanceId, !!grantResult);*/

    }
    console.log("ignoreds", ignoreds);
})();