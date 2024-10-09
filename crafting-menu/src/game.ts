import {addStore, globalStore, createStateDebugUI} from "../../scene/src/services/globalStore/globalStore";
import {createCraftingMenu} from "./crafting-menu";
import {generateRandomInventoryValues} from "./util";

createStateDebugUI();

addStore("userData", {
  ...generateRandomInventoryValues(0,16,3)
});

executeTask(async ()=>{
  console.log("SCENE2");
  const craftingMenu = await createCraftingMenu({sprite:{
      source:"images/ui-spritesheet.png",
      sourceWidth:208,
      sourceHeight:81,
      sourceLeft:2,
      sourceTop:226
    },onCraft:(data:any)=>{
    console.log("crafting", data)
    return new Promise((resolve, reject)=>{
      setTimeout(()=>{
        resolve();
      },2000);
    })
  }, wip:true});
});



