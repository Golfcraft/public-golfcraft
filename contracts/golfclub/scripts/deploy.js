// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const {ethers, upgrades} = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  // const CompicactusPFP = await hre.ethers.getContractFactory("CompicactusPFP");
  // const compicactusPFP = await CompicactusPFP.deploy("CompicactusPFP", "CPFP", "ipfs://baseUri");

  // await compicactusPFP.deployed();

  // console.log("Greeter deployed to:", compicactusPFP.address);
  const receiver = "0x5Ca6690fFC030fB09DbB49C24CDC78c1c8b59B9E";
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
  const PAUSER_ROLE = "0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a";
  const [owner] = await hre.ethers.getSigners();

  console.log("owner address", owner.address);
  const Golfclub = await ethers.getContractFactory("Golfclub");
  const golfclub = await upgrades.deployProxy(Golfclub, ["Golfcraft", "GCB", "https://mana-fever.com/golfcraft-game/token/"]);
  await golfclub.deployed();
  console.log("Golfclub deployed to:", golfclub.address);
  await golfclub.setContractURI("https://mana-fever.com/golfcraft-game/contract-metadata");
  await golfclub.setRoyalties(receiver, 100);

  await golfclub.setMaxSupply(0, 10);
  
  await golfclub.issue(receiver, 0);
  console.log("First minted");
  await golfclub.issue(receiver, 0);
  console.log("minted");
  await golfclub.issue(receiver, 0);
  console.log("minted");
  await golfclub.issue(receiver, 0);
  console.log("minted");
  await golfclub.issue(receiver, 0);
  console.log("minted");
  await golfclub.issue(receiver, 0);
  console.log("minted");
  await golfclub.issue(receiver, 0);
  console.log("minted");
  await golfclub.issue(receiver, 0);
  console.log("minted");
  await golfclub.issue(receiver, 0);
  console.log("minted");
  await golfclub.issue(receiver, 0);
  console.log("minted");
  
  await golfclub.grantRole(DEFAULT_ADMIN_ROLE, receiver);
  console.log("granted admin")
  await golfclub.grantRole(MINTER_ROLE, receiver);
  console.log("granted minter")
  await golfclub.grantRole(PAUSER_ROLE, receiver);
  console.log("granted pauser")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
