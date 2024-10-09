const { ethers, upgrades } = require("hardhat");

async function main() {
    const [owner] = await hre.ethers.getSigners();
    console.log("owner address", owner.address);

    const materials_address = "0xb50E29A3ccF7c0AB133ea7de46B09D0D8fEAfdF0";
    const parts_address = "0x4820E6424989c22eF7f41B67e7439aB9969fe948";

    const GolfcraftCrafting = await ethers.getContractFactory("GolfcraftCrafting");
    const golfcraftmaterials = await upgrades.deployProxy(GolfcraftCrafting, ["GolfcraftCrafting", materials_address, parts_address]);
    await golfcraftmaterials.deployed();
    console.log("GolfcraftCrafting deployed to:", golfcraftmaterials.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
