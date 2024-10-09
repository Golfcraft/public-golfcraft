const {upgrades} = require("hardhat");

async function main() {

    const trueAdmin = '0x5Ca6690fFC030fB09DbB49C24CDC78c1c8b59B9E';

    console.log("Transferring ownership of ProxyAdmin...");
    await upgrades.admin.transferProxyAdminOwnership(trueAdmin);
    console.log("Transferred ownership of ProxyAdmin to:", trueAdmin);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });