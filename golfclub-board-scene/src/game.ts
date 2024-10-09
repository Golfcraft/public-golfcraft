import {globalStore, addStore} from "../../scene/src/services/globalStore/globalStore";
addStore("userData", {
    DM:1,
    WD:10,
    ST:500,
    IR:0
})
import { createGolfclubBoard } from "../../scene/src/components/lobby/golfclub-screen/golfclub-screen-ui";

const root = new Entity();
root.addComponent(new Transform({
  position:new Vector3(8,0,8)
}));

engine.addEntity(root);
const golfclubBoard = createGolfclubBoard(root, {
  PlayFabId:"",
  position:new Vector3(),
  playerGems:1,
  activeGolfClubTokenId:null,
  golfclubCollection:[
    {
      golfclubId:"1",
      tokenId:null,
      xp:999999,
      attributes:{
          power:1,
          control:4,
          aim:5
      }
    },
    {
      golfclubId:"1",
      tokenId:0,
      xp:0,
      attributes:{
          power:0,
          control:0,
          aim:0
      }
    }
]
});

golfclubBoard.onUpgrade(()=>{
  golfclubBoard.updateState({loading:true});
});


golfclubBoard.onSelect((...args)=>{
  console.log("select",...args);
  golfclubBoard.updateState({loading:true});
});
