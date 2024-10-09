import {getCanvas} from "../../../../golfplay/services/canvas";
import {getTexture} from "../ui-texture";
import {materialsDef, mainBarDef, golfClubThumbnailDef, golfClubNameDef} from "./lobby-ui-elements-def";
import {getLevelInfo, serializeRecipe, sleep} from "../../../../../common/utils";
import { registerSound, reproduceAvatarSound } from "../../../services/avatar-sound";

registerSound("ui_profile_inv_open");
registerSound("ui_profile_inv_close");
registerSound("ui_profile_dailymission_open");
registerSound("ui_profile_dailymission_close");


export const createLobbyUi = (initialState:LobbyUiElements) => {
    const canvas = getCanvas();
    const state = {
       open:0
    };

    const _initialState:any = initialState||{GC:100};
    const texture = getTexture(`images/ui-spritesheet.png`, {hasAlpha:1});
    const topRightContainer = createTopRightContainer(texture);
    const mainBarElements = createTextElements(topRightContainer, mainBarDef, _initialState, {vAlign:"top", hAlign:"right"});
    const golfclub = createGolfClub(_initialState);
    const materials = createMaterials(texture);
    const materialElements = createTextElements(topRightContainer, materialsDef, _initialState,{vAlign:"top", hAlign:"right"});
    const playerPanel = createPlayerPanel(_initialState.xp||0);
    const dailyMissions = createDailyMissions(topRightContainer, initialState.dailyMissionsData);
    const {connectedServer, connectedBar} = createSelectedServerUi(initialState);

    createClickableArea({onClick:new OnClick(()=>{//materials
        state.open = state.open === 1? 0:1;
        state.open == 1 ? reproduceAvatarSound("ui_profile_inv_open") : reproduceAvatarSound("ui_profile_inv_close")
        applyState()
    }), positionX:-8, positionY:-10});
    createClickableArea({onClick:new OnClick(()=>{}), positionX:-8, positionY:-80, height:100});
    createClickableArea({onClick:new OnClick(()=>{}), positionX:-8, positionY:-190, height:80});
    createClickableArea({onClick:new OnClick(()=>{//daily missions
        // Disabled
        //state.open = state.open === 2? 0:2;
        //state.open == 2 ? reproduceAvatarSound("ui_profile_dailymission_open") : reproduceAvatarSound("ui_profile_dailymission_close")
        //applyState()
    }), positionX:-8, positionY:-280});
    createClickableArea({onClick:new OnClick(()=>{
        openExternalURL("https://golfcraftgame.com");
    }), positionX:-8, positionY:-350})
    applyState();

    return {
        updateSelectedServer:({gameState}:any)=>{
            if(~gameState.selectedServer.indexOf("ws2")){
                connectedServer.value = "EU";
            }else if(~gameState.selectedServer.indexOf("ws3")){
                connectedServer.value = "US";
            }else if(~gameState.selectedServer.indexOf("ws4")){
                connectedServer.value = "AU";
            }else{
                connectedServer.value = "LO";
            }
            if(gameState.connected && !gameState.reconnecting && !gameState.connecting){
                connectedBar.color = Color4.Green();
            }else{
                connectedBar.color = Color4.Red();
            }
        },
        hide:()=>{
            topRightContainer.visible = false;
        },
        show:()=>{
            topRightContainer.visible = true;
        },
        updateElements:(state:LobbyUiElements)=>{
            Object.keys(state).forEach((key)=>{
                if(key === "xp"){
                    playerPanel.updateXp(state.xp);
                }else if(mainBarElements[key]){
                    mainBarElements[key].setValue(state[key]);
                }
            });
        },
        updateProp:(prop:string, value:string|number)=>{
            if(prop === "xp"){
                playerPanel.updateXp(value);
            }else{
                mainBarElements[prop] && mainBarElements[prop].setValue(value);
                materialElements[prop] && materialElements[prop].setValue(value);
            }
        },
        updateActiveGolfClub: ({id, name}:{id:number|string, name:string})=>{
            golfclub.updateGolfClub({id, name});
        },
        updateDailyMissionData:(dailyMissionsData:any)=>{
            dailyMissions.update(dailyMissionsData);
        }
    }

    function createSelectedServerUi(gameState:any){
        const connectedServer = new UIText(topRightContainer);
        connectedServer.fontSize = 10;
        connectedServer.paddingLeft = 0;
        connectedServer.height = 20;
        connectedServer.width = 30;
        connectedServer.value = "--";
        const connectedBar = new UIContainerRect(topRightContainer);
        connectedBar.width = 4;
        connectedBar.height = 10;
        connectedBar.color = Color4.Gray();
        connectedBar.vAlign = connectedServer.vAlign = "top";
        connectedBar.hAlign = connectedServer.hAlign = "left";
        connectedServer.positionY = -460;
        connectedServer.positionX = 80;
        connectedBar.positionY = -470;
        connectedBar.positionX = 70;
        if(gameState.selectedServer){
            if(~gameState.selectedServer.indexOf("ws2")){
                connectedServer.value = "EU";
            }else if(~gameState.selectedServer.indexOf("ws3")){
                connectedServer.value = "US";
            }else if(~gameState.selectedServer.indexOf("ws4")){
                connectedServer.value = "AU";
            }else{
                connectedServer.value = "??";
            }
        }

        if(gameState?.connected && !gameState?.reconnecting && !gameState?.connecting){
            connectedBar.color = Color4.Green();
        }else{
            connectedBar.color = Color4.Red();
        }

        return {connectedServer, connectedBar};
    }

    function applyState(){
        if(state.open === 1){
            materials.show();
            dailyMissions.hide();
            Object.values(materialElements).forEach((materialElement:any) => materialElement.show());
        }else if(state.open === 0){
            materials.hide();
            dailyMissions.hide();
            Object.values(materialElements).forEach((materialElement:any) => materialElement.hide());
        }else if(state.open === 2){
            materials.hide();
            dailyMissions.show();
            Object.values(materialElements).forEach((materialElement:any) => materialElement.hide());
        }
    }
    function createPlayerPanel(xp:number){
        const {currentLevel, progressPercentage} = getLevelInfo(xp||0);
        const bg = new UIImage(topRightContainer, texture);
        bg.sourceLeft = 1587;
        bg.sourceTop = 1697;
        bg.sourceWidth = 342;
        bg.sourceHeight = 82;
        bg.width = bg.sourceWidth/1.5;
        bg.height = bg.sourceHeight/1.5;
        bg.vAlign = "top";
        bg.hAlign = "right";
        bg.isPointerBlocker = false;
        bg.positionY = -6;
        bg.positionX = -201

        const lvlText = new UIText(topRightContainer);
        lvlText.color = Color4.Black();
        lvlText.positionY = 0;
        lvlText.positionX = -180;
        lvlText.fontSize = 14;
        const percentageBar = new UIImage(topRightContainer, texture);
        percentageBar.vAlign = "top";
        percentageBar.hAlign = "left";
        percentageBar.sourceWidth = 4;
        percentageBar.sourceHeight = 22;
        percentageBar.sourceLeft = 1886;
        percentageBar.sourceTop = 1998;
        percentageBar.height = 22/1.5;
        percentageBar.positionY = -33;
        percentageBar.positionX = -132;
        const percentage = new UIText(topRightContainer);

        percentage.color = Color4.Black();
        percentage.positionX = -14;
        percentage.positionY = 3;
        lvlText.vAlign = percentage.vAlign = "top";
        lvlText.hAlign = percentage.hAlign = "right";

        lvlText.value = `Lv. ${currentLevel.toString().padStart(2, "0")}`;
        percentage.value = `${progressPercentage.toString().padStart(2, "0")}%`;
        percentageBar.width = 140 * (progressPercentage/100);

        return {
            updateXp:(xp:number)=>{
                const {currentLevel, progressPercentage} = getLevelInfo(xp||0);
                lvlText.value = `Lv. ${currentLevel.toString().padStart(2, "0")}`;
                percentage.value = `${progressPercentage.toString().padStart(2, "0")}%`;
                percentageBar.width = 140 * (progressPercentage/100);
            }
        }
    }
    function createMaterials(texture){
        const image = new UIImage(topRightContainer, texture);
        image.sourceLeft = 1360;
        image.sourceTop = 1797;
        image.sourceWidth = 564;
        image.sourceHeight = 183;
        image.width = 564/1.5;
        image.height = 183/1.5;
        image.vAlign = "top";
        image.hAlign = "right";
        image.positionX = -350;
        image.positionY = -80;
        const openseaLink = createOpenseaLink();
        return {
            hide:()=>{
                image.visible = false;
                openseaLink.hide();
            },
            show:()=>{
                image.visible = true;
                openseaLink.show();
            }
        }

        function createOpenseaLink(){
            const opensea = new UIImage(canvas, getTexture(""));
            opensea.opacity = 0;
            opensea.width = opensea.height  = 36;
            opensea.vAlign = "top";
            opensea.hAlign = "right";
            opensea.positionX = -80;
            opensea.positionY = -82;
            opensea.onClick = new OnClick(()=>{
                openExternalURL("https://opensea.io/collection/golfcraftmaterials");
            });
            return {
                hide:()=>opensea.visible = false,
                show:()=>opensea.visible = true
            }
        }
    }

    function createGolfClub(_initialState:any){
        const golfclubThumbnail = new UIImage(topRightContainer, getTexture(`images/1.png`))
        golfclubThumbnail.sourceHeight = 256;
        golfclubThumbnail.sourceWidth = 256;
        golfclubThumbnail.width = 32*1.5;
        golfclubThumbnail.height = 32*1.5;
        golfclubThumbnail.vAlign = "top";
        golfclubThumbnail.hAlign = "right";
        golfclubThumbnail.positionX = golfClubThumbnailDef[0];
        golfclubThumbnail.positionY = golfClubThumbnailDef[1];
        const golfClubId = _initialState.GolfClubId || 0;
        golfclubThumbnail.isPointerBlocker = false;
        const golfclubName = _initialState.GolfClubName || "Golf club"

        golfclubThumbnail.source = getTexture(`images/${golfClubId}.png`);

        const golfclubNameSourceWidth = 512;
        const golfclubNameSourceHeight= 140;
        const texture = getTexture(`https://golfcraftgame.com/api/text-image?text=${golfclubName}&font=Teko-SemiBold&imageWidth=${golfclubNameSourceWidth}&imageHeight=${golfclubNameSourceHeight}&textWidth=300&c=1`);

        const golfclbuName = new UIImage(topRightContainer, texture)
        golfclbuName.isPointerBlocker = false;
        golfclbuName.positionX = golfClubNameDef[0];
        golfclbuName.positionY = golfClubNameDef[1];
        golfclbuName.sourceWidth = golfclubNameSourceWidth;
        golfclbuName.sourceHeight = golfclubNameSourceHeight;
        const rate = 5;
        golfclbuName.height = golfclubNameSourceHeight/rate;
        golfclbuName.width = golfclubNameSourceWidth/rate;
        golfclbuName.vAlign = "top";
        golfclbuName.hAlign = "right";
        golfclbuName.opacity = 0.9;

        return {
            updateGolfClub:({id, name}:any) => {
                golfclbuName.source = getTexture(`https://golfcraftgame.com/api/text-image?text=${name}&font=Teko-SemiBold&imageWidth=${golfclubNameSourceWidth}&imageHeight=${golfclubNameSourceHeight}&textWidth=300&c=1`);
                golfclubThumbnail.source = getTexture(`images/${id}.png`);
            }
        }
    }
    function createTopRightContainer(texture){
        const bottomRightContainer = new UIContainerRect(canvas);
        bottomRightContainer.vAlign = "top";
        bottomRightContainer.hAlign = "right";
        bottomRightContainer.positionY = 72;
        bottomRightContainer.width = 100;
        bottomRightContainer.height = 1071;
        bottomRightContainer.isPointerBlocker = false;
     // bottomRightContainer.color = Color4.Blue();

        const image = new UIImage(bottomRightContainer, texture);
        image.sourceWidth = 111;
        image.sourceHeight = 1071;
        image.sourceLeft = 1938;
        image.sourceTop = 0;
        image.width = 111/1.5;
        image.height = 1071/1.5;
       // image.positionY = -5;
       // image.positionX = 8;
        image.vAlign = "top";
        image.hAlign = "right";
        return bottomRightContainer;
    }
    function createTextElements(container, elementsDef:any, _initialState:any, {vAlign, hAlign}:any){
        return Object.keys(elementsDef).reduce((acc, key)=>{
            acc[key] = createBarElement(container, {
                initialValue:_initialState[key],
                positionX:elementsDef[key][0],
                positionY:elementsDef[key][1],
                fontSize:elementsDef[key][2],
                pad:elementsDef[key][3],
                vAlign,
                hAlign
            })
            return acc;
        },{} as any);
    }
    function createClickableArea({onClick, positionX, positionY, width, height}:any){
        const opensea = new UIImage(canvas, getTexture(""));
        opensea.opacity = 0;
        opensea.width = width || 60;
        opensea.height  = height || 60;
        opensea.vAlign = "top";
        opensea.hAlign = "right";
        opensea.positionX = positionX;
        opensea.positionY = positionY;
        opensea.onClick = onClick;

    }

}
const textColor = Color4.FromHexString("#545454");

const createBarElement = (container:UIShape, {initialValue, positionX, positionY, vAlign, hAlign, fontSize, pad}:any) => {
    const text = new UIText(container);
    text.value = (initialValue||"0").toString().padStart(pad||0, "0");
    text.vAlign = vAlign || "top";
    text.hAlign = hAlign || "left";
    text.hTextAlign = "left";
    text.isPointerBlocker = false;
    text.height = 32;
    text.isPointerBlocker = false;
    text.fontSize = fontSize || 14;
    text.color = textColor;
    text.paddingRight = 20;
    text.lineSpacing = 10;
    text.adaptWidth = true;
    text.positionX = positionX;
    text.positionY = positionY;


    return {
        hide:()=>{
            text.visible = false;
        },
        show:()=>{
            text.visible = true;
        },
        setValue:(value:any)=> {
            text.value = value;
        },
        getValue:()=>text.value,
        getOptions:()=>({positionX,positionY})
    };
}

function createDailyMissions (parent:any, data:any) {
    const texture = getTexture(`images/ui-spritesheet.png`, {hasAlpha:true});
    const bg = new UIImage(parent, texture);
    bg.sourceWidth = 559;
    bg.sourceHeight = 388;
    bg.sourceTop = 1293;
    bg.sourceLeft = 1364;
    bg.width = bg.sourceWidth/1.5;
    bg.height = bg.sourceHeight/1.5;
    bg.vAlign = "top";
    bg.hAlign = "right";
    bg.positionX = -344;
    bg.positionY  = -160;
    const list = new UIContainerRect(parent);
    list.color = new Color4(0,0,0,0);
    list.vAlign = "top";
    list.hAlign = "right";
    list.width = 360;
    list.height = 300;
    list.positionX = -334;
    list.positionY = -160;

    const listText = new UIText(list);
    listText.paddingLeft = listText.paddingTop = 10;
    listText.fontSize = 14;
    listText.hAlign = "left";
    listText.vAlign = "top";
    listText.hTextAlign = "left";
    listText.vTextAlign = "top";
    update(data);
    const STATE_ICON_DEF:any = {
        //sourceLeft, sourceTop, sourceWidth, sourceHeight
        COMPLETED:[1288, 1299,60, 60],
        ACTIVE:[1288, 1381,60,60],
        BLOCKED:[1288,1459,60,60]
    }
    const missionStateIcons = Array(5).fill(null).map((m,i:any)=>{
        const img = new UIImage(list, texture);
        const dailyMissionIndex = data.dailyMissionIndex;

        let sourceLeft, sourceTop, sourceWidth, sourceHeight;
        if(i === dailyMissionIndex){
            [sourceLeft, sourceTop, sourceWidth, sourceHeight] = STATE_ICON_DEF.ACTIVE;
            img.sourceLeft = sourceLeft;
            img.sourceTop = sourceTop;
            img.sourceWidth = sourceWidth;
            img.sourceHeight = sourceHeight;
        }else if(i > dailyMissionIndex){
            [sourceLeft, sourceTop, sourceWidth, sourceHeight] = STATE_ICON_DEF.BLOCKED;
            img.sourceLeft = sourceLeft;
            img.sourceTop = sourceTop;
            img.sourceWidth = sourceWidth;
            img.sourceHeight = sourceHeight;
        }else{
            [sourceLeft, sourceTop, sourceWidth, sourceHeight] = STATE_ICON_DEF.COMPLETED;
            img.sourceLeft = sourceLeft;
            img.sourceTop = sourceTop;
            img.sourceWidth = sourceWidth;
            img.sourceHeight = sourceHeight;
        }
        img.height = img.width = 60/1.5;
        img.vAlign = "top";
        img.hAlign = "right";
        img.positionX = -14;
        img.positionY = -i*50 - 10;
        return img;
    })
    return {
        update,
        hide:()=>{
            bg.visible = false;
            list.visible = false;
        },
        show:()=>{
            bg.visible = true;
            list.visible = true;
        }
    }

    function update(dailyMissionsData:any = {}){
            const missions = dailyMissionsData?.state?.missions || [];
            listText.value = missions.map((m, index) => {
                const {dailyMissionIndex, dailyMissionStep}  = dailyMissionsData;
                let str = `<color=${index > dailyMissionIndex?`#999999`: (index === dailyMissionIndex)?`#2c64ce`:`#7fa15b`}><b>${m.description} ${index === dailyMissionIndex && dailyMissionStep ? `(${dailyMissionStep})`:``}</b> \nRewards: ${serializeRecipe(m.rewards)}</color>`
                return str;
            })
                .join("\n\n");
            const dailyMissionIndex = dailyMissionsData.dailyMissionIndex;
            console.log("dailyMissionIndex",dailyMissionIndex,missionStateIcons);
            (missionStateIcons||[]).forEach((img:UIImage, i:number)=>{
                let sourceLeft, sourceTop, sourceWidth, sourceHeight;
                if(i === dailyMissionIndex){
                    [sourceLeft, sourceTop, sourceWidth, sourceHeight] = STATE_ICON_DEF.ACTIVE;
                    img.sourceLeft = sourceLeft;
                    img.sourceTop = sourceTop;
                    img.sourceWidth = sourceWidth;
                    img.sourceHeight = sourceHeight;
                }else if(i > dailyMissionIndex){
                    [sourceLeft, sourceTop, sourceWidth, sourceHeight] = STATE_ICON_DEF.BLOCKED;
                    img.sourceLeft = sourceLeft;
                    img.sourceTop = sourceTop;
                    img.sourceWidth = sourceWidth;
                    img.sourceHeight = sourceHeight;
                }else{
                    [sourceLeft, sourceTop, sourceWidth, sourceHeight] = STATE_ICON_DEF.COMPLETED;
                    img.sourceLeft = sourceLeft;
                    img.sourceTop = sourceTop;
                    img.sourceWidth = sourceWidth;
                    img.sourceHeight = sourceHeight;
                }
            })
    }
}
export type LobbyUiElements = {
    GC?:number|string,
    FT?:number|string,
    PT?:number|string,
    DT?:number|string,
    ST?:number|string,
    IR?:number|string,
    GD?:number|string,
    DM?:number|string,
    WD?:number|string,
    SR?:number|string,
    DMChain?:number|string,
    Planks?:number|string,
    StoneBlocks?:number|string,
    IronBars?:number|string,
    GolfBars?:number|string,
    TrainingBonus?:number|string,
    FarmingBonus?:number|string,
    GolfClubPower?:number|string,
    GolfClubControl?:number|string,
    GolfClubAim?:number|string,
    GolfClubName?:string,
    GolfClubId?:number|string,
    xp?:number,
    dailyMissionsData?:any
}