import { getLevelInfo } from "../../../../../common/utils";
import {getGLTFShape, getTexture} from "../../../../golfplay/services/resource-repo";
import {globalStore} from "../../../services/globalStore/globalStore";
import {showMessage} from "../../server-notification";
import {atlasAnalytics} from "../../../atlas-analytics-service";

import {registerSound, reproduceAvatarSound} from "../../../services/avatar-sound";
import {createScreenBar} from "./screen-bar";
import {createHandlerFrom} from "./button-handler";
import {createAttributeUpdateButton} from "./attribute-update-button";
import {createScreenIconWithValue} from "./screen-icon-with-value";

registerSound("ui_club_select");
registerSound("ui_club_next");
registerSound("ui_club_previous");
registerSound("ui_club_inc_power");
registerSound("ui_club_inc_aim");
registerSound("ui_club_inc_control");

const createGolfclubBoard = (parent:Entity, {PlayFabId, position, rotation, golfclubCollection, activeGolfClubTokenId}:any) => {
    const callbacks:any = {
        onSelect:null,
        onUpgrade:null,
        onMint:null
    };

    const foundGolfclubIndex = golfclubCollection.findIndex((g:any)=>g.tokenId === activeGolfClubTokenId);
    console.log("foundGolfclubIndex",foundGolfclubIndex)
    const indexOfStandard = golfclubCollection.findIndex(g=>g.golfclubId == "1");
    const state:any = {
        loading:false,
        section:1,
        currentGolfClub:foundGolfclubIndex>=0?foundGolfclubIndex:indexOfStandard,
        activeGolfClubTokenId,
        golfclubCollection,
        upgradingAttribute:null,
    };

    const entity = new Entity();
    const boardShape = getGLTFShape(`models/board.glb`);
    boardShape.isPointerBlocker = false;
    entity.addComponent(boardShape);
    entity.addComponent(new Transform({position, rotation}));
    entity.setParent(parent);

    const levelBar = createScreenBar(entity, {
        position:new Vector3(0,2.9,0), 
        scale:new Vector3(1.8,0.15,1),
        value:1
    });

    const thumbnail = new Entity();
    const thumbnailShape = new PlaneShape();
    //thumbnailShape.isPointerBlocker = false;//TODO DCL BUG: makes non visible
    thumbnailShape.visible = true;
    const material = new Material();
    const texture = getTexture(`images/${state.golfclubCollection[state.currentGolfClub].golfclubId}.png`);
    material.albedoTexture = texture;
    material.emissiveTexture = texture;
    material.emissiveIntensity = 2;
   material.emissiveColor = Color3.White();
    thumbnail.addComponent(material);
    thumbnail.addComponent(new Transform({
        scale:new Vector3(-1.4, -1.4, -1),
        position:new Vector3(-0.8, 2.5, 0)
    }));
    thumbnail.addComponent(thumbnailShape);
    thumbnail.setParent(entity);
    

    const arrowLeft = new Entity();
    const arrowLeftShape = new PlaneShape();
    arrowLeftShape.isPointerBlocker = false;
    arrowLeftShape.withCollisions = false;
    const arrowLeftTexture = new Texture(`images/arrow-left.png`);
    const arrowLeftMat = new Material();
    arrowLeftMat.alphaTexture = arrowLeftTexture;
    arrowLeftMat.emissiveTexture = arrowLeftTexture;
    arrowLeftMat.albedoTexture = arrowLeftTexture;
    arrowLeftMat.emissiveColor = Color3.Yellow();
    arrowLeftMat.emissiveIntensity = 3;
    arrowLeft.addComponent(arrowLeftShape);
    arrowLeft.addComponent(arrowLeftMat);
    arrowLeft.addComponent(new Transform({
        position: new Vector3(-1.8, 2.35, 0),
        scale:new Vector3(-0.5,-0.5,-0.5)
    }));
    arrowLeft.setParent(entity);

    const arrowRight = new Entity();
    const arrowRightShape = new PlaneShape();
    const arrowRightTexture = new Texture(`images/arrow-right.png`);
    const arrowRightMat = new Material();
    arrowRightMat.alphaTexture = arrowRightTexture;
    arrowRightMat.emissiveTexture = arrowRightTexture;
    arrowRightMat.albedoTexture = arrowRightTexture;
    arrowRightMat.emissiveColor = Color3.Yellow();
    arrowRightMat.emissiveIntensity = 3;
    arrowRight.addComponent(arrowRightShape);
    arrowRight.addComponent(arrowRightMat);
    arrowRight.addComponent(new Transform({
        position: new Vector3(1.8, 2.35, 0),
        scale:new Vector3(-0.5,-0.5,-0.5)
    }));
    arrowRight.setParent(entity);

    const attributes = new Entity();
    const attributesShape = new PlaneShape();
    //attributesShape.isPointerBlocker = false;//TODO SDK BUG: makes non visible
    const attribtesTexture = new Texture(`images/attributes.png`);
    const attributesMat = new Material();
    attributesMat.albedoTexture = attribtesTexture;
    attributesMat.emissiveTexture = attribtesTexture;
    attributesMat.alphaTexture = attribtesTexture;
    attributesMat.emissiveColor = Color3.Yellow();
    attributesMat.emissiveIntensity = 3;
    attributes.addComponent(attributesShape);
    attributes.addComponent(attributesMat);
    attributes.addComponent(new Transform({
        position: new Vector3(0.35, 2.65, 0),
        scale: new Vector3(-1, -1.1, -1)
    }));
    attributes.setParent(entity);

    const attributesText = new Entity();
    const attributesTextShape = new TextShape();
    const initialGolfClub = state.golfclubCollection[state.currentGolfClub];
    console.log("initialGolfClub",initialGolfClub)
    attributesTextShape.value = `${getLevelFromAttributes(initialGolfClub.attributes)}\n\n${initialGolfClub.attributes.power}\n${initialGolfClub.attributes.control}\n${initialGolfClub.attributes.aim}\n${initialGolfClub?.DisplayName}`;
    attributesTextShape.lineCount = 6;
    attributesTextShape.hTextAlign = "left";
    attributesTextShape.vTextAlign = "top";
    attributesTextShape.fontSize = 2;
    attributesText.addComponent(attributesTextShape);
    attributesText.addComponent(new Transform({
        position: new Vector3(0.9, 3.23, 0),
    }))
    attributesText.setParent(entity);


    const selectButton = new Entity();
    const selectButtonShape = new PlaneShape();
    const selectButtonTexture = new Texture(`images/select.png`);
    const selectButtomMaterial = new Material();
    
    selectButton.addComponent(selectButtonShape);
    selectButtomMaterial.albedoTexture = selectButtonTexture;
    selectButtomMaterial.emissiveTexture = selectButtonTexture;
    selectButtomMaterial.alphaTexture = selectButtonTexture;
    selectButtomMaterial.emissiveColor = Color3.Yellow();
    selectButtomMaterial.emissiveIntensity = 3;
    selectButton.addComponent(new Transform({
        position: new Vector3(-0.8, 1.5, -0.01),
        scale:new Vector3(-1,-0.4,-1)
    }));
    selectButton.addComponent(selectButtomMaterial);
    selectButton.setParent(entity);

    const selectHandler = createHandlerFrom(selectButton,state, ()=>{
        reproduceAvatarSound("ui_club_select");
        state.activeGolfClubTokenId = state.golfclubCollection[state.currentGolfClub].tokenId;
        callbacks.onSelect && callbacks.onSelect({golfclub:state.golfclubCollection[state.currentGolfClub]});
        atlasAnalytics.submitGenericEvent(`gbc-club-select`);
    }, {
        hoverText:'Select this golfclub for playing',
        button:ActionButton.POINTER
    });

    const activeButton = new Entity();
    const activeButtonShape = new PlaneShape();
    const activeButtonTexture = new Texture(`images/active.png`);
    const activeButtomMaterial = new Material();

    activeButton.addComponent(activeButtonShape);
    activeButtomMaterial.albedoTexture = activeButtonTexture;
    activeButtomMaterial.emissiveTexture = activeButtonTexture;
    activeButtomMaterial.alphaTexture = activeButtonTexture;
    activeButtomMaterial.emissiveColor = Color3.Yellow();
    activeButtomMaterial.emissiveIntensity = 3;
    activeButton.addComponent(new Transform({
        position: new Vector3(-0.8, 1.5, -0.01),
        scale:new Vector3(-1,-0.4,-1)
    }));
    activeButton.addComponent(activeButtomMaterial);
    activeButton.setParent(entity);
   
    
    const materialCost = createScreenIconWithValue(entity, {
        position:new Vector3(0.45, 1.85, -0.01),
        value:1,
        src:`images/screen-icon-WD.png`
    });
    materialCost.hide();

    const confirmButton = new Entity();
    const confirmTexture = new Texture(`images/confirm.png`);
    const confirmMaterial = new Material();
    
    confirmMaterial.albedoTexture = confirmTexture;
    confirmMaterial.emissiveTexture = confirmTexture;
    confirmMaterial.alphaTexture = confirmTexture;
    confirmMaterial.emissiveColor = Color3.Yellow();
    confirmMaterial.emissiveIntensity = 3;
    const confirmButtonShape = new PlaneShape();
    confirmButtonShape.isPointerBlocker = false;
    confirmButton.addComponent(confirmButtonShape);
    confirmButton.addComponent(confirmMaterial);
    confirmButton.addComponent(new Transform({
        position:new Vector3(0.8,1.5,-0.01),
        scale:new Vector3(-1,-0.3,-1)
    }));
    confirmButton.setParent(entity);
    const confirmHandler = createHandlerFrom(confirmButton,state, ()=>{
        const data = {
            attribute:state.upgradingAttribute,
            ItemInstanceId:state.golfclubCollection[state.currentGolfClub].ItemInstanceId
        }
        callbacks.onUpgrade && callbacks.onUpgrade(data);
    },{
        hoverText:'Confirm upgrade',
        button:ActionButton.POINTER
    })
    const mintButton = new Entity();
    const mintTexture = new Texture(`images/mint.png`);
    const mintMaterial = new Material();
    mintMaterial.albedoTexture = mintTexture;
    mintMaterial.emissiveTexture = mintTexture;
    mintMaterial.alphaTexture = mintTexture;
    mintMaterial.emissiveColor = Color3.Yellow();
    mintMaterial.emissiveIntensity = 3;
    const mintShape = new PlaneShape();
    mintButton.addComponent(mintShape);
    mintButton.addComponent(mintMaterial);
    mintButton.addComponent(new Transform({
        position:new Vector3(0.8,1.5,-0.01),
        scale:new Vector3(-1,-0.3,-1) 
    }));
    mintButton.setParent(entity);
    mintShape.visible = false;
    const mintHandler = createHandlerFrom(mintButton,state, async ()=>{
        state.loading = true;
        callbacks.onMint && callbacks.onMint();
        atlasAnalytics.submitGenericEvent(`gbc-club-mint`);
        updateViewFromState();
     },{
         hoverText:"Mint golf club",
         button:ActionButton.POINTER
     })
    const insufficient = new Entity();
    const insufficientShape = new PlaneShape();
    insufficientShape.isPointerBlocker = false;
    insufficientShape.withCollisions = false;
    insufficientShape.visible = false;
    const insufficientMaterial = new Material();
    const insufficientTexture = new Texture(`images/insufficient.png`);
    insufficientMaterial.albedoTexture = insufficientTexture;
    insufficientMaterial.alphaTexture = insufficientTexture;
    insufficientMaterial.emissiveTexture = insufficientTexture;
    insufficientMaterial.emissiveColor = Color3.Yellow();
    insufficientMaterial.emissiveIntensity = 3;
    insufficient.addComponent(insufficientShape);
    insufficient.addComponent(insufficientMaterial);
    insufficient.addComponent(new Transform({
        position:new Vector3(0.8,1.5,0),
        scale:new Vector3(-1,-0.3,-1)
    }));
    insufficient.setParent(entity);
    

    const loading = new Entity();
    const loadingMaterial = new Material();
    const loadingTexture = new Texture(`images/loading.png`);
    loadingMaterial.alphaTexture = loadingTexture;
    loadingMaterial.emissiveTexture = loadingTexture;
    loadingMaterial.albedoTexture = loadingTexture;
    loadingMaterial.emissiveColor = Color3.Yellow();
    loadingMaterial.emissiveIntensity = 3;
    loading.addComponent(loadingMaterial);
    loading.addComponent(new Transform({
        position:new Vector3(0,1.5,0),
        scale:new Vector3(-1,-0.5,-1)
    }));
    const loadingShape = new PlaneShape();
    loadingShape.isPointerBlocker = false;
    loadingShape.withCollisions = false;
    loading.addComponent(loadingShape);
    loading.setParent(entity);
    
    const handler = new Entity();
    const handlerShape = new BoxShape();
    handler.addComponent(handlerShape);
    function goLeft(){
        reproduceAvatarSound("ui_club_previous");
        if(state.currentGolfClub){
            state.currentGolfClub--;
            state.upgradingAttribute = null;
            addPower.setState({value:false});
            addControl.setState({value:false});
            addAim.setState({value:false});
        }
    }

    function goRight(){
        reproduceAvatarSound("ui_club_next");
        if(state.currentGolfClub < (state.golfclubCollection.length-1)){
            state.currentGolfClub++;
            state.upgradingAttribute = null;
            addPower.setState({value:false});
            addControl.setState({value:false});
            addAim.setState({value:false});
        }
    }
    handler.addComponent(new OnPointerDown((event)=>{
        if(state.loading) return;
        if(event.buttonId === 1){
            goLeft();
        }else if(event.buttonId === 2){
           goRight();
        }
        updateViewFromState();
    },{
        hoverText:'E/F'
    }));
    const handlerMaterial = new Material();
    handlerMaterial.albedoColor = new Color4(1,0,0,0);
    handler.addComponent(handlerMaterial);
    handler.addComponent(new Transform({
        position:new Vector3(0,2.3,-0),
        scale:new Vector3(4,2.9,0.08)
    }));
    handler.setParent(entity);

    const addPower = createAttributeUpdateButton(entity, {
        position: new Vector3(1.2,2.65,-0.01)
    });
    
    const addControl = createAttributeUpdateButton(entity, {
        position: new Vector3(1.2,2.44,-0.01)
    });
    
    const addAim = createAttributeUpdateButton(entity, {
        position: new Vector3(1.2,2.22,-0.01)
    });
    addPower.onClick(()=>{
        reproduceAvatarSound("ui_club_inc_power");
        state.upgradingAttribute = "power";
        addPower.setState({value:true});
        addControl.setState({value:false});
        addAim.setState({value:false});
        updateViewFromState();
        atlasAnalytics.submitGenericEvent(`gbc-club-inc-power`);
    });
    addControl.onClick(()=>{
        reproduceAvatarSound("ui_club_inc_control");
        state.upgradingAttribute = "control";
        addPower.setState({value:false});
        addControl.setState({value:true});
        addAim.setState({value:false});
        updateViewFromState();
        atlasAnalytics.submitGenericEvent(`gbc-club-inc-control`);
    });
    addAim.onClick(()=>{
        reproduceAvatarSound("ui_club_inc_aim");
        state.upgradingAttribute = "aim";
        addPower.setState({value:false});
        addControl.setState({value:false});
        addAim.setState({value:true});
        updateViewFromState();
        atlasAnalytics.submitGenericEvent(`gbc-club-inc-aim`);
    });
    updateViewFromState();

    function getLevelFromAttributes(attributes:{[key:string]:number}){
        return Object.keys(attributes).reduce((acc:number, key:string)=>{
            acc += attributes[key];
            return acc;
        },1);
    }

    function updateViewFromState(){        
        const currentGolfClub = state.golfclubCollection[state.currentGolfClub];
        console.log("currentGolfClub",currentGolfClub)
        console.log("state.activeGolfClubTokenId",state.activeGolfClubTokenId);
        console.log("state.golfclubCollection",state.golfclubCollection)
        attributesTextShape.value = `${getLevelFromAttributes(currentGolfClub.attributes)}\n\n${currentGolfClub.attributes.power}\n${currentGolfClub.attributes.control}\n${currentGolfClub.attributes.aim}\n${currentGolfClub.DisplayName}`;
        arrowLeftShape.visible = !!state.currentGolfClub;
        arrowRightShape.visible = state.currentGolfClub < (state.golfclubCollection.length-1);
        loadingShape.visible = state.loading;
        

        if(state.activeGolfClubTokenId === state.golfclubCollection[state.currentGolfClub].tokenId || (foundGolfclubIndex === -1 && state.currentGolfClub === indexOfStandard)){
            activeButtonShape.visible = !state.loading;
            selectButtonShape.visible = false;
            selectHandler.enable(false);
        }else{
            activeButtonShape.visible = false;
            selectButtonShape.visible = !state.loading;
            selectHandler.enable(true);
        }
        const xpLevel = getLevelInfo(state.golfclubCollection[state.currentGolfClub].xp).currentLevel;
        const attributesLevel = getLevelFromAttributes(state.golfclubCollection[state.currentGolfClub].attributes);
        const upgradeAvailable = state.golfclubCollection[state.currentGolfClub].xp && xpLevel > attributesLevel && attributesLevel < 16;
        const mintAvailable = !state.golfclubCollection[state.currentGolfClub].minting && state.golfclubCollection[state.currentGolfClub].xp && attributesLevel === 16 && state.golfclubCollection[state.currentGolfClub].golfclubId == 1;
        mintShape.visible = mintShape.isPointerBlocker = mintAvailable && !state.loading;
        mintHandler.enable(mintShape.visible);
        addPower.setState({
            visible:!(state.loading || !upgradeAvailable || state.golfclubCollection[state.currentGolfClub].attributes.power >= 5),
            value:state.upgradingAttribute === "power"
        });
        addControl.setState({
            visible:!(state.loading || !upgradeAvailable || state.golfclubCollection[state.currentGolfClub].attributes.control >= 5),
            value:state.upgradingAttribute === "control"
        });
        addAim.setState({
            visible:!(state.loading || !upgradeAvailable || state.golfclubCollection[state.currentGolfClub].attributes.aim >= 5),
            value:state.upgradingAttribute === "aim"
        });
        const upgradeMaterials = {power:"IR",control:"ST",aim:"WD"};
        const enoughMaterials = globalStore.userData?.getState()[upgradeMaterials[state.upgradingAttribute]] >= getMaterialCost();

        confirmButtonShape.visible = confirmButtonShape.isPointerBlocker = !state.loading && !!state.upgradingAttribute && enoughMaterials;
        confirmHandler.enable(confirmButtonShape.visible);
        insufficientShape.visible = insufficientShape.isPointerBlocker = !state.loading && !!state.upgradingAttribute && !enoughMaterials;
        material.albedoTexture = material.emissiveTexture = getTexture(`images/${state.golfclubCollection[state.currentGolfClub].golfclubId}.png`);

        const currentLevelProgress = upgradeAvailable
            ? 1
            : getLevelInfo(state.golfclubCollection[state.currentGolfClub].xp).progressPercentage/100;

        levelBar.setValue(currentLevelProgress);

        if(state.upgradingAttribute && upgradeAvailable) {
            const upgradeCosts = [10, 20, 30, 60, 120];

            materialCost.setIcon(`images/screen-icon-${upgradeMaterials[state.upgradingAttribute].toLowerCase()}.png`);
            console.log("state.upgradingAttribute", state.upgradingAttribute);
            console.log("state.golfclubCollection[state.currentGolfClub].attributes", state.golfclubCollection[state.currentGolfClub].attributes)
            materialCost.updateValue(upgradeCosts[state.golfclubCollection[state.currentGolfClub].attributes[state.upgradingAttribute]])
            materialCost.show();
        }else if(mintAvailable){
            materialCost.updateValue(120);
            materialCost.setIcon(`images/screen-icon-dm.png`);
            materialCost.show();
        }else{
            materialCost.hide();
        }

        function getMaterialCost(){
            const upgradeCosts = [10,20,30,60,120];
            return upgradeCosts[state.golfclubCollection[state.currentGolfClub].attributes[state.upgradingAttribute]];
        }
    }

    return {
        updateState:(newState:any)=>{
            (<any>Object).assign(state, newState);
            updateViewFromState();
        },
        onSelect:(fn:Function)=>{
            callbacks.onSelect = fn;
        },
        onUpgrade:(fn:Function)=>{
            callbacks.onUpgrade = fn;
        },
        onMint:(fn:Function)=>{
            callbacks.onMint = fn;
        }
    };
};

export {
    createGolfclubBoard
};
