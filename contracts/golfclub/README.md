# Golfclub contract

To deploy the contract you will need the following files on the `contracts` folder:
- .maticvigil: with the key for Matic Vigil
- .secret: with the a mnemotecnic phrase

To test run `npx hardhat test`
To flatte `npx hardhat flatten > flat.sol`

To deploy to mumbai run `npx hardhat run --network mumbai scripts/deploy.js`

Proxy: `0xF044647aF5d795A9459B7Bc0bD47625D4764a222` (visible address for the NFT)
Admin: `0x33761295C0c40CeBE10B0D8702807413Af3599fC` (contract used to upgrade)

Implementation V1: `0x1E13f0441b5f82BC1466Bf55Ab2C83e7dB51155c`
Implementation V2: `0x737a3Ed19F63f7b302CD9f2FC5762Ff2A51f0555` (current)
Implementation V3: `0xBEc73b51c053bD6a47aC0D934665DfE3A4D10812` (awaiting change)



Other commands:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat node
node scripts/deploy.js
npx hardhat help
```
