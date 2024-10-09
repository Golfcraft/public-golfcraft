const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GolfcraftLand", function () {
    var golfcraftland;
    var parts;
    // const GOLFLAND_MINTER_ROLE = "0xaed02983f37273f28e6ff530f4a0645c3fbaa511bf24e60279c924e7028f6dd3";
    const REMOVER_ROLE = "0xa5b8043ff146249fc7b191de754c339b422b9e6e64402f2e2710f9b29796ed41";

    beforeEach(async function () {

        const GolfcraftLand = await ethers.getContractFactory("GolfcraftLand");
        golfcraftland = await upgrades.deployProxy(GolfcraftLand, []);
        await golfcraftland.deployed();

        const partsERC1155 = await ethers.getContractFactory("ERC1155PresetMinterPauserUpgradeable");
        parts = await upgrades.deployProxy(partsERC1155, ["ipfs://GolfcraftParts"]);
        await parts.deployed();

        [defaultAdmin, account1, account2, account3, remover1] = await hre.ethers.getSigners();

        // Minting test parts
        const mintPartsTx = await parts.mintBatch(account1.address, [0, 1], [4, 6], []);
        await mintPartsTx.wait();

        const mintParts2Tx = await parts.mintBatch(account2.address, [0, 1], [4, 6], []);
        await mintParts2Tx.wait();

        // Minting a test land
        const safeMintTx = await golfcraftland.safeMint(account1.address, 0);
        await safeMintTx.wait();

        const grantRoleTx = await golfcraftland.grantRole(REMOVER_ROLE, remover1.address);
        await grantRoleTx.wait();

        const approve1Tx = await parts.connect(account1).setApprovalForAll(golfcraftland.address, true);
        await approve1Tx.wait();

        const approve2Tx = await parts.connect(account2).setApprovalForAll(golfcraftland.address, true);
        await approve2Tx.wait();

        const setPartsContractTX = await golfcraftland.setPartsContract(parts.address);
        await setPartsContractTX.wait();
    });

    it("Can get URI", async function () {
        expect(await golfcraftland.tokenURI(0)).to.equal("https://0");
        expect(await golfcraftland.getCollectionId(0)).to.equal(0);
    });

    it("Cant mint if paused", async function () {
        const pauseTx = await golfcraftland.pause();
        await pauseTx.wait();

        await expect(golfcraftland.safeMint(account1.address, 0)).to.be.revertedWith("VM Exception while processing transaction: revert");
    });

    it("Shuld be owner, operator or manager to send parts to land", async function () {
        await expect(golfcraftland.movePartsToLand(0, [0, 1], [4, 6])
            ).to.be.revertedWith('GolfcraftLand: caller must be land owner, land operator or manager');
    });

    it("Can't send parts to land if paused", async function () {
        const pauseTx = await golfcraftland.pause();
        await pauseTx.wait();

        await expect(golfcraftland.movePartsToLand(0, [0, 1], [4, 6])
            ).to.be.revertedWith("VM Exception while processing transaction: revert");
    });

    it("Land owner can send parts to land", async function () {
        expect(await golfcraftland.getPartAmount(0, 0)).to.equal(0);

        const sendPartsTx = await golfcraftland.connect(account1).movePartsToLand(0, [0, 1], [4, 6]);
        await sendPartsTx.wait();

        expect(await golfcraftland.getPartAmount(0, 0)).to.equal(4);
        expect(await golfcraftland.getPartAmount(0, 1)).to.equal(6);

        const balanceOfAccount1 = await parts.balanceOfBatch([account1.address, golfcraftland.address], [0, 0]);
        expect(balanceOfAccount1[0].toString()).to.be.equal("0");
        expect(balanceOfAccount1[1].toString()).to.be.equal("4");
    });

    it("REMOVER_ROLE can retrieve from land", async function () {
        const sendPartsTx = await golfcraftland.connect(account1).movePartsToLand(0, [0, 1], [4, 6]);
        await sendPartsTx.wait();

        const retrievePartsTx = await golfcraftland.connect(remover1).movePartsFromLand(account1.address, 0, [0, 1], [4, 6]);
        await retrievePartsTx.wait();

        expect(await golfcraftland.getPartAmount(0, 0)).to.equal(0);
        expect(await golfcraftland.getPartAmount(0, 1)).to.equal(0);

        const balanceOfAccount1 = await parts.balanceOfBatch([account1.address, account1.address], [0, 1]);
        expect(balanceOfAccount1[0].toString()).to.be.equal("4");
        expect(balanceOfAccount1[1].toString()).to.be.equal("6");
    });

    it("Can't retrieve from land if paused", async function () {
        const sendPartsTx = await golfcraftland.connect(account1).movePartsToLand(0, [0, 1], [4, 6]);
        await sendPartsTx.wait();

        const pauseTx = await golfcraftland.pause();
        await pauseTx.wait();

        await expect(golfcraftland.connect(remover1).movePartsFromLand(account1.address, 0, [0, 1], [4, 6])
            ).to.be.revertedWith("VM Exception while processing transaction: revert");
    });

    it("Only REMOVER_ROLE can retrieve from land", async function () {
        const sendPartsTx = await golfcraftland.connect(account1).movePartsToLand(0, [0, 1], [4, 6]);
        await sendPartsTx.wait();

        await expect(golfcraftland.connect(account1).movePartsFromLand(account1.address, 0, [0, 1], [4, 6])
            ).to.be.revertedWith('GolfcraftLand: must have REMOVER_ROLE role');
    });

    it("REMOVER_ROLE can't get free parts from land", async function () {
        const sendPartsTx = await golfcraftland.connect(account1).movePartsToLand(0, [0, 1], [4, 6]);
        await sendPartsTx.wait();

        await expect(golfcraftland.connect(remover1).movePartsFromLand(account1.address, 0, [0, 1], [4, 7])
            ).to.be.revertedWith('GolfcraftLand: part amount is less than requested amount');
    });

    it("Only owner can set land Operator", async function () {
        await expect(golfcraftland.setLandOperator(0, account2.address)
            ).to.be.revertedWith('GolfcraftLand: not land owner');
    });

    it("Land operator can send parts to land", async function () {
        expect(await golfcraftland.getPartAmount(0, 0)).to.equal(0);

        const setLandOperatorTx = await golfcraftland.connect(account1).setLandOperator(0, account2.address);
        await setLandOperatorTx.wait();

        const sendPartsTx = await golfcraftland.connect(account2).movePartsToLand(0, [0, 1], [4, 6]);
        await sendPartsTx.wait();

        expect(await golfcraftland.getPartAmount(0, 0)).to.equal(4);
        expect(await golfcraftland.getPartAmount(0, 1)).to.equal(6);

        const balanceOfAccount1 = await parts.balanceOfBatch([account2.address, golfcraftland.address], [0, 0]);
        expect(balanceOfAccount1[0].toString()).to.be.equal("0");
        expect(balanceOfAccount1[1].toString()).to.be.equal("4");
    });

    it("Manager can send parts to land", async function () {
        expect(await golfcraftland.getPartAmount(0, 0)).to.equal(0);

        const setLandManagerTx = await golfcraftland.connect(account1).setLandManager(account2.address);
        await setLandManagerTx.wait();

        const sendPartsTx = await golfcraftland.connect(account2).movePartsToLand(0, [0, 1], [4, 6]);
        await sendPartsTx.wait();

        expect(await golfcraftland.getPartAmount(0, 0)).to.equal(4);
        expect(await golfcraftland.getPartAmount(0, 1)).to.equal(6);

        const balanceOfAccount1 = await parts.balanceOfBatch([account2.address, golfcraftland.address], [0, 0]);
        expect(balanceOfAccount1[0].toString()).to.be.equal("0");
        expect(balanceOfAccount1[1].toString()).to.be.equal("4");
    });

    it("User can send part to storage", async function () {

        const balanceOfAccount1 = await parts.balanceOfBatch([account1.address, account2.address], [0, 0]);
        expect(balanceOfAccount1[0].toString()).to.be.equal("4");
        expect(balanceOfAccount1[1].toString()).to.be.equal("4");

        const sendPartsTx = await golfcraftland.connect(account1).storeParts(account2.address, [0, 1], [4, 6]);
        await sendPartsTx.wait();

        const balanceOfAccount2 = await parts.balanceOfBatch([account1.address, account2.address], [0, 0]);
        expect(balanceOfAccount2[0].toString()).to.be.equal("0");
        expect(balanceOfAccount2[1].toString()).to.be.equal("4");

        expect(await golfcraftland.connect(account1).getPartAmountStored(account2.address, 0)).to.equal(4);
        expect(await golfcraftland.connect(account1).getPartAmountStored(account2.address, 1)).to.equal(6);
    });

    it("Can't send parts to storage if paused", async function () {
        const pauseTx = await golfcraftland.pause();
        await pauseTx.wait();

        await expect(golfcraftland.connect(account1).storeParts(account2.address, [0, 1], [4, 6])
            ).to.be.revertedWith("VM Exception while processing transaction: revert");
    });

    it("User can get parts from storage", async function () {
        const sendPartsTx = await golfcraftland.connect(account1).storeParts(account2.address, [0, 1], [4, 6]);
        await sendPartsTx.wait();

        const unstorePartsTx = await golfcraftland.connect(account1).unstoreParts(account2.address, [0, 1], [4, 6]);
        await unstorePartsTx.wait();

        const balanceOfAccount2 = await parts.balanceOfBatch([account1.address, account2.address], [0, 0]);
        expect(balanceOfAccount2[0].toString()).to.be.equal("4");
        expect(balanceOfAccount2[1].toString()).to.be.equal("4");

        expect(await golfcraftland.connect(account1).getPartAmountStored(account2.address, 0)).to.equal(0);
        expect(await golfcraftland.connect(account1).getPartAmountStored(account2.address, 1)).to.equal(0);
    });

    it("Can't get parts from storage if paused", async function () {
        const pauseTx = await golfcraftland.pause();
        await pauseTx.wait();

        await expect(golfcraftland.connect(account1).unstoreParts(account2.address, [0, 1], [4, 6])
            ).to.be.revertedWith("VM Exception while processing transaction: revert");
    });

    it("User can't get free parts from storage", async function () {
        const sendPartsTx = await golfcraftland.connect(account1).storeParts(account2.address, [0, 1], [4, 6]);
        await sendPartsTx.wait();

        await expect(golfcraftland.connect(account1).unstoreParts(account2.address, [0, 1], [4, 600])
            ).to.be.revertedWith('GolfcraftLand: part amount is less than requested amount');
    });

    it("Operator can send parts from storage to operated land", async function () {
        const sendPartsTx = await golfcraftland.connect(account1).storeParts(account3.address, [0, 1], [4, 6]);
        await sendPartsTx.wait();

        const setLandOperatorTx = await golfcraftland.connect(account1).setLandOperator(0, account3.address);
        await setLandOperatorTx.wait();

        const sendPartsTx2 = await golfcraftland.connect(account3).unstorePartsToLand(0, [0, 1], [4, 6]);
        await sendPartsTx2.wait();

        const balanceOfAccount2 = await parts.balanceOfBatch([account1.address, account3.address], [0, 0]);
        expect(balanceOfAccount2[0].toString()).to.be.equal("0");
        expect(balanceOfAccount2[1].toString()).to.be.equal("0");

        expect(await golfcraftland.getPartAmount(0, 0)).to.equal(4);
        expect(await golfcraftland.getPartAmount(0, 1)).to.equal(6);
    });

    it("Can't unstorePartsToLand if paused", async function () {
        const pauseTx = await golfcraftland.pause();
        await pauseTx.wait();

        await expect(golfcraftland.connect(account1).unstorePartsToLand(0, [0, 1], [4, 6])
            ).to.be.revertedWith("VM Exception while processing transaction: revert");
    });

    it("Manager can send parts from storage to managed land", async function () {
        const sendPartsTx = await golfcraftland.connect(account1).storeParts(account3.address, [0, 1], [4, 6]);
        await sendPartsTx.wait();

        const setLandOperatorTx = await golfcraftland.connect(account1).setLandManager(account3.address);
        await setLandOperatorTx.wait();

        const sendPartsTx2 = await golfcraftland.connect(account3).unstorePartsToLand(0, [0, 1], [4, 6]);
        await sendPartsTx2.wait();

        const balanceOfAccount2 = await parts.balanceOfBatch([account1.address, account3.address], [0, 0]);
        expect(balanceOfAccount2[0].toString()).to.be.equal("0");
        expect(balanceOfAccount2[1].toString()).to.be.equal("0");

        expect(await golfcraftland.getPartAmount(0, 0)).to.equal(4);
        expect(await golfcraftland.getPartAmount(0, 1)).to.equal(6);
    });
});
