import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
interface Response {
    locals: Record<any, any>;
    }
import { GameLobbyRoom } from '../rooms/GameLobbyRoom';
import { TrainingRace } from '../rooms/Training-Race';
import {TrainingZone} from "../rooms/Training-Zone";
import {TrainingVoxters} from "../rooms/Training-Voxters";
import {TrainingHole} from "../rooms/Training-Hole";
import { CompetitionGroupRoom } from "../rooms/Competition-Group";

const port = Number(process.env.PORT);

import { initializeMaterials } from '../../scene/golfplay/physics/world';
import CANNON from "cannon";
(<any>global||{}).CANNON = CANNON;
initializeMaterials();
import PlayFabServer from 'playfab-sdk/Scripts/PlayFab/PlayFabServer';
if(!process.env.PLAYFAB_TITLE_ID){   
    throw new Error("missing .env vars")
}
PlayFabServer.settings.titleId = process.env.PLAYFAB_TITLE_ID;
PlayFabServer.settings["DeveloperSecretKey"] = PlayFabServer.settings.developerSecretKey = process.env.PLAYFAB_SECRET_KEY;

import express from 'express';
import {createCompetitionGroups} from "../competition-groups/competition-groups-main";

import basicAuth = require("express-basic-auth");

export default Arena({
    getId: () => "Project G App",

    initializeGameServer: (gameServer) => {
       // gameServer.define('ShootingGalleryRoom', ShootingGalleryRoom);

        gameServer.define('training-race', <any>TrainingRace)
        .filterBy(['realm', 'userId'])
        .enableRealtimeListing();

        gameServer.define('training-zone', <any>TrainingZone)
        .filterBy(['realm', 'userId'])
        .enableRealtimeListing();

        gameServer.define('training-voxters', <any>TrainingVoxters)
        .filterBy(['realm', 'userId'])
        .enableRealtimeListing();

        gameServer.define('training-hole', <any>TrainingHole)
        .filterBy(['realm', 'userId'])
        .enableRealtimeListing();

        gameServer.define('gameLobbyRoom', <any>GameLobbyRoom)
        .filterBy(['realm'])
        .enableRealtimeListing();

        gameServer.define(`competition-group`, <any>CompetitionGroupRoom)
        .filterBy(['groupId', 'userId'])
        .enableRealtimeListing();//TODO we filter for now userId, but at some point we could like to show them all together
    },

    initializeExpress: (app) => {
        
        //app.use(<any>express.json());

        app.get("/", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });


        const basicAuthMiddleware = basicAuth({
            // list of users and passwords
            users: {
                "golfcraft": "juegazo",
            },
            
            // sends WWW-Authenticate header, which will prompt the user to fill
            // credentials in
            challenge: true
        });
        app.use("/colyseus", basicAuthMiddleware, monitor());

        createCompetitionGroups({
            app
        });
        
    },


    beforeListen: () => {
        console.log(`Listening on ws://localhost:${ port }`)
    }
});