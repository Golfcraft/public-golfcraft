// scripts/upgrade-box.js
const { ethers, upgrades } = require("hardhat");

async function main() {
    const BOX_ADDRESS = "0xf044647af5d795a9459b7bc0bd47625d4764a222";

    const GolfclubV2 = await ethers.getContractFactory("GolfclubV2");
    const Golfclub = await upgrades.upgradeProxy(BOX_ADDRESS, GolfclubV2);
    console.log("Golfclub upgraded");
}

main();
