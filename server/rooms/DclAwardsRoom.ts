import {ArraySchema, Schema, type} from "@colyseus/schema";
import {Client, Room} from "colyseus";
import weightedRandom from "../../pet-store-service/weightedRandom";
import {callDiscordHook} from "../../common/discord";
import {promisify} from "util";
import {PlayFabServer} from "playfab-sdk";
import {getRandomFromList, sleep} from "../../common/utils";

const ChestRewardChances = [
    {GC:1, weight:2000},
    {GC:2, weight:1500},
    {GC:5, weight:1000},
    {GC:10, weight:750},
    {GC:15, weight:500},
    {GC:20, weight:250},
    {GC:50, weight:100},
    {GC:100, weight:50},
    {WD:1, weight: 400},
    {WD:10, weight: 40},
    {ST:1, weight: 200},
    {ST:10, weight: 20},
    {IR:1, weight: 70},
    {IR:10, weight: 7},
    {GD:1, weight: 45},
    {GD:10, weight: 4},
    {DM:1, weight: 50},
    {EN:1, weight: 100},
    {FT:1, weight: 50},
    {FT:10, weight: 10},
    {GIFT:1, weight: 0}
];

const GiftChances = [
    {}
];

class ChestState extends Schema {
    @type("boolean")
    visible = false

    @type("string")
    currency

    constructor(){
        super();
        //TODO if chestEvent on building, extend new chances with Gift
        this.currency = getCurrency(weightedRandom(ChestRewardChances, ChestRewardChances.map(c=>c.weight)).item);
    }

    shuffle(){
        this.currency = getCurrency(weightedRandom(ChestRewardChances, ChestRewardChances.map(c=>c.weight)).item);
    }
}

function getCurrency(obj){
    if(obj.GC) return "GC";
    if(obj.WD) return "WD";
    if(obj.ST) return "ST";
    if(obj.IR) return "IR";
    if(obj.GD) return "GD";
    if(obj.DM) return "DM";
    if(obj.FT) return "FT";
    if(obj.EN) return "EN";
    if(obj.GIFT) return "GIFT";
}

class DclAwardsRoomState extends Schema {
    @type([ChestState])
    chests;

    @type("boolean")
    active = true;

    @type("number")
    interval = 10000;

    disposed;
    opened = 0;
    wearablesGiven = 0;

    constructor() {
        super();
        const chests = [];
        let i = 20;

        while(i--){
            chests.push(new ChestState());
        }

        this.chests = new ArraySchema<ChestState>(...chests);
    }

    dispose(){
        this.disposed = true;
    }
}

export class DclAwardsRoom extends Room<DclAwardsRoomState> {
    autoDispose = false;
    onCreate(options: any): void | Promise<any> {
        this.autoDispose = false;
        this.setState(new DclAwardsRoomState());

        this.onMessage("ACTIVATE", (client, {interval})=>{//TODO verify signed address, like ohMyPixel?
            if(interval){
                this.state.interval = interval;
            }
            this.state.active = true;
        });
        this.onMessage("DEACTIVATE", (client, {interval})=>{
            this.state.active = false;
        });
        this.onMessage("INTERVAL", (client, {interval})=>{
            this.state.interval = interval;
        });

        this.onMessage("OPEN", async (client, {index, displayName, PlayFabId}) => {
            const chest = this.state.chests[index];

            if(chest.visible) {
                chest.visible = false;

                const wearablesAlready = (await promisify(PlayFabServer.GetPlayerStatistics)({PlayFabId, StatisticNames:["DCLAWARDS_WEARABLE"]}))?.data?.Statistics[0]?.Value || 0;
                const wearableAdaptedWeight = Math.min(0, Math.max(1, (ChestRewardChances.find((i:any)=>i.wearable)?.weight||0) - wearablesAlready*20));
                const _ChestRewardChances = JSON.parse(JSON.stringify(ChestRewardChances.filter(i=>i[chest.currency])));
                const wearableChanceDef = _ChestRewardChances.find(i=>i.wearable);
                if(wearableChanceDef) wearableChanceDef.weight = wearableAdaptedWeight;
                if(this.state.wearablesGiven > 90){
                    delete _ChestRewardChances.wearable;
                }
                const reward ={
                    ... weightedRandom(_ChestRewardChances, _ChestRewardChances.map(i=>i.weight)).item,
                    weight:undefined
                };
                callDiscordHook(`${JSON.stringify(reward)} ${displayName} ${PlayFabId}`, "https://discord.com/api/webhooks/1083816049952174120/wthzidkJAGSHLMffJX_e-t-wkIZBlL6eenflZZ1_KEPza1B_drRfsXOvjEI2BcJ57CWc");
                if(reward.wearable){
                    await promisify(PlayFabServer.UpdatePlayerStatistics)({
                        PlayFabId,
                        Statistics:[{
                            StatisticName:"DCLAWARDS_WEARABLE",
                            Value:1
                        }]
                    })
                    client.send("REWARD", {
                        message:`You have found a wearable<br>It will be sent after the event`,
                        timeout:10000,
                        reward
                    });

                    callDiscordHook(`${displayName} found a DCL Awards wearable!`,"https://discord.com/api/webhooks/906781944380031006/nMF7o9M-MtiWlV510kJshIpH_Pxj-w2K7evahDhHeWMnz4TFNMc_kFOT15hgCsXFcS6O")
                    this.state.wearablesGiven++;
                }else{
                    const VCNames = {
                        FT:"Fashion Tickets",
                        DM:"Diamonds",
                        GD:"Gold",
                        WD:"Wood",
                        ST:"Stone",
                        IR:"Iron",
                        GC:"Coins",
                        EN:"Energy"
                    };
                    const VirtualCurrency = Object.keys(reward)[0];
                    const Amount = reward[VirtualCurrency];
                    await promisify(PlayFabServer.AddUserVirtualCurrency)({
                        PlayFabId,
                        VirtualCurrency,
                        Amount
                    });
                    client.send("REWARD",
                        {
                            message:`You have found ${Amount} ${VCNames[VirtualCurrency]}`,
                            timeout:5000,
                            reward
                        });

                }
                //client.send("REWARD", reward);
            }
        });

        (async ()=>{
            while(!this.state.disposed){
                await sleep(this.state.interval);
                if(this.state.active){
                    const hiddenChests = this.state.chests.filter(i=>!i.visible);
                    if(hiddenChests?.length){
                        this.state.opened++;
                        const selectedChest = getRandomFromList(hiddenChests);
                        selectedChest.shuffle();
                        selectedChest.visible = true;

                    }
                }
            }
        })();
    }

    onJoin(client: Client, options?: any, auth?: any): void | Promise<any> {
        console.log("joined", options)
    }

    onDispose(): void | Promise<any> {
        console.log("dispose")
       this.state.dispose();
    }
}