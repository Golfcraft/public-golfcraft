require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');

const fs = require('fs');
const maticvigil = fs.readFileSync("../.maticvigil").toString().trim();
const mnemonic = fs.readFileSync("../.secret").toString().trim();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
      version: "0.8.15",
      settings: {
          optimizer: {
              enabled: true,
              runs: 200
          }
      },
  },

  networks: {
      hardhat: {
      },
      mumbai: {
          // url: 'https://polygon-mumbai.infura.io/v3/'+maticvigil,
          url: 'https://matic-mumbai.chainstacklabs.com/',
          chainId: 80001,
          accounts: {
              mnemonic: mnemonic,
          }
      },
      matic: {
          //url: 'https://nd-387-013-487.p2pify.com/c1e5307bf4fc046e608bfca833a73c6a',
          //url: 'https://rpc-mainnet.maticvigil.com/v1/'+maticvigil,
          url: 'https://polygon-rpc.com',
          chainId: 137,
          accounts: {
              mnemonic: mnemonic,
          }
      }
  }
};
