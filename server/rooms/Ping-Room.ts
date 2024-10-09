import { Room } from "colyseus";
import { Schema } from "@colyseus/schema";

export class PingRoom extends Room<Schema> {
    onCreate({realm, user}){
        this.onMessage("ping", (client)=>{
            client.send("pong");
        });
    }

    onJoin(client){

    }
}