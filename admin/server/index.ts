require("dotenv").config();
import fs from "fs";
import fetch from "swap-fetch";
handleProcessExit();
import path from 'path';
import express from 'express'
import cors from 'cors';
import basicAuth = require("express-basic-auth");

const STREAM_URL_FILE = "streamURL";

if(!fs.existsSync(STREAM_URL_FILE)){
    console.log("streamURL file missing");
}
const basicAuthMiddleware = basicAuth({
    // list of users and passwords
    users: {
        "golfcraft": process.env.ADMIN_PASS,
    },
    
    // sends WWW-Authenticate header, which will prompt the user to fill
    // credentials in
    challenge: true
});
const port = process.env.PORT || 2569;
const state = {
    streamURL:fs.readFileSync(STREAM_URL_FILE, "utf8")
};
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
const BASE = "/golfcraft-manager";
app.set("base", BASE);
app.get(`${BASE}/api/get-stream-url`, async (req, res) => {
    return res.send(state.streamURL);
});

app.post(`${BASE}/api/set-stream-url`, basicAuthMiddleware, async (req, res) => {
    if(req.body.streamURL !== undefined){
        state.streamURL = req.body.streamURL;
        fs.writeFileSync(STREAM_URL_FILE, state.streamURL, "utf8");
        return res.json({ok:true})
    }else{
        return res.status(400).send("fail");
    }
});
app.use(BASE, express.static(path.join(__dirname, '..', 'client', 'build')));
console.log("listening...");
app.listen(process.env.PORT || "2569");

function handleProcessExit(){
    process.on('SIGTERM', async (signal) => {
        await callDiscordHook(`Process ${process.pid} received a SIGTERM signal`);
        process.exit(0);
      })
  
      process.on('SIGINT', async (signal) => {
        await callDiscordHook(`Process ${process.pid} has been interrupted`);
        process.exit(0);
      })
    process.on('uncaughtException', async (err) => {
        await callDiscordHook(`Uncaught Exception: ${err.message}`);
        process.exit(1);
    });
    process.on('unhandledRejection', async (reason, promise) => {
        await callDiscordHook(`unhandlerdRejection: ${reason} ${promise}`);
        process.exit(1)
    });
  }
  type DiscordJSON = {
    content:string,
    username?:string,
    embeds?:any[],
  }
  function callDiscordHook(str:string|DiscordJSON, url = "https://discord.com/api/webhooks/890767344530522152/sETzraO8m9alF6ntg8aM6ElOSmybRdc9oVBl6EQ-_IYoneJZ3lv1OtIH8T9C_ddCs4Ds"){
  console.log(str);

  var body = typeof str === "string"?{
          username:"Bot",
          content: `${str}`
      }:str;

  return fetch(url,
      {
          method:"POST",
          body:JSON.stringify(body),
          headers:{'Content-Type':"application/json"}
      })
}