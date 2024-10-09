const soundEntity = new Entity();
engine.addEntity(soundEntity)
soundEntity.setParent(Attachable.FIRST_PERSON_CAMERA);

const reproduceAvatarSound = (name)=>{    
    if(!sounds[name]) throw new Error("not registered sound "+name);
    soundEntity.addComponentOrReplace(sounds[name]);
    sounds[name].playOnce();
}

const sounds = {};

const registerSound = (name, baseUrl?) => {
    if(sounds[name]) throw new Error("sound already registered "+name);
    sounds[name] = new AudioSource(new AudioClip(`${baseUrl||''}sounds/${name}.mp3`));
};

export {
    reproduceAvatarSound,
    registerSound
}