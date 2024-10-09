import {createUnsafeIdentity} from "@dcl/crypto/dist/crypto";
import {Authenticator} from "@dcl/crypto";
import createAuthChain = Authenticator.createAuthChain;
import WebSocket, {WebSocketServer} from 'ws';
import {getRandomInt, sleep} from "../common/utils";
import fetch from "cross-fetch";
const NUM = 10;
let i = 0;
const CONNECT_DELAY = 10000;
const productiveServers = {
    hephaestus: "peer-ec1.decentraland.org", // DCL - US East 1
    hela: "peer-ec2.decentraland.org", // DCL - US East 2
    heimdallr: "peer-wc1.decentraland.org", // DCL - US West
    baldr: "peer-eu1.decentraland.org", // DCL - EU
    artemis: "peer-ap1.decentraland.org", // DCL - AP1
    loki:"interconnected.online", // Esteban
    dg:"peer.decentral.io", // Baus
    odin:"peer.melonwave.com", // Ari
    unicorn:"peer.kyllian.me", // Kyllian
    marvel:"peer.uadevops.com", // SFox
    athena:"peer.dclnodes.io", // DSM
};

const servers = Object.values(productiveServers);


(async () => {
    while (i < NUM) {
        const selectedServer = await selectServer();
        const {disconnect} = start(selectedServer);
        console.log("connected", selectedServer, disconnect);
        await sleep(CONNECT_DELAY);
        i++;
    }
})();

async function selectServer(){
    let selected;
    while(!selected){
        const ran = getRandomInt(0, servers.length - 1);
        const server = servers[ran];
        console.log("selecting", server);
        const ready = await fetch(`https://${server}/comms/status`).then(r=>r.json(), ()=>0).then(d=>d?.ready, ()=>0);
        console.log("ready",server,ready)
        if(ready) selected = server;
    }
    return selected;

}

function start(selectedServer) {
    console.log("___START", selectedServer);
    const ephemeralIdentity = createUnsafeIdentity();
    const realAccount = createUnsafeIdentity();
    const state: any = {
        OPEN: null,
        ASSIGNED_ID: null,
        token: Math.random().toString().split(".")[1]
    }
    console.log("token", state.token);
    //var ws = new WebSocket(`ws://localhost/comms/peerjs?key=peerjs&token=${state.token}`);

    console.log("selectedServer", selectedServer);
    //  continue;
    let ws;
    try {
        ws = new WebSocket(`wss://${selectedServer}/comms/peerjs?key=peerjs&token=${state.token}`);
        ws.on('open', function open() {
            console.log("ws open");
        });
        ws.on('close', function close() {
            console.log("ws close")
        });
        ws.on('message', function message(data) {
            const {type, payload} = JSON.parse(data);
            //console.log('received: %s', data);
            console.log("received", type, !!payload);
            if (ws && type === "VALIDATION_OK") {
                let _interval = setInterval(() => {
                    const body = {
                        type: "HEARTBEAT",
                        payload: {
                            connectedPeerIds: [],
                            parcel: [47, -45],
                            position: [45, 1, 9]
                        }
                    }
                    if(ws){
                        console.log("sending HEARTBEAT", selectedServer, state.token);
                        ws?.send(JSON.stringify(body))
                    }else{
                        console.log("closed connection", selectedServer);
                        clearInterval(_interval)
                    }

                }, 2000);
            }
            if (state.ASSIGNED_ID && state.OPEN) return;
            state[type] = payload;
            if (state.OPEN && state.ASSIGNED_ID) {

                const authChain = createAuthChain(realAccount, ephemeralIdentity, 60, state.OPEN);
                const body = {
                    src: state.ASSIGNED_ID.id,
                    type: "VALIDATION",
                    payload: authChain
                }
                ws?.send(JSON.stringify(body));
            }
        });
    } catch (e) {
        console.log(e);
        console.log("___FAILED", selectedServer);
    }

    return {
        disconnect:()=>{
            console.log("disconnect");
            ws.close();
            ws = null;
        }
    }
}

