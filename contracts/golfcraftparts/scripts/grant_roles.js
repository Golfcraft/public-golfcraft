const { ethers } = require("hardhat");

async function main() {
    const receiver = "";
    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
    const PAUSER_ROLE = "0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a";
    const [owner] = await hre.ethers.getSigners();
    console.log("owner address", owner.address);

    const GolfcraftParts = await ethers.getContractFactory("GolfcraftParts");
    const golfcraftparts = await GolfcraftParts.attach("");
    console.log("GolfcraftParts deployed to:", golfcraftparts.address);

    await golfcraftparts.grantRole(DEFAULT_ADMIN_ROLE, receiver);
    console.log("granted admin");
    await golfcraftparts.grantRole(MINTER_ROLE, receiver);
    console.log("granted minter");
    await golfcraftparts.grantRole(PAUSER_ROLE, receiver);
    console.log("granted pauser");


    await golfcraftparts.revokeRole(MINTER_ROLE, owner.address);
    console.log("revoked minter");
    await golfcraftparts.revokeRole(PAUSER_ROLE, owner.address);
    console.log("revoked pauser");
    await golfcraftparts.revokeRole(DEFAULT_ADMIN_ROLE, owner.address);
    console.log("revoked admin");

    await golfcraftparts.transferOwnership(receiver);
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
