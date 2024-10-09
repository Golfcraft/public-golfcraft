const textures = {};
const gltfShapes = {};
const audioClips = {};

export const getTexture = (src, ...options) => {
    if(typeof src === "string"){
        return textures[src] || (textures[src] = new Texture(src, ...options));
    }else{
        const {url, alias} = src;
        return textures[alias] || (textures[alias] = new Texture(url, ...options));
    }
}
export const getGLTFShape = (src) => gltfShapes[src] || (gltfShapes[src] = new GLTFShape(src));
export const getAudioClip = (src) => audioClips[src] || (audioClips[src] = new AudioClip(src));