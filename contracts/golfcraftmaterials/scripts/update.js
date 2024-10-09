const { ethers, upgrades } = require("hardhat");

async function main() {
  const proxyAddress = '0xb50E29A3ccF7c0AB133ea7de46B09D0D8fEAfdF0';
 
  const GolfcraftMaterialsV2 = await ethers.getContractFactory("GolfcraftMaterialsV2");
  console.log("Preparing upgrade...");
  const V2Address = await upgrades.prepareUpgrade(proxyAddress, GolfcraftMaterialsV2);
  console.log("GolfcraftMaterialsV2 at:", V2Address);
}
 
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });