require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
require("hardhat-watcher");
require("@nomiclabs/hardhat-etherscan");
//require('hardhat-abi-exporter');

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
    watcher: {
        test: {
          tasks: ["test"],
          files: ["./test/golfclubs-test.js", "./contracts/Golfclub.sol"]
        }
    },
    solidity: {
        version: "0.8.7",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },

    networks: {
        hardhat: {
        },
        mumbai: {
            // url: 'https://polygon-mumbai.infura.io/v3/'+maticvigil,
            url: 'https://matic-mumbai.chainstacklabs.com/',
            chainId: 80001,
            gasPrice: 5000000000,
            accounts: {
                mnemonic: mnemonic,
            }
        },
        matic: {
            url: 'https://polygon-rpc.com',
            chainId: 137,
            //gasPrice: 100000000000,
            accounts: {
                mnemonic: mnemonic,
            }
        }
    }
};
