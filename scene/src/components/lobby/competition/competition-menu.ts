import { PRICE_COMPETITION_GROUP } from "../../../../../common/constants";
import { reproduceAvatarSound } from "../../../services/avatar-sound";
import { createScreenIconWithValue } from "../training/training-menu";
import {hideAvatarInFronOf} from "../../../components/panel-hide-avatar";
import {getGLTFShape} from "../../../../golfplay/services/resource-repo";

const emissiveColor = new Color3(1,1,0)
const createCompetitionMenu = (parent, {position, rotation}) => {    
    const callbacks = {
        onStart:null
    };

    const state = {
        enabled:true,
        visible:true
    };
  
    const entity = new Entity();
    entity.setParent(parent);
   hideAvatarInFronOf(entity);
    entity.addComponent(new Transform({
        position,
        rotation
    }));

    const background = new Entity();
    background.setParent(entity);
    const shape = getGLTFShape(`models/board.glb`);
    background.addComponent(shape);
    background.addComponent(new Transform({
       position:new Vector3(0,0,0)
    }));

    const header = new Entity();
    const headerTexture = new Texture(`images/competition.png`);
    const headerMaterial = new Material();
    headerMaterial.albedoTexture = headerTexture;
    headerMaterial.alphaTexture = headerTexture;
    headerMaterial.emissiveTexture = headerTexture;
    headerMaterial.emissiveIntensity = 3;
    headerMaterial.emissiveColor = emissiveColor;
    header.addComponent(headerMaterial);
    header.addComponent(new Transform({
        scale:new Vector3(-2.5, -0.75, -1),
        position:new Vector3(0,3.3, 0),
        //rotation:Quaternion.Euler(180,180,180)
    }));
    header.addComponent(new PlaneShape());
    header.setParent(entity);

    const description = new Entity();
    description.setParent(entity);
    const descriptionText = new TextShape();
    descriptionText.value = `Tier 1 price:`;
    descriptionText.color = new Color3(1,1,0.8);
    descriptionText.fontSize = 3;
    descriptionText.hTextAlign = `left`;
    descriptionText.vTextAlign = `top`;
    description.addComponent(descriptionText);
    description.addComponent(new Transform({
        position: new Vector3(-1.3,2.8,0)
    }));

    createScreenIconWithValue(entity, {
        position:new Vector3(0.45, 2.6, 0),
        value:PRICE_COMPETITION_GROUP,
        src:`images/screen-icon-gc.png`
    });

    const playButton = new Entity();
    playButton.setParent(entity);
    const playTexture = new Texture(`images/button-play.png`);
    const playMaterial = new Material();
    playMaterial.albedoTexture = playTexture;
    playMaterial.alphaTexture = playTexture;
    playMaterial.emissiveTexture = playTexture;
    playMaterial.emissiveIntensity = 3;
    playMaterial.emissiveColor = emissiveColor;
    
    
    const playShape = new PlaneShape();
    playShape.withCollisions = false;
    playButton.addComponent(playShape);
    playButton.addComponent(playMaterial);
    playButton.addComponent(new Transform({
      position:new Vector3(0,1.8,0),
      scale:new Vector3(-1,-0.4,-1)
    })); 
    playButton.addComponent(new OnPointerDown(
        ()=>{
            reproduceAvatarSound("button1");
            callbacks.onStart && callbacks.onStart()
        },
        {hoverText:"Start competition per groups"})
    );
    
    const noCoins = new Entity();
    const noCoinsText = new TextShape("You don't have enough coins\nGo play training");
    noCoins.addComponent(noCoinsText);
    noCoins.addComponent(new Transform({
        position: new Vector3(0,1.8,0)
    }));
    noCoins.setParent(entity);
    noCoinsText.color = new Color3(1,1,0.8);
    noCoinsText.fontSize = 3;
    noCoinsText.visible = false;

    const hide = () => {
        entity.setParent(null);
        engine.removeEntity(entity);
        state.visible = false;
    };
    const show = () => {
        state.visible = true;
        entity.setParent(parent);
    };

    const dispose = () => {};
    
    const disable = () => {
        state.enabled = false;
        playButton.setParent(null);
        noCoinsText.visible = true;
        engine.removeEntity(playButton);
    };

    const enable = ()=>{
        state.enabled = true;
        noCoinsText.visible = false;
        playButton.setParent(entity);
    };

    return {
        onStart:(fn) => callbacks.onStart = fn,
        hide, 
        show,
        dispose,
        enable,
        disable
    };
};


export {createCompetitionMenu};