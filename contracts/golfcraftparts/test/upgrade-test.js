const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");


describe("GolfcraftParts", function () {
    let golfcraftparts;

    beforeEach(async function () {
        const GolfcraftParts = await ethers.getContractFactory("GolfcraftParts");

        golfcraftparts = await upgrades.deployProxy(GolfcraftParts, ["https://tokenuris/", "GolfcraftParts", "GCFTMTRLS", "https://contracturi/"]);
        await golfcraftparts.deployed();

        [defaultAdmin, secondAdmin, royaltyReceiver, account1, account2, minter] = await hre.ethers.getSigners();

        expect(await golfcraftparts.owner()).to.equal(defaultAdmin.address);

        // Setup contract

        const setContractURITx = await golfcraftparts.transferOwnership(secondAdmin.address);
        await setContractURITx.wait();

        expect(await golfcraftparts.owner()).to.equal(secondAdmin.address);

        const setRoyaltiesTx = await golfcraftparts.setRoyalties(royaltyReceiver.address, 500);
        await setRoyaltiesTx.wait();

        const mintTx = await golfcraftparts.mint(account1.address, 0, 10, []);
        await mintTx.wait();

    });

    // After upgrade to GolfcraftPartsV2 all values should remain the same
    it("GolfcraftPartsV2", async function () {
        const GolfcraftPartsV2 = await ethers.getContractFactory("GolfcraftPartsV2");
        const golfcraftpartsv2 = await upgrades.upgradeProxy(golfcraftparts.address, GolfcraftPartsV2);

        expect(await golfcraftpartsv2.owner()).to.equal(secondAdmin.address);

        expect(await golfcraftpartsv2.contractURI()).to.equal("https://contracturi/");

        expect(await golfcraftpartsv2.uri(0)).to.equal("https://tokenuris/");

        expect(await golfcraftpartsv2.name()).to.equal("GolfcraftParts");

        expect(await golfcraftpartsv2.symbol()).to.equal("GCFTMTRLS");

        const [receiver, amount] = await golfcraftpartsv2.royaltyInfo(0, 100)

        expect(receiver).to.be.equal(royaltyReceiver.address);
        expect(amount.toString()).to.be.equal("5");

        expect(await golfcraftpartsv2.balanceOf(account1.address, 0)).to.be.equal("10");
    });

});