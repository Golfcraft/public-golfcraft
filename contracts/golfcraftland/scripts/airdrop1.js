
const { ethers } = require("hardhat");
const {sleep} = require("../../../common/utils");
const ADDRESS_LIST = ["0x36fb1d0290c10d30d2cdfc023e8bd427e416d215","0x62c05caa528eed7f57f6f4857e8e4df4b0bff434","0xe2b6024873d218b2e83b462d3658d8d7c3f55a18","0xf20a2c9f27124dcce0e62be65ac3ac800b5a3ed3","0xcfbb134e83aab817453359a9210079306fe51347","0x9daae34947a2ba5b185330dc18ae09cae592d7ed","0x99a483443600234f3e86d060dda5d2b5db43f80c","0xf32efaf8872abac0620019f517d2250fa6f1667e","0xed4a036de00bf52cbacba01218d00cdf18c58f9b","0x333f2ba1e49bcea8b1ad9f0d5083df596896cbed","0x6eb7de10448e5eb74fd96861c63879d447feb0bc","0x950445dee1d70e9db6ba3f781f3708f46d0e566d","0xd64b155fd51de27033ddec5a4a3eb4ce0f1d3bc3","0x5985eb4a8e0e1f7bca9cc0d7ae81c2943fb205bd","0x680a550e5350fc0d75c6151ddb30a905d5a10a44","0xe05b0e1a49cfef754b667b5652e5ce7e36df0cbc","0xd72e2a8b1a33b6689ccb7a929cbebf3a530dc5d7"];
const COLLECTION = 0;
//TODO not tested / reviewed
async function main() {
    const GolfcraftLand = await ethers.getContractFactory("GolfcraftLand");
    const golfcraftland = await GolfcraftLand.attach("0x0776CD532B1A2c899BE7323951aE4Ca1801edD94");

    let i = ADDRESS_LIST.length;
    while(i--){
        const current = ADDRESS_LIST[i];
        console.log("minting for " + current);
        const tx = await golfcraftland.safeMint(current, COLLECTION);
        await tx.wait();
        console.log("minted for " + current)
        await sleep(500);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
