/**
 * Service to handle NPCs.
 * Given a NPC ID and User ID, it will return the next dialogue.
 */


require('dotenv').config();

import express from 'express';
import cors from 'cors';
import fs from "fs";

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

app.use(cors(process.env.PROD?corsOptions:undefined));
app.use(express.json());

/**
 * GET /npc-dialogue/:npcId/:userId
 */
app.get(`*/npc-dialogue/:npcId/:userId`, (req, res) => {
  const {npcId, userId} = req.params;
  const dialogue = getDialogue(npcId, userId);
  if(!dialogue){
    res.status(404).send("NPC not found");
    return;
  }
  res.status(200).send(dialogue);
});

/**
* POST /user-tags/:userId
*/
app.post(`*/user-tags/:userId`, (req, res) => {
  const {userId} = req.params;
  const {tags} = req.body;
  const userStatusFile = `./userdata/${userId}.json`;
  var userStatus:any = {};
  if(fs.existsSync(userStatusFile)){
    userStatus = JSON.parse(fs.readFileSync(userStatusFile, "utf8"));
  }
  // merge userStatus.tags array with tags array
  var merged_tags = Array.from(new Set(tags.concat(userStatus.tags)))
  userStatus.tags = merged_tags
  fs.writeFileSync(userStatusFile, JSON.stringify(userStatus))
  res.status(200).send({"status": "ok"});
});


type dialogueItem = {
  c: string,
  p: number,
  t: string,
  id: string
}

/**
 * getDialogue, loads the NPC from the json file.
 * returns the dialogue for the given NPC and user.
 */
function getDialogue(npcId:string, userId:string){
  const npcScriptFile = `./scripts/${npcId}.json`;
  if(!fs.existsSync(npcScriptFile)){
    return null;
  }
  const npcScript = JSON.parse(fs.readFileSync(npcScriptFile, "utf8"));

  const userStatusFile = `./userdata/${userId}.json`;
  var userStatus:any = {};
  if(fs.existsSync(userStatusFile)){
    userStatus = JSON.parse(fs.readFileSync(userStatusFile, "utf8"));
  }

  var bestDialogueMatch: dialogueItem|null = null;
  var bestDialogueMatchScore = 0;
  for(var i = 0; i < npcScript.length; i++){
    if (userStatus.listened_messages.includes(npcScript[i].id)){
      continue;
    }

    var conditions = npcScript[i].c.split(";");
    var conditionsMet = 0;
    var allConditionsMet = false;
    for(var j = 0; j < conditions.length; j++) {
      if(userStatus.tags.includes(conditions[j])){
        conditionsMet++;
      }
    }
    if(conditionsMet == conditions.length){
        allConditionsMet = true;
        if (conditionsMet > bestDialogueMatchScore) {
          bestDialogueMatch = npcScript[i];
          bestDialogueMatchScore = conditionsMet;
        }
    }
  }
  if(bestDialogueMatch != null){
    if (!userStatus.listened_messages.includes(bestDialogueMatch.id)) {
      userStatus.listened_messages.push(bestDialogueMatch.id);
    }
    userStatus.tags = [];
  }
  fs.writeFileSync(userStatusFile, JSON.stringify(userStatus));
  return bestDialogueMatch;
}


console.log("listening ...")
app.listen(port);