import {createLandClaimer} from "../../src/components/land-claimer";

const entity = new Entity();
engine.addEntity(entity);

const landClaimer = createLandClaimer(entity, {
  position:new Vector3(8,1,8),
  userStorage:{
    onChange:()=>{},
    getState:()=>({
      address:"0x598f8af1565003AE7456DaC280a18ee826Df7a2c",
      PlayFabId:"59DB5EA948C1AE85",
      DM:300
    })
  },
  shape:new BoxShape()
});

