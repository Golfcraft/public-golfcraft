///<reference lib="es2015.symbol" />
///<reference lib="es2015.symbol.wellknown" />
///<reference lib="es2015.collection" />
///<reference lib="es2015.iterable" />
import {createHelp} from "./help/create-help";

declare const console:any;
declare const setInterval:any;

import { getUserData } from "@decentraland/Identity";
import { getCurrentRealm } from "@decentraland/EnvironmentAPI";
import { getParcel } from '@decentraland/ParcelIdentity';
import {createVoxter} from './voxter/voxter';
import { decode } from "./lib/decoder";

import { Client } from "colyseus.js";

export const initializeVoxtersPet = async () => {
    console.log("initializeVoxtersPet")
    const user =  await getUserData();
    const realm = (await getCurrentRealm())?.displayName;
    const {cid, land} = await getParcel();
    const {sceneJsonData} = land;
    
    const PROD = true;//!~(realm||'').indexOf(`localhost`);

    const WS_HOST = PROD?`wss://mana-fever.com/voxters-pet/`:`ws://localhost:8090/voxters-pet`;

    const client = new Client(`${WS_HOST}`);
    console.log("voxters client", client)
    const room:any = await client.joinOrCreate('voxters-lobby',{
        realm,
        user,
        land:sceneJsonData.scene.base
    });
console.log("connected to voxters eroom", room)
    type VoxterRepresentation = {
        playerPosition:Vector3,
        voxter:any,
        collection:any,
        _voxter:any,
        _help:any
    };

    const voxters:{[key:string]:VoxterRepresentation} = {};

    room.onMessage('hasVoxter', (tokenId:number) => {
        let lastPosition = {x:1,y:1,z:1};  
        setInterval(()=>{
            //TODO only if position has changed since last time
            if(!equalPositions(lastPosition, serializeAndFloorVector3(Camera.instance.position))){
                lastPosition = serializeAndFloorVector3(Camera.instance.position);
                room.send(1, lastPosition);
            }
            
        },1000);        
    });

    room.state.supporters.onAdd = (supporter:any, key:string) => {
        const {playerPosition, tokenId, name, collectionId} = supporter.toJSON();
        const {x,y,z} = playerPosition;
        const properties:any[4] = decode(tokenId, [64,64,7,9]);
        console.log("collectionId",collectionId)
        voxters[key] = {
            playerPosition:new Vector3(x,y,z),
            collection:collectionId,
            // @ts-ignore
            voxter: collectionId===0
                ? createVoxter(name, x,y,z, ...properties)
                : createHelp(name, x,y,z, tokenId)
        };

        if(key === room.sessionId){
            voxters[key].voxter.onClick(voxterOnClick);
        }

        function voxterOnClick(buttonId:number){
            if(buttonId === 0){
                room.send("switch", 100);
            }else if(buttonId === 1){
                room.send("collectionId", 100);
                console.log("change collection", voxters[key].collection)
                //TODO change collection
            }
        }

        function changeVoxterCollection(){
            console.log("changeVoxterCollection")
            if(!voxters[key].voxter) return;
            let {x,y,z} = voxters[key].voxter.getPosition();
            if(!voxters[key].collection){
                voxters[key].voxter.hide();
                voxters[key]._voxter =voxters[key].voxter;
                if(!voxters[key]._help){
                    voxters[key].voxter =  createHelp(name, x,y,z, 1);
                    voxters[key].voxter.onClick(voxterOnClick)
                }else{
                    voxters[key].voxter = voxters[key]._help;
                    voxters[key].voxter.show();
                }
                voxters[key].collection=1;
            }else if(voxters[key].collection === 1){
                voxters[key].voxter.hide();
                voxters[key]._help =voxters[key].voxter;
                if(!voxters[key]._voxter){
                    voxters[key].voxter = createVoxter(name, x,y,z, ...decode(tokenId, [64,64,7,9]));
                    voxters[key].voxter.onClick(voxterOnClick)
                }else{
                    voxters[key].voxter = voxters[key]._voxter;
                    voxters[key].voxter.show();
                }
                voxters[key].collection=0;
            }
        }
        supporter.playerPosition.onChange = (changes:any[]) => {
            const newPosition = changes.reduce((acc, current)=>{
                acc[current.field] = current.value;
                return acc;
            },{});
            (<any>Object).assign(voxters[key].playerPosition, newPosition);  
        }

        supporter.onChange = (changes:any[]) => {
            const tokenIdChange = changes.find(a=>a.field === "tokenId");
            const collectionIdChange = changes.find(a=>a.field === "collectionId");
            if(collectionIdChange?.previousValue !== undefined){
                console.log("changes",changes)
                changeVoxterCollection();
            } else if (tokenIdChange){
                voxters[key].voxter.applyDna(tokenIdChange.value);
            }
        } 
    }

    room.state.supporters.onRemove = (supporter:any, key:string) => {
        voxters[key].voxter.dispose();
        delete voxters[key];
    }
    const minDistance = 1;
    let counter = 0;
    const update = (dt:any)=>{
        counter += dt;
        (<any>Object).values(voxters).forEach((voxterRepresentation:VoxterRepresentation)=>{
            const {x,y,z} = voxterRepresentation.playerPosition;
            const playerPosition = new Vector3(x,y+0.75,z);
            const voxterTransform = voxterRepresentation.voxter.getEntity().getComponent(Transform);
            const moveDirection = playerPosition.subtract(voxterTransform.position).normalize().multiplyByFloats(2*dt,2*dt,2*dt);            
            const yDisplacement = new Vector3(0,Math.cos(counter*1)*0.01,0);
            const nextPosition = voxterTransform.position.add(moveDirection).add(yDisplacement);

            if(distance(nextPosition, playerPosition) > minDistance){
                voxterRepresentation.voxter.setPosition(nextPosition);
            }else{
                voxterRepresentation.voxter.setPosition(voxterTransform.position.add(yDisplacement))
            }            

            voxterTransform.rotation = Quaternion.Slerp(
                voxterTransform.rotation,
                Quaternion.LookRotation(playerPosition.subtract(voxterTransform.position)),
                dt * 2
            );            
        });

        function distance(pos1:Vector3, pos2:Vector3){
            const a = pos1.x - pos2.x;
            const b = pos2.z - pos2.z;
            return a*a-b*b;
        }
    }
    const voxterSystem = new UpdateSystem(update);
    engine.addSystem(voxterSystem);

    return {
        hide:()=>{
            engine.removeSystem(voxterSystem);
            Object.values(voxters).forEach(v => v.voxter.hide());
        },
        show:()=>{
            engine.addSystem(voxterSystem);
            Object.values(voxters).forEach(v => v.voxter.show());
        }
    }
}

class UpdateSystem implements ISystem {
    private callback;
    constructor(callback:any){
        this.callback = callback;
        engine.addSystem(this);
    }
    update(dt:number){
        this.callback(dt);
    }
    dispose(){
        this.callback = null;
        engine.removeSystem(this);
    }
}

function serializeAndFloorVector3(vector:Vector3){
   return {
        x:Math.floor(vector.x),
        y:Math.floor(vector.y),
        z:Math.floor(vector.z)
    };
}

function equalPositions(a:any, b:any){
    return a.x === b.x && a.z === b.z && a.y === b.y;
}
