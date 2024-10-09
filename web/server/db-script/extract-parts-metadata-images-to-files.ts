import * as fs from "fs";
import path from "path";
import { converBase64ToImage } from 'convert-base64-to-image'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const targetDir = path.resolve(__dirname, "..", "..","metadata","public","parts","64");

console.log(targetDir);
(async ()=>{
    const parts = await prisma.parts.findMany();
    console.log("parts",parts.length);
    for(let part of parts){
        const {thumbnail64} = part;
        if(thumbnail64){
            const pathToSaveImage = `${targetDir}/${part.alias}.png`;
            const base64 = `data:image/png;base64,${thumbnail64}`;
            converBase64ToImage(base64, pathToSaveImage);
            console.log(pathToSaveImage);
        }
    }
})();


