import {shuffle, sleep} from "../../../../common/utils";
import {USE_REMOTE_SERVER} from "../../../../common/constants";
import Colyseus = require('colyseus.js');
import MESSAGE from "../../../../server/rooms/mesages";
import {fadeInOverlay} from "../../components/ui/overlay";
import {getCanvas} from "../../../golfplay/services/canvas";
import {globalStore} from "../globalStore/globalStore";

const remotes = [
/*    {URL:   "ws2.golfcraftgame.com", name:"EU"},*/
    {URL:"ws3.golfcraftgame.com", name:"US"},
   // "ws4.golfcraftgame.com"
];
if(!USE_REMOTE_SERVER){
    remotes.push({URL:"127.0.0.1:2567", name:"LO"})
}
let selectedRemote:any = null;

export const getServerHttpURL = ()=>{
   // if(!USE_REMOTE_SERVER) return `http://127.0.0.1:2567`;
    if(!selectedRemote) throw Error("not available servers");
    return `http${USE_REMOTE_SERVER?'s':''}://${selectedRemote}`;
}
export const getServerWsURL = ()=>{
 //   if(!USE_REMOTE_SERVER) return `ws://127.0.0.1:2567`;
    if(!selectedRemote) throw Error("not available servers");
    return `ws${USE_REMOTE_SERVER?'s':''}://${selectedRemote}`
}

let selectServerText;

export const selectServer = (colyseusClient?) => {
    fadeInOverlay(1);
    return new Promise(async (resolve, reject)=>{
/*        if(!USE_REMOTE_SERVER){
            return resolve({defaultWs: colyseusClient || new Colyseus.Client(`ws://127.0.0.1:2567`)})
        }*/

        console.log("selecting server");
        //TODO SHOW UI TO CHANGE SERVER, PRESS NUMBER TO SELECT THE APPROPRIATE SERVER
        // 1 = USA
        // 2 = EU
        const state = {
            roomsLastTime:[0,0,0],
            roomsPing:[0,0,0],
            alive:true,
            resolved:false
        };
        selectServerText = selectServerText || new UIText(getCanvas());
        selectServerText.fontSize = 16;
        selectServerText.positionX = 300;
        selectServerText.positionY = -140;
        selectServerText.hAlign = selectServerText.hTextAlign = "left";
        selectServerText.vAlign = selectServerText.vTextAlign = "top";
        selectServerText.visible = true;
        selectServerText.color = Color3.White();

    //    updateText(state);

console.log("connecting");

        const clientWs2 = colyseusClient &&  selectedRemote === remotes[0].URL ? colyseusClient: new Colyseus.Client(`wss://${remotes[0].URL}`) ;
        const localClient = USE_REMOTE_SERVER?null: (colyseusClient &&  selectedRemote === remotes[1].URL ? colyseusClient : new Colyseus.Client(`ws://${remotes[1].URL}`));

        //const clientWs4 = colyseusClient &&  selectedRemote === remotes[2] ? colyseusClient: new Colyseus.Client(`wss://${remotes[2]}`);
        console.log("joining",clientWs2);
        const ws2Room = await tryConnectPingRoom(clientWs2);
        const wsLocal = USE_REMOTE_SERVER?null:await tryConnectPingRoom(localClient);

        //const ws4Room = await tryConnectPingRoom(clientWs4);
        console.log("joined")

        const servers = [
            {room:ws2Room, client:clientWs2, index:0, def:remotes[0], code:"US", name:"United States"}
        ];
        if(!USE_REMOTE_SERVER){
            servers.push({room:wsLocal, client:localClient, index:2, def:remotes[1], code:"LO", name:"Localhost"})
        }
        globalStore.game.getState().servers = servers;
        console.log("globalStore.game.getState().servers",globalStore.game.getState().servers)

            let currentIndex = 0;
        for(let server of servers){
            if(server.client && server.room){
                const wsRoom = server.room;
                const index = server.index;
                wsRoom.onMessage("pong", async ()=>{
                    state.roomsPing[index] = Date.now() - state.roomsLastTime[index];
                    updatesAvg[index] = updatesAvg[index] +  state.roomsPing[index] / 2;
                    updates[index]++;
                    globalStore.game.getState().serverPings = {...globalStore.game.getState().serverPings};
                    globalStore.game.getState().serverPings[server.code] = state.roomsPing[index];
                    updateText(state);
                });
            }
        }

        //Input.instance.subscribe("BUTTON_DOWN", ActionButton.ACTION_5, false, select3);
        Input.instance.subscribe("BUTTON_DOWN", ActionButton.ACTION_3, false, select1);
       if(!USE_REMOTE_SERVER) Input.instance.subscribe("BUTTON_DOWN", ActionButton.ACTION_5, false, selectLocal);
        let updatesAvg = [0,0,0];
        let updates = [0,0,0];
        while(state.alive){
            if(updates.reduce(sum, 0) > 10 && !state.resolved){
                let fasterServerIndex = updatesAvg.reduce((acc,current,index)=>{
                    if(!~acc) return 0;
                    if(updatesAvg[index] > acc) return index;
                    return acc;
                },-1);
                console.log("fasterServerIndex", fasterServerIndex)
                if(fasterServerIndex === 0) select1();
                if(!USE_REMOTE_SERVER && fasterServerIndex === 2) selectLocal();
                continue;
            }
           const server = servers[currentIndex];
           if(!server){
               await sleep(500);
               currentIndex++;
               if(currentIndex > 2) currentIndex = 0;
               continue
           }
            const wsRoom = server.room;
            const index = server.index;
            if(wsRoom){
                state.roomsLastTime[index] = Date.now();
                wsRoom.send("ping");
            }

           await sleep(500);
            currentIndex++;
            if(currentIndex > 2) currentIndex = 0;
        }
            function sum(acc, current){
                        return acc+current;
            }
        function select1(){
            console.log("select1")
            Input.instance.unsubscribe("BUTTON_DOWN",ActionButton.ACTION_3, select1 );
            if(!USE_REMOTE_SERVER)  Input.instance.unsubscribe("BUTTON_DOWN",ActionButton.ACTION_4, selectLocal );
            selectedRemote = remotes[0].URL;
            //state.alive = false;
            selectServerText.value = "";
            selectServerText.visible = false;
            state.resolved = true;
            resolve({
                defaultWs:clientWs2,
                servers
            })
        }

        function selectLocal(){
            console.log("selectLocal")
            Input.instance.unsubscribe("BUTTON_DOWN",ActionButton.ACTION_3, select1 );
            if(!USE_REMOTE_SERVER)  Input.instance.unsubscribe("BUTTON_DOWN",ActionButton.ACTION_4, selectLocal );

            selectedRemote = remotes[2].URL;
            //state.alive = false;
            selectServerText.value = "";
            selectServerText.visible = false;
            state.resolved = true;
            resolve({
                defaultWs:localClient,
                servers
            })
        }

        async function tryConnectPingRoom(clientWs){
            try{
                const wsRoom = await clientWs.joinOrCreate("ping");
                return wsRoom;
            }catch(error){
                console.log("error",error);
                return;
            }
        }
    });

    function updateText(state){
        let text = "PRESS A NUMBER TO SELECT SERVER:\n\n";
        text += `1. United States (US) - ${state.roomsPing[0]} ms\n`;
        if(!USE_REMOTE_SERVER){
            text += `2. Localhost - ${state.roomsPing[0]} ms`
        }
    //    text += `3. Australia (AU) - ${state.roomsPing[2]} ms\n`;
        selectServerText.value = text;
    }
}


const promiseAnyResolved = async <T>(
    iterable: any
): Promise<T> => {
    return Promise.all(
        [...iterable].map(promise => {
            return new Promise((resolve, reject) =>
                Promise.resolve(promise).then(reject, resolve)
            );
        })
    ).then(
        errors => Promise.reject(errors),
        value => Promise.resolve<T>(value)
    );
};