const { ethers, upgrades } = require("hardhat");

async function main() {
  const proxyAddress = '0xf044647af5d795a9459b7bc0bd47625d4764a222';
 
  const GolfclubV3 = await ethers.getContractFactory("GolfclubV3");
  console.log("Preparing upgrade...");
  const V3Address = await upgrades.prepareUpgrade(proxyAddress, GolfclubV3);
  console.log("GolfclubV3 at:", V3Address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });