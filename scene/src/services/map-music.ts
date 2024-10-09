
import { globalStore } from "../services/globalStore/globalStore";

const soundEntity = new Entity();
const MUSIC_BY_COLLECTION = {
    0:[`sound/map_egypt_1.mp3`, `sound/map_egypt_2.mp3`],
    1:[`sound/map_space_1.mp3`]
}
const sounds = {};
const getMusicForCollection = (collectionId) => MUSIC_BY_COLLECTION[0][Math.floor(Math.random()*MUSIC_BY_COLLECTION[0].length)];

engine.addEntity(soundEntity)
soundEntity.setParent(Attachable.FIRST_PERSON_CAMERA);
Object.values(MUSIC_BY_COLLECTION).forEach(collectionMusics => collectionMusics.forEach(m=>registerMapMusic(m,m)));

export {
    getMusicForCollection,
    reproduceMapMusic,
    registerMapMusic,
    stopMapMusic
}

function reproduceMapMusic (name){
    if (globalStore.userData.getState().TitleData.streamURL) {
        return;
    }
    if(!sounds[name]) throw new Error("not registered sound "+name);
    soundEntity.addComponentOrReplace(sounds[name]);
    sounds[name].looping = true;
    sounds[name].playing = true;
}

function stopMapMusic (name) {
    sounds[name].playing = false;
}

function registerMapMusic (name) {
    if(sounds[name]) throw new Error("sound already registered "+name);
    sounds[name] = new AudioSource(new AudioClip(name));
    sounds[name].volume = 0.5;
    console.log("registered map music", name);
}