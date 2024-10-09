require('dotenv').config();
import express from 'express';
import cors from 'cors';
import path from "path";
import fetch from "cross-fetch";
import {PlayFabServer} from "playfab-sdk";
import { PrismaClient } from '@prisma/client';
import {PrismaClientValidationError} from '@prisma/client/runtime';
import {promisify} from "util";
import { Database, Resource } from '@adminjs/prisma';
import {getDropChance} from "../server/db-script/calculate-drop-chance";

const fs = require("fs");


const port = Number(process.env.PORT || 2569) + Number(process.env.NODE_APP_INSTANCE || 0);
const app = express();
const router = express.Router();
const prisma = new PrismaClient();

router.use(cors({
    corsOptions: {origin:true}
}));
router.use(express.json());
router.use(express.static("public"));
const contextPath = process.env.CONTEXT_PATH || "";

const materialProcessedNames = {
    WD:"Planks",
    ST:"Stone blocks",
    IR:"Iron bars",
    GD:"Gold bars",
    DM:"Diamonds",
    FT:"Fashion tickets"
};

const ladNames = [
    "Egypt",
    "Space",
    "Urban",
    "Jungle",
    "Mountain",
    "Cocobay"
]

router.get(`/land/data/:id`, async (req,res)=>{
    try {
        const {id} = req.params;
        const collectionId = getCollectionFromId(Number(id));//TODO workaround until theGraph fix
        res.send({
            image:`https://golfcraftgame.com/metadata/land/images/${collectionId}.png`,
            external_url:"https://golfcraftgame.com",
            description:"Golfcraft land where you can create your own map and receive passive rewards when others play it",
            name:`Golfcraft Land - ${ladNames[collectionId]} #${id}`,
        })
    }catch(error){
        res.status(500).send({error})
    }
});

function getCollectionFromId(id:number){
    if (id > 112) return 5;
    if (id > 99) return 4;
    if (id > 76) return 3;
    if (id > 56) return 2;
    if (id > 44) return 1;
    return 0
}

router.get(`/parts/data/:id`, async (req, res) => {
    try{
        const {id} = req.params;

        const _id = id.indexOf("000")===0?parseInt(id,16):Number(id);
        console.log("request part metadata ", id, _id);
        const materialDropsData = await fetch(`https://golfcraftgame.com/api/material-drops`).then(r=>r.json());
        const materialDrops = materialDropsData.reduce((acc:any,current:any)=>{
            acc[current.alias] = current;
            return acc;
        },{});

        const data = await prisma.parts.findUnique({where:{ID:_id}});
        //const recipe = deserializeRecipe(data.recipe);

        const drops = getPartMaterialDrops(data);
        const attributes = [
            {
                trait_type:"Theme",
                value:data.alias.split("_")[0]
            },
            ...Object.keys(drops).map(dropKey => {
                return {
                    "display_type": "boost_number",
                    trait_type:materialProcessedNames[dropKey],
                    value:Number(drops[dropKey])
                }
            })
        ];
        const metadata = {
            //image:`https://golfcraftgame.com/metadata/parts/64/${data.alias}.png`,
            image:`https://golfcraftgame.com/metadata/parts/1024/${data.alias}_1024px.png`,
            external_url:"https://golfcraftgame.com",
            name:`#${_id} ${data.alias}`,
            attributes
        }
        console.log("metadata",JSON.stringify(metadata));
        return res.send(metadata);

        function getPartMaterialDrops(data:any = {}){
            const {drop_alias, recipe} = data;
            const drop_chance = getDropChance(drop_alias, recipe);
            if(!drop_alias || !materialDrops[drop_alias]) return "??"
            const materialKeys = Object.keys(materialDrops[drop_alias])
                .filter(prop => prop!=="ID"&&prop!=="alias");

            const drop = materialDrops[drop_alias];
            const allMaterialsWeight = materialKeys.reduce((acc, key)=>{
                return acc + materialDrops[drop_alias][key];
            },0);

            return materialKeys
                .reduce((acc, materialKey) => {
                    const materialWeigth = drop[materialKey];
                    acc[materialKey] = ((materialWeigth/allMaterialsWeight*100)*(drop_chance/100)).toFixed(2);
                    return acc;
                }, {})
        }
    }catch(error){
        return res.status(500).send({error:true});
    }
});

app.use(contextPath, router);
app.listen(port, ()=>{
    console.log(`listening on port ... ${port}`)
})

