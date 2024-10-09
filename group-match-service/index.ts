require('dotenv').config();

import { PlayFabServer } from "playfab-sdk";
import {createCompetitionGroups, getGroups} from "./src/competition-groups-main";
import express from 'express';
import cors from 'cors';
import {broadcastPerServer} from "./broadcast";

if(!process.env.PLAYFAB_TITLE_ID){
  console.log("missing .env vars");
  process.exit(1);
}
PlayFabServer.settings.titleId = process.env.PLAYFAB_TITLE_ID;
PlayFabServer.settings["DeveloperSecretKey"] = PlayFabServer.settings.developerSecretKey = process.env.PLAYFAB_SECRET_KEY;

const port = Number(process.env.PORT || 2568) + Number(process.env.NODE_APP_INSTANCE || 0);
const app = express();

var whitelist = ['https://play.decentraland.org', 'https://decentraland.org']
const corsOptions = {
  //origin: process.env.PROD ? 'https://decentraland.org':"*"
  origin:(origin, callback)=>{
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS '+origin));
    }
  }
}

if(process.env.PROD){
  //console.log = function(){}
}

app.use(cors({
  corsOptions: process.env.PROD?corsOptions:undefined
}));
app.use(express.json());

app.use('*/groups', (req, res) => {
    res.status(200).send(getGroups());
});

app.post(`*/notify-group-update`, (req, res)=>{
  const {userId, groupId} = req.body;        
  const group = getGroups()[groupId];
  if(!group){
    console.log("not existent group", groupId);
  }
  broadcastPerServer(group, 'notify-group-update');
});

const groupMatcher = createCompetitionGroups({
    app
});

groupMatcher.onFinishedGroup(({group})=>{
  broadcastPerServer(group, 'notify-group-finish');
});

console.log("listening ...")
app.listen(port);