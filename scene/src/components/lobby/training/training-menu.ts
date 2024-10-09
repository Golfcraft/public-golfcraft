import { TRAINING } from "../../../../../common/constants";
import { globalStore } from "../../../services/globalStore/globalStore";
import { reproduceAvatarSound } from "../../../services/avatar-sound";
import { courseDefinitionsRepo } from "../../../../../common/course-definitions/course-definition-repository";
import { hideAvatarInFronOf } from "../../panel-hide-avatar";
import {getGLTFShape} from "../../../../golfplay/services/resource-repo";

const THUMBNAIL_TEXTURE = {
    [TRAINING.RACE]:new Texture(`images/training-race.png`),
    [TRAINING.ZONE]:new Texture(`images/training-zone.png`),
    [TRAINING.VOXTER]:new Texture(`images/training-voxters.png`),
    [TRAINING.HOLE]:new Texture(`images/training-hole.png`)
}
const emissiveColor = new Color3(1,1,0)
export const createScreenIconWithValue = (parent, {position, src, value}) => {
    const entity = new Entity();
    entity.setParent(parent);
    hideAvatarInFronOf(entity);
    entity.addComponent(new Transform({
        position
    }));
    const icon = new Entity();
    icon.addComponent(new Transform({
        scale:new Vector3(-0.3,-0.3,-1)
    }))
    const plane = new PlaneShape();
    const texture = new Texture(`${src}`);
    const material = new Material();
    material.albedoTexture = texture;
    material.emissiveTexture = texture;
    material.alphaTexture = texture;
    material.emissiveIntensity = 3;
    material.emissiveColor = emissiveColor;

    icon.addComponent(plane);
    icon.addComponent(material);
    icon.setParent(entity);

    const description = new Entity();
    const text = new TextShape();
    text.value = value;
    text.fontSize = 2;
    text.paddingLeft = 0.3;
    text.paddingTop = 0;
    text.hTextAlign = "left";
    text.vTextAlign = "top";
    text.color = new Color3(1,1,0.7);
    text.font = new Font(Fonts.SanFrancisco_Semibold);
    description.addComponent(new Transform({
        position: new Vector3(0.3,0.125,0)
    }))
    description.addComponent(text);
    description.setParent(entity);

    const show = () => {
        entity.setParent(parent);
    };
    const hide = () => {
        entity.setParent(null);
        engine.removeEntity(entity);
    };
    return {
        updateValue:(value)=>{
            text.value = value;
        },
        show,
        hide
    }
};
const createTrainingMenu = (parent, {position, rotation, trainingID}) => {

    const callbacks = {
        onStart:null
    };
    const state = {
        trainingID
    };
    const entity = new Entity();
    entity.setParent(parent);
    const gcField = createScreenIconWithValue(entity, {
        position:new Vector3(0.45, 2.7, 0),
        value:0,
        src:`images/screen-icon-gc.png`
    });
    const xpField = createScreenIconWithValue(entity, {
        position:new Vector3(0.45, 2.3, 0),
        value:0,
        src:`images/screen-icon-xp.png`
    });

    gcField.updateValue(globalStore.userData.getState().currentTrainingData.metadata.GC);
    xpField.updateValue(globalStore.userData.getState().currentTrainingData.metadata.xp);
    entity.addComponent(new Transform({
        position,
        rotation
    }));

    const board = new Entity();
    board.setParent(entity);
    const shape = getGLTFShape(`models/board.glb`);
    board.addComponent(shape);
    board.addComponent(new Transform({
       position:new Vector3(0,0,0)
    }));

    const header = new Entity();
    const headerTexture = new Texture(`images/training.png`);
    const screenMaterial = new Material();
    screenMaterial.albedoTexture = headerTexture;
    screenMaterial.alphaTexture = headerTexture;
    screenMaterial.emissiveTexture = headerTexture;
    screenMaterial.emissiveIntensity = 3;
    screenMaterial.emissiveColor = emissiveColor;
    header.addComponent(screenMaterial);
    header.addComponent(new Transform({
        position:new Vector3(0,3.4,0),
        scale:new Vector3(-2,-0.76,-1)
        //rotation:Quaternion.Euler(180,180,180)
    }));
    header.addComponent(new PlaneShape());

    header.setParent(entity);

    const thumbnail = new Entity();
    const thumbnailMaterial = new Material();
    thumbnailMaterial.albedoTexture = THUMBNAIL_TEXTURE[state.trainingID];
    thumbnailMaterial.alphaTexture = THUMBNAIL_TEXTURE[state.trainingID];
    thumbnailMaterial.emissiveTexture = THUMBNAIL_TEXTURE[state.trainingID];
    thumbnailMaterial.emissiveIntensity = 4;
    thumbnailMaterial.emissiveColor = emissiveColor;
    thumbnail.addComponent(new Transform({
        position:new Vector3(-0.9, 2.1, 0),
        scale:new Vector3(-1.8,-2.4,-1)
    }));
    thumbnail.addComponent(thumbnailMaterial);
    thumbnail.addComponent(new PlaneShape());
    thumbnail.setParent(entity);

    const playButton = new Entity();
    playButton.setParent(entity);
    const playTexture = new Texture(`images/button-play.png`);
    const playMaterial = new Material();
    playMaterial.albedoTexture = playTexture;
    playMaterial.alphaTexture = playTexture;
    playMaterial.emissiveTexture = playTexture;
    playMaterial.emissiveIntensity = 3;
    playMaterial.emissiveColor = emissiveColor;

    playButton.addComponent(new PlaneShape());
    playButton.addComponent(playMaterial);
    playButton.addComponent(new Transform({
        position:new Vector3(0.8, 1.45, -0.3),
        scale:new Vector3(-1,-0.4,-1)
    }));

    playButton.addComponent(new OnPointerDown(
        ()=>{
            reproduceAvatarSound('button1');
            callbacks.onStart && callbacks.onStart({trainingID:state.trainingID})
        },
        {hoverText:"Start training to win coins"})
    );
    globalStore.userData.onChange(
        ({newValue, oldValue, prop}) => {
            const {currentTrainingData} = globalStore.userData.getState();
            disable();
            thumbnail.getComponent(PlaneShape).visible = false;
            state.trainingID = currentTrainingData.subType;
            thumbnailMaterial.albedoTexture = THUMBNAIL_TEXTURE[currentTrainingData.subType];
            thumbnailMaterial.alphaTexture = THUMBNAIL_TEXTURE[currentTrainingData.subType];
            thumbnailMaterial.emissiveTexture = THUMBNAIL_TEXTURE[currentTrainingData.subType];

            setTimeout(()=>{
                enable();
                thumbnail.getComponent(PlaneShape).visible = true;
            },1000);
            gcField.updateValue(currentTrainingData.metadata.GC);
            xpField.updateValue(currentTrainingData.metadata.xp);
        }
        , "currentTrainingData"
    );
    const hide = () => {
        entity.setParent(null);
        engine.removeEntity(entity);
    };
    const show = () => {
        entity.setParent(parent);
    };

    const dispose = () => {};

    const disable = () => {
        playButton.setParent(null);
        engine.removeEntity(playButton);
    };

    const enable = ()=>{
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


export {createTrainingMenu};
