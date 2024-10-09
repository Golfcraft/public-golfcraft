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

let safeTransferFromAbi = {
  "inputs": [
    {
      "internalType": "address",
      "name": "from",
      "type": "address"
    },
    {
      "internalType": "address",
      "name": "to",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "id",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "amount",
      "type": "uint256"
    },
    {
      "internalType": "bytes",
      "name": "data",
      "type": "bytes"
    }
  ],
  "name": "safeTransferFrom",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
};

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

describe("GolfcraftParts MetaTransactions", function () {
  let golfcraftparts;

    before(async () => {
        const GolfcraftParts = await ethers.getContractFactory("GolfcraftParts");
        golfcraftparts = await upgrades.deployProxy(GolfcraftParts, ["https://tokenuris/", "GolfcraftParts", "GCFTMTRLS", "https://contracturi/"]);
        await golfcraftparts.deployed();

        [defaultAdmin, secondAdmin, royaltyReceiver, account1, account2, minter] = await hre.ethers.getSigners();
    });

  it("mint MetaTransaction Test", async function () {
    const wallet = new MockProvider().createEmptyWallet();

    let name = await golfcraftparts.name();
    let nonce = await golfcraftparts.getNonce(wallet.getAddress());
    let version = "1";
    let chainId = await golfcraftparts.getChainId();
    let domainData = {
      name: name,
      version: version,
      verifyingContract: golfcraftparts.address,
      salt: '0x' + chainId.toHexString().substring(2).padStart(64, '0'),
    };

    //console.log(domainData);
    let user = await wallet.getAddress();

    let { r, s, v, functionSignature } = await getTransactionData(
      wallet,
      nonce,
      safeTransferFromAbi,
      domainData,
      [user, account1.address, 0, 5, "0x0"]
    );

    const mintTx = await golfcraftparts.mint(user, 0, 10, []);
    await mintTx.wait();

    expect((await golfcraftparts.balanceOf(account1.address, 0)).toString()).to.be.equal("0");

    const metaTransaction = await golfcraftparts.executeMetaTransaction(
      user,
      functionSignature,
      r,
      s,
      v
    );

    expect((await golfcraftparts.balanceOf(account1.address, 0)).toString()).to.be.equal("5");
  });
});
