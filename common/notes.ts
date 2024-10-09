var Authorization = "Bearer "+ JSON.parse(localStorage.getItem("session_data")).accessToken;


const BOTTOM_TRAITS = ["Akasaka","Shinagawa","Yurakucho","Marunouchi","Ebisu","Chiyoda","Aoyama","Shibuya","Yoyogi","Daikanyama","Otemachi","Tsukiji","Asakusa",
    "Odaiba","Omotesando","Kagurazaka","Akihabara","Kanda","Nagatacho","Ginza","Harajuku","Takadanobaba","Shinjuku","Roppongi", "Ikebukuro","Shinbashi", "Ryoguko"];
const EAR_TRAITS = ["Bubble","Bevel"];
const EYES_TRAITS = [
    "Simple",
    "Feline",
    "Drop",
    "Mean",
    "Small",
    "Defiant",
    "Thriving",
    "Tired",
    "Illuminated",
    "Melted",
    "Pyramid",
    "Future",
    "Indigo",
    "Leaf"
]
const EYE_COLOR_TRAITS = [
    "Onyx",
    "Spinel",
    "Topaz",
    "Jade",
    "Sapphire",
    "Silver",
    "Amber",
    "Emerald",
    "Amethyst",
    "Adamite",
    "Morganite",
    "Tourmaline",
    "Pirite",
    "Ruby",
    "Lapislazuli",
    "Alexandrite",
    "Indigo",
    "Leaf"
];
const FACE_ACC_TRAITS = [
    "Scar",
    "Shades",
    "Retro",
    "Monocle",
    "Hot",
    "Cool",
    "Double Double",
    "Once Double",
    "Punk",
    "Chain n studs",
    "Formal",
    "Shy",
    "Cultist",
    "Cascades",
    "Mask",
    "Bold",
    "Flagged",
    "Cooler",
    "Blush",
    "Cyberpunk",
    "Utopia",
    "Band Aid",
    "Patched",
    "Gas",
    "Tracker",
    "Bridge",
    "Cute",
    "Septum",
    "Indigo",
    "Leaf",
    "Chill"
];
const FACE_SHAPE = [
    "Triangle",
    "Rounded",
    "Square",
    "Indigo",
    "Leaf"
]
const HAIR = [
    "Beanie",
    "Shounen",
    "Royal",
    "Sophisticated",
    "Power Hair",
    "Undercut",
    "Dreadlocks",
    "Bald",
    "Short",
    "Quiff",
    "Braid",
    "Cool",
    "Curly",
    "V Cap",
    "Mochis",
    "Ponytail",
    "Bun",
    "Ninja",
    "Indomitable",
    "Neko",
    "Straight",
    "Rural",
    "Gangster",
    "Wavy",
    "Fisher",
    "Occult",
    "Slicked",
    "Claw",
    "Long",
    "Twintails",
    "Audiorabbit",
    "Fringed",
    "Modern",
    "Short Messy",
    "Headphones",
    "Anime",
    "Indigo",
    "Leaf"
]
const HAIR_COLOUR = [
    "Grape",
    "Chocolate",
    "Cinnamon",
    "Lime",
    "Wine",
    "Blonde",
    "Candy",
    "Maroon",
    "Citron",
    "Pale",
    "Ocean",
    "Peppermint",
    "Lavender",
    "Hummingbird",
    "Vessel",
    "Pastel",
    "Coral",
    "Hazelnut",
    "Velvet",
    "Sweet",
    "Noon",
    "Sour",
    "Acid",
    "Grapefruit",
    "Marine",
    "Mauve",
    "Indigo",
    "Leaf"
];
const MOOD = [
    "Vibing",
    "Furious",
    "Empty",
    "Surprised",
    "Sleepy",
    "Indigo",
    "Leaf"
];
const MOUTH = [
    "Human",
    "Goblin",
    "Vampire",
    "Medusa",
    "Snake",
    "Elf",
    "Indigo",
    "Leaf"
]
const SHOES = [
    "Toyota",
    "Nagoya",
    "Hekinan",
    "Tokai",
    "Obu",
    "Nisshin",
    "Dogo",
    "Noboribetsu",
    "Esaka",
    "Imazato",
    "Kinosaki",
    "Kurokawa",
    "Ibusuki",
    "Beppu",
    "Kujo",
    "Kusatsu",
    "Midoribashi",
    "Awaza",
    "Yufuin",
    "Fuji",
    "Hakone",
    "Indigo",
    "Leaf",
    "Seto"
]
const TOP = [
    "Toyama",
    "Chiba",
    "Ishikawa",
    "Kanagawa",
    "Saga",
    "Gifu",
    "Tokyo",
    "Oita",
    "Hiroshima",
    "Akita",
    "Ibaraki",
    "Ehime",
    "Fukuoka",
    "Iwate",
    "Kumamoto",
    "Wakayama",
    "Kansai",
    "Tottori",
    "Aichi",
    "Miyagi",
    "Kanto",
    "Osaka",
    "Aomori",
    "Shiga",
    "Mie",
    "Yamagata",
    "Hokkaido",
    "Nagasaki",
    "Tohoku",
    "Niigata",
    "Miyazaki",
    "Tokushima",
    "Kyoto",
    "Kochi",
    "Okayama",
    "Yamanashi",
    "Nara",
    "Indigo",
    "Leaf",
    "Shizuoka"
];

const ALL_TRAITS = [...EYE_COLOR_TRAITS, ...EAR_TRAITS, ...EYES_TRAITS, ...FACE_ACC_TRAITS, ...FACE_SHAPE, ...HAIR, ...MOOD, ...MOUTH, ...SHOES, ...TOP, ...BOTTOM_TRAITS, ...HAIR_COLOUR];

function beep() {
    var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
    snd.play();
}
beep();
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
let isLegendary = false;
let count = 0;
while(!isLegendary){

    isLegendary = await fetch("https://api.cryptoavatars.io/v1/spots/reroll", {
        method:"PUT", headers:{
            "Authorization":Authorization,
            "Content-Type":"application/json",
            "Accept":"application/json, text/plain, */*"
        }})
        .then(r=>r.json())
        .then(d=>
            [...d.bodyTraits, ...d.clothesTraits].filter(t=>t.rarityColour === "Orange").length > 2 ||
            [...d.bodyTraits, ...d.clothesTraits].filter(t=>t.rarityColour === "Blue").length < 4 ||
          //  [...d.bodyTraits, ...d.clothesTraits].map(t=>t.value).filter(t=>ALL_TRAITS.indexOf(t) === -1 ).length ||
            d.clothesTraits.every(t=>t.rarityColour === "Orange") ||
           // !!d.clothesTraits.find(t=>t.trait_type === "Top" && t.value === "Osaka") ||
            // d.rarityColour === "Orange" ||
           // (d.rarityColour === "Orange" &&  !!d.bodyTraits.find(t=>t.trait_type === "Top" && t.value === "Osaka") )||
           //  (d.rarityColour === "Orange" &&  !!d.bodyTraits.find(t=>t.trait_type === "Top" && t.value === "Nara") )||
           // (!!d.clothesTraits.find(t=>t.rarityColour === "Orange") && d.rarityColour === "Orange" ) ||
    //(d.rarityColour !== "Blue" && d.rarityColour !== "Purple") ||
            // d.attributes === null ||
            d.isLegendary
        )
    count++;
    console.log(count)
    // beep();
    await sleep(30200 + Math.floor(Math.random()*1000));
}
while(true){
    await sleep(500);beep();
    console.log("FOUND")
}