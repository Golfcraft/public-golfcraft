import {PrismaClient} from "@prisma/client";

require('dotenv').config();
import {PlayFabServer} from "playfab-sdk";

import {finishTournament} from "../server/tournaments/api/finish-tournament";

const prisma = new PrismaClient();
const A_YEAR_MS = 1000*60*60*24*365;
if(!process.env.PLAYFAB_TITLE_ID || !process.env.PLAYFAB_SECRET_KEY){
    console.log("missing PlayFab config");
    process.exit(1);
}

PlayFabServer.settings.titleId = process.env.PLAYFAB_TITLE_ID;
PlayFabServer.settings["DeveloperSecretKey"] = PlayFabServer.settings.developerSecretKey = process.env.PLAYFAB_SECRET_KEY;

let interval = setInterval(async ()=>{
   const tournaments = await prisma.tournaments.findMany({where:{OR:[{finished:null},{finished: 0}]}});
   let i = tournaments.length;

   //if(i) console.log("looking for finished tournaments", i);
   while(i--){
       const tournament = tournaments[i];
       //TODO if expiration_date > Date.now(), finish and give prizes //-> NOT for max_participants yet
        if(!tournament.is_live_tournament && ((tournament.expiration_date*1000) < (Date.now() + 60000)) || (tournament.start_date*1000) < (Date.now() - A_YEAR_MS)){
            console.log("finishing tournament ", tournament.code)
            await finishTournament(tournament, prisma);
        }
   }
},30000);

