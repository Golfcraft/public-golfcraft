import fetch from "cross-fetch";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

(async ()=>{
    const courses = await fetch(`https://golfcraftgame.com/api/courses`, {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            where:{
                status:2,
                AND:[
                    {NOT:{createdBy:null}},
                    {NOT:{createdBy:"admin"}},
                    {NOT:{createdBy:"admin-editor"}},
                ]
            }
        })
    }).then(r=>r.json());
    console.log(courses.length);

    const parts = {};
    const drop_alias = {};
    const drop_alias_chances = {};
    const partsCatalog = await fetch(`https://golfcraftgame.com/api/parts`, {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            where:{
                status:2
            }
        })
    }).then(r=>r.json());
    const partsCatalogMap = partsCatalog.reduce((acc, current)=>{
        acc[current.alias] = current;
        return acc;
    },{})
    console.log("partsData",Object.keys(partsCatalogMap));
    let i = courses.length;
    while(i--){
        const course = await fetch(`https://golfcraftgame.com/api/get-course/${courses[i].ID}`).then(r=>r.json())
        const definition = JSON.parse(course.definition);
        definition.parts.forEach(partInstance => {
            parts[partInstance.subtype] = (parts[partInstance.subtype]||0) +1;
            if(partsCatalogMap[partInstance.subtype] && partsCatalogMap[partInstance.subtype].drop_alias){
                drop_alias[partsCatalogMap[partInstance.subtype].drop_alias] = (drop_alias[partsCatalogMap[partInstance.subtype].drop_alias]||0) + 1;
                drop_alias_chances[partsCatalogMap[partInstance.subtype].drop_alias] = (drop_alias_chances[partsCatalogMap[partInstance.subtype].drop_alias]||0) + (partsCatalogMap[partInstance.subtype].drop_chance||30)
            }
        });
        console.log(parts)
        console.log("drops",drop_alias);
        console.log("drops chances",drop_alias_chances);
    }
})();
