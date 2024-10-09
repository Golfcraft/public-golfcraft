const sigUtil = require("eth-sig-util");
const ethUtils = require("ethereumjs-util");

const { expect } = require("chai");
const { ethers } = require("hardhat");

const web3Abi = require("web3-eth-abi");
const { MockProvider } = require("ethereum-waffle");

const domainType = [
  {
    name: "name",
    type: "string",
  },
  {
    name: "version",
    type: "string",
  },
  {
    name: "verifyingContract",
    type: "address",
  },
  {
    name: "salt",
    type: "bytes32",
  },
];

const metaTransactionType = [
  {
    name: "nonce",
    type: "uint256",
  },
  {
    name: "from",
    type: "address",
  },
  {
    name: "functionSignature",
    type: "bytes",
  },
];

let setERC1155Abi = {
  "inputs": [
    {
      "internalType": "address",
      "name": "elementsERC1155",
      "type": "address"
    },
    {
      "internalType": "address",
      "name": "partsERC1155",
      "type": "address"
    }
  ],
  "name": "setERC1155",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
};

const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const getTransactionData = async (user, nonce, abi, domainData, params) => {
  const functionSignature = web3Abi.encodeFunctionCall(abi, params);

  let message = {};
  message.nonce = parseInt(nonce);
  message.from = await user.getAddress();
  message.functionSignature = functionSignature;

  const dataToSign = {
    types: {
      EIP712Domain: domainType,
      MetaTransaction: metaTransactionType,
    },
    domain: domainData,
    primaryType: "MetaTransaction",
    message: message,
  };

  const signature = sigUtil.signTypedData(ethUtils.toBuffer(user.privateKey), {
    data: dataToSign,
  });

  let r = signature.slice(0, 66);
  let s = "0x".concat(signature.slice(66, 130));
  let v = "0x".concat(signature.slice(130, 132));
  v = parseInt(v);
  if (![27, 28].includes(v)) v += 27;

  return {
    r,
    s,
    v,
    functionSignature,
  };
};

describe("GolfcraftCrafting MetaTransactions", function () {
  let golfcraftcrafting;
  let materials;
  let parts;

    before(async () => {
      const materialsERC1155 = await ethers.getContractFactory("ERC1155PresetMinterPauserUpgradeable");
      materials = await materialsERC1155.deploy();

      const partsERC1155 = await ethers.getContractFactory("ERC1155PresetMinterPauserUpgradeable");
      parts = await partsERC1155.deploy();

      const GolfcraftCrafting = await ethers.getContractFactory("GolfcraftCrafting");
      golfcraftcrafting = await upgrades.deployProxy(GolfcraftCrafting, ["GolfcraftCrafting", materials.address, parts.address]);
      await golfcraftcrafting.deployed();

        [defaultAdmin, secondAdmin, royaltyReceiver, account1, account2, minter] = await hre.ethers.getSigners();
    });

  it("mint MetaTransaction Test", async function () {
    const wallet = new MockProvider().createEmptyWallet();

    let name = await golfcraftcrafting.name();
    let nonce = await golfcraftcrafting.getNonce(wallet.getAddress());
    let version = "1";
    let chainId = await golfcraftcrafting.getChainId();
    let domainData = {
      name: name,
      version: version,
      verifyingContract: golfcraftcrafting.address,
      salt: '0x' + chainId.toHexString().substring(2).padStart(64, '0'),
    };

    //console.log(domainData);
    let user = await wallet.getAddress();

    let { r, s, v, functionSignature } = await getTransactionData(
      wallet,
      nonce,
      setERC1155Abi,
      domainData,
      [account1.address, account2.address]
    );

    const grantRoleTx = await golfcraftcrafting.grantRole(DEFAULT_ADMIN_ROLE, user);
    await grantRoleTx.wait();

    const old_erc1155 = await golfcraftcrafting._elementsERC1155();
    expect(old_erc1155.toString()).to.be.equal(materials.address);

    const metaTransaction = await golfcraftcrafting.executeMetaTransaction(
      user,
      functionSignature,
      r,
      s,
      v
    );

    const new_erc1155 = await golfcraftcrafting._elementsERC1155();
    expect(new_erc1155.toString()).to.be.equal(account1.address);
  });
});
