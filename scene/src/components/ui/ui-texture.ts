const textures = {
};

export const getTexture = (src, ...options) => {
    if(typeof src === "string"){
        return textures[src] || (textures[src] = new Texture(src, ...options));
    }else{
        const {url, alias} = src;
        return textures[alias] || (textures[alias] = new Texture(url, ...options));
    }
}