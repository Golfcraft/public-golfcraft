export const ALLOWED_WEARABLES = {
    "0x909bebffc69bab12c2ce559b74e43b50cdcafd8c:0":{
        name:"Golfcraft - Oh my Golf! - Cap"
    },//oh my golf
    "0x909bebffc69bab12c2ce559b74e43b50cdcafd8c:1":{
        name:"Golfcraft - Oh my Golf! - Pants"
    },//oh my golf
    "0x909bebffc69bab12c2ce559b74e43b50cdcafd8c:2":{
        name:"Golfcraft - Oh my Golf! - Shoes"
    },//oh my golf
    "0x909bebffc69bab12c2ce559b74e43b50cdcafd8c:3":{
        name:"Golfcraft - Oh my Golf! - Vest"
    },//oh my golf
    "0x5c014f91bf867c54ec335c18ba2e27066a83a0e6:0":{
        name:"Golfcraft Beta Tester 2021"
    },//beta tester
    "0x1aeb7d9536193a3a25c74d462ec2dc88da9e50dd:0":{
        name:"Golfcraft - Twisted Pony Tail"
    },//doki hair twisted pony tail
    "0x1aeb7d9536193a3a25c74d462ec2dc88da9e50dd:1":{
        name:"Golfcraft - Space Buns Sparkle"
    },//doki
    "mf_sammichgamer:mf_frogfins":{
        name:"Frog fins"
    },
    "mf_sammichgamer:mf_unicornpants":{
        name:"Unicorn pants"
    },
    "mf_sammichgamer:mf_animehair":{
        name:"Anime warrior hair"
    },
    "mf_sammichgamer:mf_unicornhelmet":{
        name:"Unicorn helmet"
    },
    "mf_sammichgamer:mf_wingsneakers":{
        name:"Wing sneakers"
    },
    "mf_sammichgamer:mf_sammichtorso":{
        name:"Sammich frog outfit"
    },
    "0x85f15ec042d64f3219a058b73ac2e459cb37e393:0":{
        name:"Golfcraft - Captain Cleanbeard"
    },
    "0x59d3a36754d961eca320f1b7281fe9b046b2975f:0":{
        name:"Golfcraft - OM Deluxe! - Shoes"
    },
    "0x59d3a36754d961eca320f1b7281fe9b046b2975f:1":{
        name:"Golfcraft - OM Deluxe! - Pants"
    },
    "0x59d3a36754d961eca320f1b7281fe9b046b2975f:2":{
        name:"Golfcraft - OM Deluxe! - Cap"
    },
    "0x59d3a36754d961eca320f1b7281fe9b046b2975f:3":{
        name:"Golfcraft - OM Deluxe! - Vest"
    }
};

export const hasAllowedWearables = (wearables)=>wearables.map(current => {
    const [u,d,n,v,collection,tokenId] = current.urn.split(":");
    return `${collection}:${tokenId}`;
}).filter(c=>{
    return !!ALLOWED_WEARABLES[c.toLowerCase()];
}).length;

export const getAllWearablesAllowedNames = () => {
    return Object.values(ALLOWED_WEARABLES).map(w=>w.name)
}

export const getAllowedWearableNames = (wearables)=>wearables.map(current => {
    const [u,d,n,v,collection,tokenId] = current.urn.split(":");
    return `${collection}:${tokenId}`;
}).filter(c=>{
    return ALLOWED_WEARABLES[c.toLowerCase()];
}).map(c=>{
    return ALLOWED_WEARABLES[c.toLowerCase()].name;
});