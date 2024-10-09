const { ethers, upgrades } = require("hardhat");

async function main() {
    const [owner] = await hre.ethers.getSigners();
    console.log("owner address", owner.address);

    const GolfcraftMaterials = await ethers.getContractFactory("GolfcraftMaterials");
    const golfcraftmaterials = await upgrades.deployProxy(GolfcraftMaterials, ["https://tokenuris/", "GolfcraftMaterials", "GCFTMTRLS", "https://contracturi/"]);
    await golfcraftmaterials.deployed();
    console.log("GolfcraftMaterials deployed to:", golfcraftmaterials.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
