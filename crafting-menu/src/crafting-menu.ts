import {createInventory} from "../../scene/golfplay/src/components/menu/Inventory/Inventory";
import {getPartsData, loadParts} from "../../scene/golfplay/src/editor/parts-repository";
import {getTexture} from "../../scene/golfplay/services/resource-repo";
import {generateRandomInventoryValues} from "./util";
import {addStore, globalStore, createStateDebugUI} from "../../scene/src/services/globalStore/globalStore";
import {deserializeRecipe, serializeRecipe} from "../../common/utils";
import {getDropChance} from "../../web/server/db-script/calculate-drop-chance";
const materialProcessedNames = {
    WD:"Planks",
    ST:"Stone blocks",
    IR:"Iron bars",
    GD:"Gold bars",
    DM:"Diamonds",
    FT:"Fashion tickets"
};
const materialProcessedChainName:any = {
    WD:"Planks",
    ST:"StoneBlocks",
    IR:"IronBars",
    GD:"GoldBars",
    DM:"DMChain",
    FT:"FashionTickets"
};
export const createCraftingMenu = async ({onCraft, sprite, canvas, wip}:any) => {
    const materialDropsData = await fetch(`https://golfcraftgame.com/api/material-drops`).then(r=>r.json());
    const materialDrops = materialDropsData.reduce((acc:any,current:any)=>{
        acc[current.alias] = current;
        return acc;
    },{});

    const craftingMenu = new UIContainerRect(canvas);
    const partsMenu = new UIContainerRect(craftingMenu);
    const selectedPartPanel= new UIContainerRect(craftingMenu);
    selectedPartPanel.color = new Color4(0,0,0,0.9)
    selectedPartPanel.positionX = -200;
    selectedPartPanel.height = 500;
    selectedPartPanel.width = 200;

    await loadParts(!!wip);
    const commonParts = ["control_area", "direction_area", "explosive_mine"];
    const partsDataEgypt:any = (getPartsData() as any)
        .filter((p:any)=>~p.alias.indexOf("egypt") || ~p.alias.indexOf("image") || ~p.alias.indexOf("text")|| ~commonParts.indexOf(p.alias))
        .filter((p:any)=>wip?p.status !== 3: p.status === 2);
    const partsDataSpace:any = (getPartsData() as any)
        .filter((p:any)=>~p.alias.indexOf("space") || ~p.alias.indexOf("image") || ~p.alias.indexOf("text")|| ~commonParts.indexOf(p.alias))
        .filter((p:any)=>wip?p.status !== 3:p.status === 2);
    const partsDataUrban:any = (getPartsData() as any)
        .filter((p:any)=>~p.alias.indexOf("urban") || ~p.alias.indexOf("image") || ~p.alias.indexOf("text")|| ~commonParts.indexOf(p.alias))
        .filter((p:any)=>wip?p.status !== 3:p.status === 2);
    const partsDataJungle:any = (getPartsData() as any)
        .filter((p:any)=>~p.alias.indexOf("jungle") || ~p.alias.indexOf("image") || ~p.alias.indexOf("text")|| ~commonParts.indexOf(p.alias))
        .filter((p:any)=>wip?p.status !== 3:p.status === 2);
    const partsDataMountain:any = (getPartsData() as any)
        .filter((p:any)=>~p.alias.indexOf("mountain") || ~p.alias.indexOf("image") || ~p.alias.indexOf("text")|| ~commonParts.indexOf(p.alias))
        .filter((p:any)=>wip?p.status !== 3:p.status === 2);
    const partsDataCocobay:any = (getPartsData() as any)
        .filter((p:any)=>~p.alias.indexOf("cocobay") || ~p.alias.indexOf("image") || ~p.alias.indexOf("text")|| ~commonParts.indexOf(p.alias))
        .filter((p:any)=>wip?p.status !== 3:p.status === 2);

    const state = {
        selectedElementData:{...partsDataSpace[0] },
        busy:false
    };
    const callbacks = {
        onCraft,
        onClose:null
    };
    const inventory = createInventory(partsMenu, {
        tabDefinitions:[
            {
                id:"cocobay",
                label:"Cocobay",
                elements:[
                    ...partsDataCocobay.map((part:any)=>{
                        //const recipeObj = deserializeRecipe(part.recipe);
                        return {
                            thumbnail:part.thumbnail64,
                            id:part.alias,
                            alias:part.alias,
                            data:{
                                ...part
                            }
                        }
                    })
                ],
                selected:true
            },
            {
                id:"mountain",
                label:"Mountain",
                elements:[
                    ...partsDataMountain.map((part:any)=>{
                        //const recipeObj = deserializeRecipe(part.recipe);
                        return {
                            thumbnail:part.thumbnail64,
                            id:part.alias,
                            alias:part.alias,
                            data:{
                                ...part
                            }
                        }
                    })
                ],
                selected:true
            },
            {
                id:"jungle",
                label:"Jungle",
                elements:[
                    ...partsDataJungle.map((part:any)=>{
                        //const recipeObj = deserializeRecipe(part.recipe);
                        return {
                            thumbnail:part.thumbnail64,
                            id:part.alias,
                            alias:part.alias,
                            data:{
                                ...part
                            }
                        }
                    })
                ],
                selected:true
            },
            {
                id:"urban",
                label:"Urban",
                elements:[
                    ...partsDataUrban.map((part:any)=>{
                        //const recipeObj = deserializeRecipe(part.recipe);
                        return {
                            thumbnail:part.thumbnail64,
                            id:part.alias,
                            alias:part.alias,
                            data:{
                                ...part
                            }
                        }
                    })
                ],
                selected:true
            },
            {
                id:"space",
                label:"Space",
                elements:[
                    ...partsDataSpace.map((part:any)=>{
                        //const recipeObj = deserializeRecipe(part.recipe);
                        return {
                            thumbnail:part.thumbnail64,
                            id:part.alias,
                            alias:part.alias,
                            data:{
                                ...part
                            }
                        }
                    })
                ],
                selected:true
            },
            {
                id:"egypt",
                label:"Egypt",
                elements:[
                    ...partsDataEgypt.map((part:any)=>{
                        //const recipeObj = deserializeRecipe(part.recipe);
                        return {
                            thumbnail:part.thumbnail64,
                            id:part.alias,
                            alias:part.alias,
                            data:{
                                ...part
                            }
                        }
                    })
                ],
                selected:true
            }
        ],
        width:500,
        height:500,
        slotSize:64
    });
    function translateStoreNameMaterials(recipeObj){
        return Object.keys(recipeObj).reduce((acc:any, key)=>{
            acc[materialProcessedChainName[key]] = recipeObj[key];
            return acc;
        },{})
    }
    console.log("selection", partsDataSpace[0].alias, partsDataSpace[0]);
    inventory.select(partsDataSpace[0].alias);

    const selectedPartImage = new UIImage(selectedPartPanel, getTexture({
        alias:partsDataSpace[0].alias,
        url:`data:image/png;base64,${partsDataSpace[0].thumbnail64}`
    }));
    selectedPartImage.sourceWidth = selectedPartImage.sourceHeight = 64;
    selectedPartImage.width = selectedPartImage.height = 64 ;
    selectedPartImage.vAlign = "top";
    const selectedPartName = new UIText(selectedPartPanel);
    selectedPartName.value = partsDataSpace[0].alias;
    selectedPartName.vAlign = "top";
    selectedPartName.hAlign = "center";
    selectedPartName.hTextAlign = "center";
    selectedPartName.positionY = -20;

    const selectedElement = inventory.getState().currentTab.elements.find(e => e.alias === partsDataSpace[0].alias);
    const recipePanel = createRecipePanel(selectedPartPanel, translateStoreNameMaterials(deserializeRecipe(selectedElement.data.recipe)), spriteTexture)
    inventory.onChangeActiveTab((tab:any) => {
        console.log("tab",tab.getDefinition())
        inventory.select( undefined);
    })

    inventory.onClickItem((item:any)=>{
        console.log("click item", item);
        const {data, id} = item;
        state.selectedElementData = data;
        selectedPartName.value = data.alias;
        inventory.select(id);
        selectedPartImage.source = getTexture({alias:item.id});
        dataPanel.value = getPartDropDescription(data)
        recipePanel.setRecipe(translateStoreNameMaterials(deserializeRecipe(item.data.recipe)));
        craftButton.opacity = canMintSelectedPart(data) ? 1:0.2;
    });

    const dataPanel = new UIText(selectedPartPanel);
    dataPanel.color = Color4.White();
    dataPanel.vTextAlign = "top";
    dataPanel.positionY = -20;
    dataPanel.width = 200;

    dataPanel.value = getPartDropDescription(partsDataSpace[0])
    dataPanel.positionX = 10;
console.log("1")
    const spriteTexture = getTexture(sprite.source)
    console.log("spriteTexture",spriteTexture)
    const craftButton = new UIImage(selectedPartPanel, spriteTexture);
    console.log("2");
    craftButton.sourceWidth = sprite.sourceWidth;
    craftButton.sourceHeight = sprite.sourceHeight;
    craftButton.sourceTop = sprite.sourceTop;
    craftButton.sourceLeft = sprite.sourceLeft;
    //Object.assign(craftButton, sprite)
    console.log("3");
    craftButton.vAlign = "bottom";
    craftButton.positionY = 60;
    craftButton.onClick =  new OnClick(async ()=>{
        //TODO verify it can be minted with resources
        console.log("click");
        if(!canMintSelectedPart(state.selectedElementData) || state.busy){
            console.log("cant mint", state);
            return;
        }

        state.busy = true;
        craftButton.opacity = 0.2;
        console.log("callback", state)
        await (callbacks.onCraft && callbacks.onCraft({...state.selectedElementData, amount:recipePanel.getAmount()}));
        craftButton.opacity = 1;
        state.busy = false;
        console.log("done")
    });

    craftButton.opacity = canMintSelectedPart(inventory.getState().currentTab.elements[0].data) ? 1:0.2;
    const hide = ()=>{
        craftingMenu.visible = false;
        callbacks.onClose && callbacks.onClose();
    }
    const show = () => {
        craftingMenu.visible = true;
    }

    const closeButton = new UIImage(craftingMenu, spriteTexture);//getTexture('images/attribute-plus-active.png'));
    closeButton.sourceWidth = 32;
    closeButton.sourceHeight = 32;
    closeButton.sourceTop = 320;
    closeButton.sourceLeft = 80;
    closeButton.hAlign = "right";
    closeButton.vAlign = "top";
    closeButton.positionY = 230;
    closeButton.positionX = 400;
    closeButton.width = 32;
    closeButton.height = 32;
    closeButton.onClick = new OnClick(()=>{
        hide();
    })
    return {
        show, hide,
        onClose:(fn)=>{
            callbacks.onClose = fn;
        },
        applyStateChange:()=>{
            recipePanel.applyStateChange();
        }
    }

    function canMintSelectedPart(partData:any){
        const {recipe} = partData;
        let _recipe = translateStoreNameMaterials(typeof recipe === "object" ? recipe : deserializeRecipe(recipe));
        const result = Object.keys(_recipe||{}).every((materialKey)=>{
            return (globalStore.userData.getState()[materialKey]||0) >= ((_recipe[materialKey]||0)*recipePanel.getAmount());
        });
        console.log("canMint", result);

        return result;
    }

    function getPartDropDescription(data:any = {}){
        const ALIAS_POINTS:any = {
            "woody":0.73,
            "stony":1.01,
            "normal":1,
            "goldy":4.5,
            "irony":2.3
        }
        const {drop_alias, recipe} = data;
        const drop_chance = getDropChance(drop_alias, recipe);
        if(!drop_alias) return "??"
        const materialKeys = Object.keys(materialDrops[drop_alias])
            .filter(prop => prop!=="ID"&&prop!=="alias");

        const drop = materialDrops[drop_alias];
        const allMaterialsWeight = materialKeys.reduce((acc, key)=>{
            return acc + materialDrops[drop_alias][key];
        },0);
        return `${(drop_chance * ALIAS_POINTS[drop_alias]).toFixed(2)}\n<color=#777777>`+materialKeys
            .map(materialKey => {
                const materialWeigth = drop[materialKey];
                return `${materialKey} ${((materialWeigth/allMaterialsWeight*100)*(drop_chance/100)).toFixed(2)}`;
            })
            .join(`\n`) + `</color>`;
    }
}

const createRecipePanel = (parent:UIShape, recipe:any, spriteTexture:any)=>{
    const state = {
        amount:1,
        recipe:{
            DMChain:0,
            Planks:0,
            StoneBlocks:0,
            IronBars:0,
            GoldBars:0,
            ...recipe,
        }
    }
    const container = new UIContainerRect(parent);
   // container.color = new Color4(0,1,0,0.5);
    container.vAlign = "top";
    container.positionY = -100;
    container.width = 200;
    const keys = Object.keys(state.recipe);
    const labels = keys.map((key, index) => {
        const label = new UIText(container);
        label.fontSize = 12;
        label.hAlign = "left";
        label.vAlign = "top";
        label.value = `${key.padEnd(25)}${state.recipe[key].toString().padEnd(5, " ")}(${globalStore.userData.getState()[key]||0})`;
        label.color = state.recipe[key] <= (globalStore.userData.getState()[key]||0) ? Color3.Green() : Color3.Red();
        label.height = 20;
        label.positionX = 10;
        label.positionY = -index*20;
        return label;
    });

    /*
    const closeButton = new UIImage(craftingMenu, spriteTexture);//getTexture('images/attribute-plus-active.png'));
    closeButton.sourceWidth = 32;
    closeButton.sourceHeight = 32;
    closeButton.sourceTop = 320;
    closeButton.sourceLeft = 80;
    closeButton.hAlign = "right";
    closeButton.vAlign = "top";
    closeButton.positionY = 230;
    closeButton.positionX = 400;
    closeButton.width = 32;
    closeButton.height = 32;
    */

    //const spriteTexture = getTexture("images/ui-spritesheet.png")

    const leftArrow = new UIImage(parent, spriteTexture);
    leftArrow.sourceWidth = leftArrow.sourceHeight = 16;
    leftArrow.sourceTop = 328;
    leftArrow.sourceLeft = 111;
    leftArrow.hAlign = "left";
    leftArrow.vAlign = "top";
    leftArrow.positionX = 30;
    leftArrow.positionY = -80;
    leftArrow.height = leftArrow.width = 16;
    leftArrow.onClick = new OnClick(()=>{
        state.amount = Math.max(1, state.amount-1);
        applyStateChange();
    });

    const rightArrow = new UIImage(parent, spriteTexture);
    rightArrow.sourceWidth = rightArrow.sourceHeight = 16;
    rightArrow.sourceTop = 328;
    rightArrow.sourceLeft = 127;
    rightArrow.hAlign = "left";
    rightArrow.vAlign = "top";
    rightArrow.positionX = 140;
    rightArrow.positionY = -80;
    rightArrow.height = rightArrow.width = 16;
    rightArrow.onClick = new OnClick(()=>{
        console.log("right");
        state.amount = state.amount + 1;
        applyStateChange()
    });
    const amountLabel = new UIText(parent);
    amountLabel.vAlign = "left";
    amountLabel.hAlign = "top";
    amountLabel.hTextAlign = "left";
    amountLabel.vTextAlign = "top";
    amountLabel.positionX = 40;
    amountLabel.positionY = 140;
    amountLabel.value = String(state.amount);
    amountLabel.paddingRight = 0;
    amountLabel.isPointerBlocker = false;
    function applyStateChange(){
        console.log("amount", state.amount)
        amountLabel.value = String(state.amount);
        const keys = Object.keys(state.recipe);
        keys.forEach((key,index)=>{
            labels[index].value = `${key.padEnd(25)}${(state.recipe[key]*state.amount).toString().padEnd(5, " ")}(${globalStore.userData.getState()[key]||0})`;
            labels[index].color = (state.recipe[key]*state.amount) <= (globalStore.userData.getState()[key]||0) ? Color3.Green() : Color3.Red()
        })
    }
    return {
        applyStateChange:()=>applyStateChange(),
        setRecipe:(recipe)=>{
            Object.assign(state.recipe,{
                DMChain:0,
                Planks:0,
                StoneBlocks:0,
                IronBars:0,
                GoldBars:0,
                ...recipe,
            })
            applyStateChange();
        },
        getMaterials:()=>{
            return Object.keys(state.recipe).reduce((acc:any, key)=>{
                acc[key] = state.recipe[key] * state.amount;
                return acc;
            },{})
        },
        getAmount:()=>state.amount
    }
}