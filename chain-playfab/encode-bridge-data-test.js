const Web3 = require("web3");
const buffer = [ //data for 22000000000000000000
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    49,
    79,
    179,
    112,
    98,
    152,
    0,
    0
  ];

console.log("test", isEqual(encodeData("22000000000000000000"), buffer));

function isEqual(a,b) {
    console.log("assert", JSON.stringify(a), JSON.stringify(b));
    return JSON.stringify(a) === JSON.stringify(b);
}
function decodeData(buffer){
    const hex = (Web3.utils.bytesToHex(buffer));
    return Web3.utils.hexToNumberString(hex);
}

function encodeData(amount){
    let hex2 = Web3.utils.toHex(new Web3.utils.BN(amount));
    const toAdd = 66 - hex2.toString().length;
    hex2 = hex2.replace("0x", "0x"+Array(toAdd).fill("0").join(""))
    
    const buffer2 = Web3.utils.hexToBytes( hex2 );
    return buffer2;
}