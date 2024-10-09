const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");


describe("GolfcraftParts", function () {
    let golfcraftparts;
    const GOLFLAND_MINTER_ROLE = "0xaed02983f37273f28e6ff530f4a0645c3fbaa511bf24e60279c924e7028f6dd3";

    beforeEach(async function () {
        const GolfcraftPartsOld = await ethers.getContractFactory("GolfcraftParts");
        const GolfcraftParts = await ethers.getContractFactory("GolfcraftPartsV2");

        golfcraftpartsold = await upgrades.deployProxy(GolfcraftPartsOld, ["https://tokenuris/", "GolfcraftParts", "GCFTMTRLS", "https://contracturi/"]);
        //await golfcraftparts.deployed();
        golfcraftparts = await upgrades.upgradeProxy(golfcraftpartsold.address, GolfcraftParts);

        [defaultAdmin, secondAdmin, royaltyReceiver, account1, account2, minter] = await hre.ethers.getSigners();
    });

    it("Setting owner", async function () {

        expect(await golfcraftparts.owner()).to.equal(defaultAdmin.address);

        await expect(
            golfcraftparts.connect(account1).transferOwnership(secondAdmin.address)
        ).to.be.revertedWith('Ownable: caller is not the owner');

        const setContractURITx = await golfcraftparts.transferOwnership(secondAdmin.address);
        await setContractURITx.wait();

        expect(await golfcraftparts.owner()).to.equal(secondAdmin.address);
    });

    it("initializeEIP712 should revert", async function () {
        await expect(
            golfcraftparts.connect(account1).initializeEIP712("GolfcraftParts")
        ).to.be.revertedWith('admin');

        await expect(
            golfcraftparts.initializeEIP712("GolfcraftParts")
        ).to.be.revertedWith('already initialized');
    });

    it("Setting contractURI", async function () {

        await expect(
            golfcraftparts.connect(account1).setContractURI("https://test")
        ).to.be.revertedWith('GolfcraftParts: must have admin role to change contract uri');

        const setContractURITx = await golfcraftparts.setContractURI("https://test");
        await setContractURITx.wait();

        expect(await golfcraftparts.contractURI()).to.equal("https://test");
    });

    it("Setting setBaseURI", async function () {

        await expect(
            golfcraftparts.connect(account1).setBaseURI("https://test")
        ).to.be.revertedWith('GolfcraftParts: must have admin role to change base token uri');

        expect(await golfcraftparts.uri(0)).to.equal("https://tokenuris/");

        const setBaseURITx = await golfcraftparts.setBaseURI("https://test");
        await setBaseURITx.wait();

        expect(await golfcraftparts.uri(0)).to.equal("https://test");
    });

    it("Setting setRoyalties", async function () {

        await expect(
            golfcraftparts.connect(account1).setRoyalties(royaltyReceiver.address, 500)
        ).to.be.revertedWith('admin');

        const setRoyaltiesTx = await golfcraftparts.setRoyalties(royaltyReceiver.address, 500);
        await setRoyaltiesTx.wait();

        const [receiver, amount] = await golfcraftparts.royaltyInfo(0, 100)

        expect(receiver).to.be.equal(royaltyReceiver.address);
        expect(amount.toString()).to.be.equal("5");
    });

    it("Minting", async function () {

        await expect(
            golfcraftparts.connect(account1).mint(account1.address, 0, 10, [])
        ).to.be.revertedWith('ERC1155PresetMinterPauser: must have minter role to mint');

        expect(await golfcraftparts.exists(0)).to.equal(false);

        const mintTx = await golfcraftparts.mint(account1.address, 0, 10, []);
        await mintTx.wait();

        expect(await golfcraftparts.exists(0)).to.equal(true);

        expect((await golfcraftparts.balanceOf(account1.address, 0)).toString()).to.be.equal("10");

        expect((await golfcraftparts.totalSupply(0)).toString()).to.be.equal("10");
    });

    it("golfland minter role isAprovedForAll", async function () {
        expect(await golfcraftparts.isApprovedForAll(defaultAdmin.address, minter.address)).to.equal(false);

        await golfcraftparts.grantRole(GOLFLAND_MINTER_ROLE, minter.address);

        expect(await golfcraftparts.isApprovedForAll(defaultAdmin.address, minter.address)).to.equal(true);
    });

});
