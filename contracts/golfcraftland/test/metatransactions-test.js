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

let grantRoleAbi = {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
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

describe("GolfcraftLand MetaTransactions", function () {
  let golfcraftland;

    before(async () => {

      const GolfcraftCrafting = await ethers.getContractFactory("GolfcraftLand");
      golfcraftland = await upgrades.deployProxy(GolfcraftCrafting, []);
      await golfcraftland.deployed();

        [defaultAdmin, secondAdmin, royaltyReceiver, account1, account2, minter] = await hre.ethers.getSigners();
    });

  it("grantRole MetaTransaction Test", async function () {
    const wallet = new MockProvider().createEmptyWallet();

    let name = await golfcraftland.name();
    let nonce = await golfcraftland.getNonce(wallet.getAddress());
    let version = "1";
    let chainId = await golfcraftland.getChainId();
    let domainData = {
      name: name,
      version: version,
      verifyingContract: golfcraftland.address,
      salt: '0x' + chainId.toHexString().substring(2).padStart(64, '0'),
    };

    //console.log(domainData);
    let user = await wallet.getAddress();

    let { r, s, v, functionSignature } = await getTransactionData(
      wallet,
      nonce,
      grantRoleAbi,
      domainData,
      [DEFAULT_ADMIN_ROLE, account2.address]
    );

    const grantRoleTx = await golfcraftland.grantRole(DEFAULT_ADMIN_ROLE, user);
    await grantRoleTx.wait();

    const metaTransaction = await golfcraftland.executeMetaTransaction(
      user,
      functionSignature,
      r,
      s,
      v
    );

    let hasRole = await golfcraftland.hasRole(DEFAULT_ADMIN_ROLE, account2.address);
    expect(hasRole).to.be.true;
  });
});
