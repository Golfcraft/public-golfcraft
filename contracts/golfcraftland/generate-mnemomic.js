var bip39 = require('bip39')
const ethers = require('ethers');
const mnemonic = bip39.generateMnemonic()
console.log("mnemonic",mnemonic);
const wallet = ethers.Wallet.fromMnemonic(mnemonic);
console.log("wallet", wallet)

