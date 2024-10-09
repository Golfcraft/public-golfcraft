import { shuffle } from "./utils";
export const GOLF_CLUB_BONUSES = {
  "0":25,
  "3":5,
  "2":1,
  "5":1,
  "6":15,
  "7":1,
  "8":1,
    "9":1
};
export const MAX_BONUS_GOLFCLUB = 0.5;
export const TRAINING = {
    RACE:"1",
    ZONE:"2",
    VOXTER:"3",
    HOLE:"4"
};

export const trainingIdNameMap = {
    [TRAINING.RACE]:"race",
    [TRAINING.ZONE]:"zone",
    [TRAINING.VOXTER]:"voxters",
    [TRAINING.HOLE]:"hole"
};

export const LEAVE_CODE = {
    COMPLETED:4000,
    TIMEOUT:4001,
    FAILED:4002,
    PROBLEM:4003
};

export const STATISTICS = {    
    TRAINING_RACE_1_COMPLETED:'training_race_1_completed',
    TRAINING_RACE_1_FAILED:'training_race_1_failed',
    TRAINING_ZONE_1_COMPLETED:'training_zone_1_completed',
    TRAINING_ZONE_1_FAILED:'training_zone_1_failed',
    TRAINING_VOXTERS_1_COMPLETED:'training_voxters_1_completed',
    TRAINING_VOXTERS_1_FAILED:'training_voxters_1_failed',
    TRAINING_HOLE_1_COMPLETED:'training_hole_1_completed',
    TRAINING_HOLE_1_FAILED:'training_hole_1_failed',
};

export const MAX_PER_GROUP = 3;
export const PRICE_COMPETITION_GROUP = 20;//TODO move to playfab title data
export const ChestTier1Winner1 = "ChestTier1Winner1";
export const ChestTier1Winner2 = "ChestTier1Winner2";
export const ChestTier1Winner3 = "ChestTier1Winner3";
export const USE_REMOTE_SERVER = true;

//phji-7.colyseus.dev
//const SERVER_URL = USE_REMOTE_SERVER ? `ws.golfcraftgame.com`:`localhost:2567`;//AWS T2
//const SERVER_URL = USE_REMOTE_SERVER ? `ws2.golfcraftgame.com`:`localhost:2567`;//Hetzner
//const SERVER_URL = USE_REMOTE_SERVER ? `ws3.golfcraftgame.com`:`localhost:2567`;//Hetzner
//const SERVER_URL = USE_REMOTE_SERVER ? `mana-fever.com/golfcraft-ws`:`localhost:2567`;//DigitalOcean
//const SERVER_URL = USE_REMOTE_SERVER ? `phji-7.colyseus.dev`:`localhost:2567`;

/* export const SERVER_HTTP_URL = `http${USE_REMOTE_SERVER?'s':''}://${SERVER_URL}`;
export const WS_HOST = `ws${USE_REMOTE_SERVER?'s':''}://${SERVER_URL}`; */
export const TIER_CATEGORIES = ["WOOD","STONE","IRON","BRONZE","SILVER","GOLD","DIAMOND","MASTER","GRAND MASTER","SUPREME"];
export const TIER_COLORS = [
    "#9f412c",
    "#4e5459",
    "#636d75",
    "#8c5120",
    "#b2b2b2",
    "#ff9717",
    "#3788b4",
    "#ff0000",
    "#5dff00",
    "#0093ff"];
export const TIERS = TIER_CATEGORIES.reduce((acc,current)=>{
    acc = [...acc, ...new Array(5).fill(current).map((c,i)=>`${c} ${5-i}`)];
    return acc;
},[]);