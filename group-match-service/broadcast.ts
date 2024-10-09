import {tryFetch} from "../server/utils/try-fetch";

const GAMEPLAY_SERVER_URL = {
    "US":"https://ws3.golfcraftgame.com",
    "EU":"https://ws2.golfcraftgame.com",
    "AU":"https://ws4.golfcraftgame.com",
    "LOCAL":"http://localhost:2567"
};

/* export const WS_GAMEPLAY_SERVER_URL = {
  "US":"wss://ws3.golfcraftgame.com",
  "EU":"wss://ws2.golfcraftgame.com",
  "LOCAL":"ws://localhost:2567"
}; */

export const broadcastPerServer = (group, key) => {
  const players = Object.values(group.players)||[];
  const serverPlayersMap = Object.keys(GAMEPLAY_SERVER_URL).reduce((acc,current)=>{
    const playersOnThisServer = players.filter((p:any)=>p.server === current);
    if( playersOnThisServer?.length){
      acc[current] = {
        players:playersOnThisServer,
        groupId:group.id
      };
    }
    return acc;
  },{});
  Object.keys(serverPlayersMap).forEach((server)=>{
    const players = serverPlayersMap[server].players;
    
    tryFetch(3,`${GAMEPLAY_SERVER_URL[server]}/${key}`, {
      method:'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({
        groupId:group.id,
        players
      })
    });
  }); 
};
