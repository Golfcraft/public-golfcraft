const { ethers, upgrades } = require("hardhat");

async function main() {
    const [owner] = await hre.ethers.getSigners();
    console.log("owner address", owner.address);

    const GolfcraftParts = await ethers.getContractFactory("GolfcraftParts");
    const golfcraftparts = await upgrades.deployProxy(GolfcraftParts, ["https://tokenuris/", "GolfcraftParts", "GCPARTS", "https://contracturi/"]);
    await golfcraftparts.deployed();
    console.log("GolfcrafParts deployed to:", golfcraftparts.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
