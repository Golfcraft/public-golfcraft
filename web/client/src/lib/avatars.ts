const avatars:any = {};
const storageAvatars = localStorage.getItem("avatars");
if(storageAvatars){
    Object.assign(avatars, JSON.parse(storageAvatars));
}
export const getAvatars = ()=>avatars;