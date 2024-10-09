const { expect } = require("chai");
const { ethers } = require("hardhat");
const sigUtil = require("@metamask/eth-sig-util");


describe("WSDeployer (Standalone)", function () {
    let wsdeployer;
    let wearable;
    let erc721;
    let collectionName  = "Test Collection";
    let accounts;
    const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
    const ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';

    beforeEach(async function () {
        const WSDeployer = await ethers.getContractFactory("WSDeployer");
        wsdeployer = await WSDeployer.deploy();
        await wsdeployer.deployed();

        const ERC721 = await ethers.getContractFactory("ERC721PresetMinterPauserAutoId");
        erc721 = await ERC721.deploy("ERC721", "ERC721", "https://");
        await erc721.deployed();

        const Wearable = await ethers.getContractFactory("Wearable");
        wearable = await Wearable.deploy();
        await wearable.deployed();

        accounts = await hre.ethers.getSigners();
    });

    it("Should be able to send NFTs", async function () {

        // ERC721 is stored on deployer

        const mintTX = await erc721.mint(wsdeployer.address);
        await mintTX.wait();

        const balance = await erc721.balanceOf(wsdeployer.address);
        expect(balance).to.equal(1);

        const tokenId = await erc721.tokenOfOwnerByIndex(wsdeployer.address, 0);
        expect(tokenId).to.equal(0);

        const sendNFTTXr = wsdeployer.sendNFT(erc721.address, accounts[1].address);
        await expect(sendNFTTXr).to.be.revertedWith('WSDeployer: Sender should be minter');

        const grantRoleTX = await wsdeployer.grantRole(MINTER_ROLE, accounts[0].address);
        await grantRoleTX.wait();

        const sendNFTTX = await wsdeployer.sendNFT(erc721.address, accounts[1].address);
        await sendNFTTX.wait();

        const balance2 = await erc721.balanceOf(accounts[1].address);
        expect(balance2).to.equal(1);

        const balance3 = await erc721.balanceOf(wsdeployer.address);
        expect(balance3).to.equal(0);
    });

    it("Should be able to relay send NFTs", async function () {

        const deployWearablesStorageTX = await wsdeployer.deployWearablesStorage(collectionName);
        const receipt = await deployWearablesStorageTX.wait();

        const _event = getContractCreated(receipt);

        const WearablesStorage = await ethers.getContractFactory("WearablesStorage");
        const storage = await WearablesStorage.attach(_event.newAddress);

        //

        const mintTX = await erc721.mint(storage.address);
        await mintTX.wait();

        const balance = await erc721.balanceOf(storage.address);
        expect(balance).to.equal(1);

        const tokenId = await erc721.tokenOfOwnerByIndex(storage.address, 0);
        expect(tokenId).to.equal(0);

        const sendNFTTXr = wsdeployer.relaySendNFT(storage.address, erc721.address, accounts[1].address);
        await expect(sendNFTTXr).to.be.revertedWith('WSDeployer: Sender should be minter');

        const grantRoleTX = await wsdeployer.grantRole(MINTER_ROLE, accounts[0].address);
        await grantRoleTX.wait();

        const sendNFTTXr2 = wsdeployer.relaySendNFT(storage.address, erc721.address, accounts[1].address);
        await expect(sendNFTTXr2).to.be.revertedWith('WearablesStorage: Sender should be admin');

        const grantRoleTX2 = await storage.grantRole(ADMIN_ROLE, wsdeployer.address);
        await grantRoleTX2.wait();

        const sendNFTTX = await wsdeployer.relaySendNFT(storage.address, erc721.address, accounts[1].address);
        await sendNFTTX.wait();

        const balance2 = await erc721.balanceOf(accounts[1].address);
        expect(balance2).to.equal(1);

        const balance3 = await erc721.balanceOf(wsdeployer.address);
        expect(balance3).to.equal(0);
    });

    /*
    it("Should be able to send NFTs from", async function () {
        const deployWearablesStorageTX = await wsdeployer.deployWearablesStorage(collectionName);
        const receipt = await deployWearablesStorageTX.wait();

        const _event = getContractCreated(receipt);

        const WearablesStorage = await ethers.getContractFactory("WearablesStorage");
        const storage = await WearablesStorage.attach(_event.newAddress);

        // ERC721 is stored on accounts[5]

        const mintTX = await erc721.mint(accounts[5].address);
        await mintTX.wait();

        const balance = await erc721.balanceOf(accounts[5].address);
        expect(balance).to.equal(1);

        const tokenId = await erc721.tokenOfOwnerByIndex(accounts[5].address, 0);
        expect(tokenId).to.equal(0);

        const setApprovalForAllTX = await erc721.connect(accounts[5]).setApprovalForAll(storage.address, true);
        await setApprovalForAllTX.wait();

        const sendNFTTXr = wsdeployer.relaySendNFTFrom(storage.address, erc721.address, accounts[5].address, accounts[1].address);
        await expect(sendNFTTXr).to.be.revertedWith('WSDeployer: Sender should be minter');

        wsdeployer.grantRole(MINTER_ROLE, accounts[0].address);

        const sendNFTTXr2 = wsdeployer.relaySendNFTFrom(storage.address, erc721.address, accounts[5].address, accounts[1].address);
        await expect(sendNFTTXr2).to.be.revertedWith('WearablesStorage: Sender should be admin');

        storage.grantRole(ADMIN_ROLE, wsdeployer.address);

        const sendNFTTX = await wsdeployer.relaySendNFTFrom(storage.address, erc721.address, accounts[5].address, accounts[1].address);
        await sendNFTTX.wait();

        const balance2 = await erc721.balanceOf(accounts[1].address);
        expect(balance2).to.equal(1);

        const balance3 = await erc721.balanceOf(accounts[5].address);
        expect(balance3).to.equal(0);
    });
    */

    it("Should be able to relay send NFTs from", async function () {

        // ERC721 is stored on accounts[5]

        const mintTX = await erc721.mint(accounts[5].address);
        await mintTX.wait();

        const balance = await erc721.balanceOf(accounts[5].address);
        expect(balance).to.equal(1);

        const tokenId = await erc721.tokenOfOwnerByIndex(accounts[5].address, 0);
        expect(tokenId).to.equal(0);

        const setApprovalForAllTX = await erc721.connect(accounts[5]).setApprovalForAll(wsdeployer.address, true);
        await setApprovalForAllTX.wait();

        const sendNFTTXr = wsdeployer.sendNFTFrom(erc721.address, accounts[5].address, accounts[1].address);

        await expect(sendNFTTXr).to.be.revertedWith('WSDeployer: Sender should be minter');

        const grantRoleTX = await wsdeployer.grantRole(MINTER_ROLE, accounts[0].address);
        await grantRoleTX.wait();

        const sendNFTTX = await wsdeployer.sendNFTFrom(erc721.address, accounts[5].address, accounts[1].address);
        await sendNFTTX.wait();

        const balance2 = await erc721.balanceOf(accounts[1].address);
        expect(balance2).to.equal(1);

        const balance3 = await erc721.balanceOf(accounts[5].address);
        expect(balance3).to.equal(0);
    });

    it("Should be able to relay issueTokens", async function () {
        const issueTokensTX = await wearable.issueTokens([accounts[0].address], [0]);
        await issueTokensTX.wait();

        const relayIssueTokensTXr = wsdeployer.relayIssueTokens(wearable.address, [accounts[0].address], [0]);
        await expect(relayIssueTokensTXr).to.be.revertedWith('WSDeployer: Sender should be minter');

        const grantRoleTX = await wsdeployer.grantRole(MINTER_ROLE, accounts[0].address);
        await grantRoleTX.wait();

        const relayIssueTokensTX = await wsdeployer.relayIssueTokens(wearable.address, [accounts[0].address], [0]);
        await relayIssueTokensTX.wait();
    });

    it("Should be able to setAprovalForAll", async function () {

        const mintTX = await erc721.mint(wsdeployer.address);
        await mintTX.wait();

        const balance = await erc721.balanceOf(wsdeployer.address);
        expect(balance).to.equal(1);

        const tokenId = await erc721.tokenOfOwnerByIndex(wsdeployer.address, 0);
        expect(tokenId).to.equal(0);

        const setAprovalForAllTX = await wsdeployer.setApprovalForAll(erc721.address, accounts[0].address, true);
        await setAprovalForAllTX.wait();

        const safeTransferFromTX = await erc721['safeTransferFrom(address,address,uint256)'](wsdeployer.address, accounts[1].address, tokenId);
        await safeTransferFromTX.wait();

        const balance2 = await erc721.balanceOf(accounts[1].address);
        expect(balance2).to.equal(1);

        const balance3 = await erc721.balanceOf(wsdeployer.address);
        expect(balance3).to.equal(0);

    });

    it("Should be able to handle metatransactions", async function () {
        // Setup
        const mintTX = await erc721.mint(accounts[5].address);
        await mintTX.wait();

        const balance = await erc721.balanceOf(accounts[5].address);
        expect(balance).to.equal(1);

        const tokenId = await erc721.tokenOfOwnerByIndex(accounts[5].address, 0);
        expect(tokenId).to.equal(0);

        const setApprovalForAllTX = await erc721.connect(accounts[5]).setApprovalForAll(wsdeployer.address, true);
        await setApprovalForAllTX.wait();

        const grantRoleTX = await wsdeployer.grantRole(MINTER_ROLE, accounts[0].address);
        await grantRoleTX.wait();

        // Test
        let nonce = await wsdeployer.getNonce(accounts[0].address);

        const WSDeployer = await ethers.getContractFactory("WSDeployer");
        const ABI = WSDeployer.interface.format(ethers.utils.FormatTypes.full);

        let iface = new ethers.utils.Interface(ABI);
        let functionSignature = iface.encodeFunctionData("sendNFTFrom", [erc721.address, accounts[5].address, accounts[1].address]);

        let message = {};
        message.nonce = parseInt(nonce);
        message.from = accounts[0].address;
        message.functionSignature = functionSignature;

        let domainData = {
          name: "Golfcraft Deployer",
          version: "3",
          salt: '0x' + (grantRoleTX.chainId).toString(16).padStart(64, '0'),
          verifyingContract: wsdeployer.address
        };

        const dataToSign = {
          types: {
            EIP712Domain: domainType,
            MetaTransaction: metaTransactionType
          },
          domain: domainData,
          primaryType: "MetaTransaction",
          message: message
        };
        // NOTE: get privatekey by running 'npx hardhat node'
        // without "x0"
        const pk = Buffer.from("ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", 'hex')
        const data = {
            privateKey: pk,
            data: dataToSign,
            version: 'V4'
        }
        const signature = sigUtil.signTypedData(data);
        let { r, s, v } = getSignatureParameters(signature);

        // userAddress, functionSignature, R, S, V
        const executeMetaTransactionTX = await wsdeployer.executeMetaTransaction(accounts[0].address, functionSignature, r, s, v);
        await executeMetaTransactionTX.wait();

        const balance2 = await erc721.balanceOf(accounts[1].address);
        expect(balance2).to.equal(1);

        const balance3 = await erc721.balanceOf(wsdeployer.address);
        expect(balance3).to.equal(0);
    });
});

function getContractCreated(receipt) {
    const interface = new ethers.utils.Interface(["event ContractCreated(address newAddress)"]);
    const data = receipt.logs[1].data;
    const topics = receipt.logs[1].topics;
    return interface.decodeEventLog("ContractCreated", data, topics);
}


const domainType = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "verifyingContract", type: "address" },
  { name: "salt", type: "bytes32" }
];

const metaTransactionType = [
  { name: "nonce", type: "uint256" },
  { name: "from", type: "address" },
  { name: "functionSignature", type: "bytes" }
];

const getSignatureParameters = signature => {
    if (!ethers.utils.isHexString(signature)) {
      throw new Error(
        'Given value "'.concat(signature, '" is not a valid hex string.')
      );
    }
    var r = signature.slice(0, 66);
    var s = "0x".concat(signature.slice(66, 130));
    var v = "0x".concat(signature.slice(130, 132));
    v = ethers.BigNumber.from(v).toNumber();
    if (![27, 28].includes(v)) v += 27;
    return {
      r: r,
      s: s,
      v: v
    };
  };
