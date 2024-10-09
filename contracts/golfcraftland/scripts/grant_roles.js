const { ethers } = require("hardhat");

async function main() {
    const receiver = "0xCF10CD8B5Dc2323B1eb6de6164647756BAd4dE4d";
    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
    const PAUSER_ROLE = "0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a";
    const REMOVER_ROLE = "0xa5b8043ff146249fc7b191de754c339b422b9e6e64402f2e2710f9b29796ed41";
    const [owner] = await hre.ethers.getSigners();
    console.log("owner address", owner.address);

    const GolfcraftLand = await ethers.getContractFactory("GolfcraftLand");
    const golfcraftland = await GolfcraftLand.attach("0x0776CD532B1A2c899BE7323951aE4Ca1801edD94");
    console.log("GolfcraftLand deployed to:", golfcraftland.address);

    var TX
    TX = await golfcraftland.grantRole(DEFAULT_ADMIN_ROLE, receiver);
    await TX.wait();
    console.log("granted admin");
    TX = await golfcraftland.grantRole(MINTER_ROLE, receiver);
    await TX.wait();
    console.log("granted minter");
    TX = await golfcraftland.grantRole(PAUSER_ROLE, receiver);
    await TX.wait();
    console.log("granted pauser");
    TX = await golfcraftland.grantRole(REMOVER_ROLE, receiver);
    await TX.wait();
    console.log("granted remover");


    TX = await golfcraftland.revokeRole(MINTER_ROLE, owner.address);
    await TX.wait();
    console.log("revoked minter");
    TX = await golfcraftland.revokeRole(PAUSER_ROLE, owner.address);
    await TX.wait();
    console.log("revoked pauser");
    TX = await golfcraftland.revokeRole(REMOVER_ROLE, owner.address);
    await TX.wait();
    console.log("revoked remover");
    TX = await golfcraftland.revokeRole(DEFAULT_ADMIN_ROLE, owner.address);
    await TX.wait();
    console.log("revoked admin");

    TX = await golfcraftland.transferOwnership(receiver);
    await TX.wait();
    console.log("transfer ownership");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
