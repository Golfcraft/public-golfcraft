const { ethers } = require("hardhat");

async function main() {
    const receiver = "";
    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const PAUSER_ROLE = "0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a";
    const CHEF_ROLE = "0xbb95cca64affbe55a6a6f6b690ae1c8525d24dc953087f6db9a21e7cb374b385";

    const [owner] = await hre.ethers.getSigners();
    console.log("owner address", owner.address);

    const GolfcraftCrafting = await ethers.getContractFactory("GolfcraftCrafting");
    const golfcraftcrafting = await GolfcraftCrafting.attach("0x8E1e2bBf6dfAe62A1988d5A12969eBD057597E4A");
    console.log("GolfcraftCrafting deployed to:", golfcraftcrafting.address);

    await golfcraftcrafting.grantRole(DEFAULT_ADMIN_ROLE, receiver);
    console.log("granted admin");
    await golfcraftcrafting.grantRole(PAUSER_ROLE, receiver);
    console.log("granted pauser");
    await golfcraftcrafting.grantRole(CHEF_ROLE, receiver);
    console.log("granted chef");


    await golfcraftcrafting.revokeRole(PAUSER_ROLE, owner.address);
    console.log("revoked pauser");
    await golfcraftcrafting.revokeRole(CHEF_ROLE, owner.address);
    console.log("revoked chef");
    await golfcraftcrafting.revokeRole(DEFAULT_ADMIN_ROLE, owner.address);
    console.log("revoked admin");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
