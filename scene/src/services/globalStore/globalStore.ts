import { createState, State } from "../../../state";

export type GlobalStore = {
    game?:State<{
        courseName: string,
        courseAuthor: null|string,
        courseIsSeason: number|boolean,
        votedLastMap:boolean,
        lastMap:string,
        connected:boolean,                
        playing:boolean,
        joiningGame:boolean,
        connecting:boolean,
        starting:boolean,
        competitionGroup:any,
        golfClub:any,
        reconnecting:any,
        selectedServer:any,
        courseId:string|null,
        editing?:boolean,
        introScreen:boolean,
        serverPings:any,
        servers:any
    }>,
    userData?:State<{
        user:any,
        GC:number,
        FT:number,
        PT:number,
        UserInventory:any[], //TODO fix any
        userId:string,
        PlayFabId:string,
        [key:string]:any
    }>
    leaderboards?:State<{
        training_success:any
    }>
    [key:string]:any  
}

const globalStore:GlobalStore = {}; 

const addStore = (name, initialState, log?) => {
    const newStore = globalStore[name] = createState(initialState);
    newStore.onChange(({newValue, oldValue, prop}) => {
        updateDebugUI();
    });
    updateDebugUI();
    return newStore;
}

let debugUIText;
const createStateDebugUI = () => {
    const canvas = new UICanvas();
    const container = new UIContainerRect(canvas);
    container.hAlign = "left";
    container.vAlign = "top";
    container.color = new Color4(0,0,0,0.6);
    container.width = 300;
    container.height = 500;
    container.positionY = -120;
    
    debugUIText = new UIText(container);
    debugUIText.vAlign = "top";
    debugUIText.hAlign = "left";
    debugUIText.hTextAlign = "left";
    debugUIText.vTextAlign = "top";
    debugUIText.value="Waiting to have state data ...";
    debugUIText.fontSize = 6;
    debugUIText.paddingLeft = 20;
    debugUIText.paddingTop = 10;
    debugUIText.positionY = 0;
}

const jsonReplacers = {
    "pendentGroups": (value) => {        
        return value?.length && value.reduce((acc,group) => {
            acc[group.id] = group?.players && Object.values(group.players).reduce((acc, player)=>{
                acc[player.userId] = `${player.displayName} ${player.shoots?.length||0}`;
                return acc;
            }, {}) || {};

            return acc;
        }) || {}
    }
};

function jsonReplacer(key, value){
    if(jsonReplacers[key]){
        return jsonReplacers[key](value);
    }else{
        return value;
    }
}

const updateDebugUI = () => {
    if(!debugUIText) return;
    let result = '';
    Object.keys(globalStore).forEach(storeName => {
        result += `${storeName.toUpperCase()}::\n`
        result += (JSON.stringify(globalStore[storeName].getState(), jsonReplacer, '  ')) + '\n\n';
    });
    debugUIText.value = result;
}


export {
    globalStore,
    addStore,
    createStateDebugUI
};