const { ethers, upgrades } = require("hardhat");

async function main() {
  const proxyAddress = '0x4820e6424989c22ef7f41b67e7439ab9969fe948';
 
  const GolfcraftPartsV2 = await ethers.getContractFactory("GolfcraftPartsV2");
  console.log("Preparing upgrade...");
  const V2Address = await upgrades.prepareUpgrade(proxyAddress, GolfcraftPartsV2);
  console.log("GolfcraftPartsV2 at:", V2Address);
}
 
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });