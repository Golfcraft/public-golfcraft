const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");



describe("GolfcraftCrafting", function () {
    let golfcraftcrafting;
    let materials;
    let parts;
    const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
    const CHEF_ROLE = "0xbb95cca64affbe55a6a6f6b690ae1c8525d24dc953087f6db9a21e7cb374b385";

    beforeEach(async function () {

        const materialsERC1155 = await ethers.getContractFactory("ERC1155PresetMinterPauserUpgradeable");
        materials = await upgrades.deployProxy(materialsERC1155, ["ipfs://GolfcraftMaterials"]);
        await materials.deployed();

        const partsERC1155 = await ethers.getContractFactory("ERC1155PresetMinterPauserUpgradeable");
        parts = await upgrades.deployProxy(partsERC1155, ["ipfs://GolfcraftParts"]);
        await parts.deployed();

        const GolfcraftCrafting = await ethers.getContractFactory("GolfcraftCrafting");
        golfcraftcrafting = await upgrades.deployProxy(GolfcraftCrafting, ["GolfcraftCrafting", materials.address, parts.address]);
        await golfcraftcrafting.deployed();
        console.log(await golfcraftcrafting.CHEF_ROLE());

        // Add minter role to GolfcraftCrafting on partsERC1155
        await parts.grantRole(MINTER_ROLE, golfcraftcrafting.address);

        [defaultAdmin, secondAdmin, royaltyReceiver, account1, account2, minter] = await hre.ethers.getSigners();
    });

    it("a non admin cant set erc1155", async function () {
        await expect(
            golfcraftcrafting.connect(account1).setERC1155(account2.address, account1.address)
        ).to.be.revertedWith('GolfcraftCrafting: must have admin role to set ERC1155');
    });

    it("a non chef cant add recipe", async function () {
        await expect(
            golfcraftcrafting.connect(account1).addRecipe(0, [0, 1], [2, 3])
        ).to.be.revertedWith('GolfcraftCrafting: must have chef role to add recipe');
    });

    it("a chef should be able to add recipe", async function () {
        const addRecipeTx = await golfcraftcrafting.addRecipe(0, [0, 1], [2, 3]);
        await addRecipeTx.wait();

        const recipe = await golfcraftcrafting.getRecipe(0);
        expect(recipe[0].toString()).to.be.equal("0,1");
        expect(recipe[1].toString()).to.be.equal("2,3");
        expect(recipe[2]).to.be.equal(true);
    });

    it("should be possible to craft a part", async function () {
        const mintElemetsTx = await materials.mintBatch(account1.address, [0, 1], [4, 6], []);
        await mintElemetsTx.wait();

        const balanceOfAccount1 = await materials.balanceOfBatch([account1.address, account1.address], [0, 1]);
        expect(balanceOfAccount1[0].toString()).to.be.equal("4");
        expect(balanceOfAccount1[1].toString()).to.be.equal("6");

        const setApprovalForAllTx = await materials.connect(account1).setApprovalForAll(golfcraftcrafting.address, true);
        await setApprovalForAllTx.wait();

        const isApprovedForAllTx = await materials.connect(account1).isApprovedForAll(account1.address, golfcraftcrafting.address);
        expect(isApprovedForAllTx).to.be.equal(true);

        const addRecipeTx = await golfcraftcrafting.addRecipe(0, [0, 1], [2, 3]);
        await addRecipeTx.wait();

        // Contract should not be paused
        const isPausedTx = await golfcraftcrafting.paused();
        expect(isPausedTx).to.be.equal(false);

        // Pausing contract
        const pauseTx = await golfcraftcrafting.pause(true);
        await pauseTx.wait();

        // Contract should be paused
        const isPausedTx2 = await golfcraftcrafting.paused();
        expect(isPausedTx2).to.be.equal(true);

        // craftPart function should revert because contract is paused
        await expect(
            golfcraftcrafting.connect(account1).craftPart(0, 2)
        ).to.be.revertedWith('GolfcraftCrafting: contract is paused');
        
        // Unpausing contract
        const unpauseTx = await golfcraftcrafting.pause(false);
        await unpauseTx.wait();

        // Contract should not be paused
        const isPausedTx3 = await golfcraftcrafting.paused();
        expect(isPausedTx3).to.be.equal(false);

        const craftTx = await golfcraftcrafting.connect(account1).craftPart(0, 2);
        await craftTx.wait();

        const balancePart = await parts.balanceOf(account1.address, 0);
        expect(balancePart.toString()).to.be.equal("2");
    });

});
