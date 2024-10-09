const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");


describe("GolfcraftMaterials", function () {
    let golfcraftmaterials;
    const PART_MINTER_ROLE = "0xcb8142483841fa53b4de45b67ba7726a18e5c5238be70795ca2ce9c525146b2c";

    beforeEach(async function () {
        const GolfcraftMaterialsOld = await ethers.getContractFactory("GolfcraftMaterials");
        const GolfcraftMaterials = await ethers.getContractFactory("GolfcraftMaterialsV2");

        golfcraftmaterials = await upgrades.deployProxy(GolfcraftMaterialsOld, ["https://tokenuris/", "GolfcraftMaterials", "GCFTMTRLS", "https://contracturi/"]);
        //await golfcraftmaterials.deployed();
        golfcraftmaterials = await upgrades.upgradeProxy(golfcraftmaterials.address, GolfcraftMaterials);
        //console.log(await golfcraftmaterials.PART_MINTER_ROLE())
        [defaultAdmin, secondAdmin, royaltyReceiver, account1, account2, minter] = await hre.ethers.getSigners();
    });

    it("initializeEIP712 should revert", async function () {
        await expect(
            golfcraftmaterials.connect(account1).initializeEIP712("GolfcraftMaterials")
        ).to.be.revertedWith('admin');

        await expect(
            golfcraftmaterials.initializeEIP712("GolfcraftMaterials")
        ).to.be.revertedWith('already initialized');
    });

    it("Setting contractURI", async function () {

        await expect(
            golfcraftmaterials.connect(account1).setContractURI("https://test")
        ).to.be.revertedWith('GolfcraftMaterials: must have admin role to change contract uri');

        const setContractURITx = await golfcraftmaterials.setContractURI("https://test");
        await setContractURITx.wait();

        expect(await golfcraftmaterials.contractURI()).to.equal("https://test");
    });

    it("Setting setBaseURI", async function () {

        await expect(
            golfcraftmaterials.connect(account1).setBaseURI("https://test")
        ).to.be.revertedWith('GolfcraftMaterials: must have admin role to change base token uri');

        expect(await golfcraftmaterials.uri(0)).to.equal("https://tokenuris/");

        const setBaseURITx = await golfcraftmaterials.setBaseURI("https://test");
        await setBaseURITx.wait();

        expect(await golfcraftmaterials.uri(0)).to.equal("https://test");
    });

    it("Setting setRoyalties", async function () {

        await expect(
            golfcraftmaterials.connect(account1).setRoyalties(royaltyReceiver.address, 500)
        ).to.be.revertedWith('admin');

        const setRoyaltiesTx = await golfcraftmaterials.setRoyalties(royaltyReceiver.address, 500);
        await setRoyaltiesTx.wait();

        const [receiver, amount] = await golfcraftmaterials.royaltyInfo(0, 100)

        expect(receiver).to.be.equal(royaltyReceiver.address);
        expect(amount.toString()).to.be.equal("5");
    });

    it("Minting", async function () {

        await expect(
            golfcraftmaterials.connect(account1).mint(account1.address, 0, 10, [])
        ).to.be.revertedWith('ERC1155PresetMinterPauser: must have minter role to mint');

        expect(await golfcraftmaterials.exists(0)).to.equal(false);

        const mintTx = await golfcraftmaterials.mint(account1.address, 0, 10, []);
        await mintTx.wait();

        expect(await golfcraftmaterials.exists(0)).to.equal(true);

        expect((await golfcraftmaterials.balanceOf(account1.address, 0)).toString()).to.be.equal("10");

        expect((await golfcraftmaterials.totalSupply(0)).toString()).to.be.equal("10");
    });

    it("Part minter role isAprovedForAll", async function () {
        expect(await golfcraftmaterials.isApprovedForAll(defaultAdmin.address, minter.address)).to.equal(false);

        await golfcraftmaterials.grantRole(PART_MINTER_ROLE, minter.address);

        expect(await golfcraftmaterials.isApprovedForAll(defaultAdmin.address, minter.address)).to.equal(true);
    });

    it("Set ownership to admin", async function () {
        expect(await golfcraftmaterials.owner()).to.equal(ethers.constants.AddressZero);

        await golfcraftmaterials.setOwnershipToAdmin();
        expect(await golfcraftmaterials.owner()).to.equal(defaultAdmin.address);
    });
});
