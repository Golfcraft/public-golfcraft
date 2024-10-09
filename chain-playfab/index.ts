import {PlayFabServer} from "playfab-sdk";

require("dotenv").config();

if(!process.env.PLAYFAB_TITLE_ID || !process.env.PLAYFAB_SECRET_KEY){
    console.log("missing PlayFab config");
    process.exit(1);
}
PlayFabServer.settings.titleId = process.env.PLAYFAB_TITLE_ID;
PlayFabServer.settings["DeveloperSecretKey"] = PlayFabServer.settings.developerSecretKey = process.env.PLAYFAB_SECRET_KEY;

import("./api");
