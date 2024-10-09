require("dotenv").config();
import express from 'express';
import { PlayFabServer } from 'playfab-sdk';
import { promisify } from 'util';
import fetch from "cross-fetch";
import catalog from "./catalog.json";
import cors from 'cors';
PlayFabServer.settings.titleId = process.env.PLAYFAB_TITLE_ID;
PlayFabServer.settings["DeveloperSecretKey"] = PlayFabServer.settings.developerSecretKey = process.env.PLAYFAB_SECRET_KEY;
const app = express();
app.use(express.json());
//TODO  connect to playfab to get golf club 

// TODO */contract-metadata

app.use('*/contract-metadata', (req, res)=>{
    res.status(200).send({
        "name": "Golfcraft Game golf clubs",
        "seller_fee_basis_points":100,
        "fee_recipient":"0x5Ca6690fFC030fB09DbB49C24CDC78c1c8b59B9E",
        "description": "Minigolf Play to Earn Game in Decentraland",
        "image":"https://golfcraftgame.com/static/images/logo.png",
        "external_link":"https://twitter.com/GolfcraftGame"
    });
});

app.use('*/token/:golfClubId/:tokenId', async (req, res) => {
    var tokenId = Number(req.params.tokenId);
    var golfClubId = Number(req.params.golfClubId);
    try{
        res.send(await getTokenMetadata(golfClubId, tokenId))
    }catch(error){
        res.status(500).send(error);
    }   
    
});
app.use('*/public',cors({origin:true}) , express.static("public"));
app.use('*/static', express.static('public'));
// TODO */token metadata
console.log("metadata: listening");
app.listen(process.env.PORT || "2567")

async function getTokenMetadata(golfClubId:number, tokenId:number){
    if(!catalog[golfClubId]){
        throw Error("Golf club not found")
    }

    const result = {
        "name":golfClubId === 0
            ? `${catalog[golfClubId].defaultName} #${tokenId+1}/${catalog[golfClubId].maxSupply}`
            : `${catalog[golfClubId].defaultName}`,
        "description":catalog[golfClubId].description,            
        "image":`https://golfcraftgame.com/metadata-2/static/${golfClubId}.png`,
        "animation_url":`https://golfcraftgame.com/metadata-2/static/${golfClubId}.glb`,
        "attributes":[
            {
                "trait_type":"Supply",
                "value":catalog[golfClubId].maxSupply
            },
            {
                "trait_type":"Level",
                "value":5
            },
            {
                "trait_type":"Power",
                "value":5
            },
            {
                "trait_type":"Control",
                "value":5
            },
            {
                "trait_type":"Aim",
                "value":5
            },
            {
                "trait_type":"Bonus xp/coins",
                "display_type":"boost_percentage",
                "value":catalog[golfClubId]?.bonus || 0
            }
        ]
    };

    return result;
}
