import fetch from "cross-fetch";
import { PrismaClient } from '@prisma/client'
import {promisify} from "util";
const prisma = new PrismaClient();
import mysql from "mysql";

const pool = mysql.createPool({
    connectionLimit : 100, //important
    queueLimit: 150,
    waitForConnections:false,
    host     : process.env.MYSQL_HOST,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASS,
    database : process.env.MYSQL_DB,
    debug    :  false
});
export const TIER_CATEGORIES = ["WOOD","STONE","IRON","BRONZE","SILVER","GOLD","DIAMOND","MASTER","GRAND MASTER","SUPREME"];
(async()=>{
    for(let i = 0; i <= 4; i++){
        console.log("i", TIER_CATEGORIES[i], i);
        const percentToDelete = 50-(i*10);
        const courses = await fetch(`https://golfcraftgame.com/api/prisma-find-many/courses`,{
            method:"POST",
            body:JSON.stringify({
                where:{
                    "isSeason":1,
                    "minTierCat":i
                }
            }),
            headers:{"Content-Type":"application/json"}
        }).then(r=>r.json());
        for(let course of courses){
            //TODO now look for recorded games of percentiles
            //TODO just count the amount of recorded games
            //TODO short by number of shots ASC, time ASC
            //TODO delete wit LIMIT
            const count = await prisma.recorded_game.count({
                where:{
                    courseAlias:course.alias,
                },
                orderBy:[{"shots":"asc"},{"time":"asc"}]
            })
            const amount = Math.floor(count*(percentToDelete/100));
            const sql = `DELETE FROM recorded_game WHERE courseAlias="${course.alias}" ORDER BY shots ASC, TIME ASC LIMIT ${amount}`;
            const result = await promisify(pool.query).bind(pool)(sql);
            console.log("deleted ",amount," of ",course.alias)
        }
    }

})();