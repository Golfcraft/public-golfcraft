const { ethers, upgrades } = require("hardhat");

async function main() {
    const [owner] = await hre.ethers.getSigners();
    console.log("owner address", owner.address);

    const GolfcraftLand = await ethers.getContractFactory("GolfcraftLand");
    const golfcraftland = await upgrades.deployProxy(GolfcraftLand, []);
    await golfcraftland.deployed();
    console.log("GolfcrafLand deployed to:", golfcraftland.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
