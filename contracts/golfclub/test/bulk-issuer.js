const { expect } = require("chai");

const { ethers, upgrades } = require("hardhat");
const { idText } = require("typescript");

const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

describe.only("bulkIssuer", ()=>{
    let golfclub, bulkIssuer;
    let defaultAdmin, secondAdmin, royaltyReceiver, account1, account2, minter;
    let zeroAddress = "0x0000000000000000000000000000000000000000";

    beforeEach(async function () {
        const Golfclub = await ethers.getContractFactory("Golfclub");
        const GolfclubBulk = await ethers.getContractFactory("GolfclubBulk");

        golfclub = await upgrades.deployProxy(Golfclub, ["Golfclub", "GCB", "https://tokenuris/"]);
        const deployedGolfclub = await golfclub.deployed();
        console.log("deployedGolfclub", deployedGolfclub.address);
        bulkIssuer = await GolfclubBulk.deploy();
        console.log("bulkIssuer", bulkIssuer.address);
        [defaultAdmin, secondAdmin, royaltyReceiver, account1, account2, minter] = await hre.ethers.getSigners();
        await golfclub.setMaxSupply(0, 10);
        await golfclub.setMaxSupply(1, 0);
        await golfclub.setMaxSupply(2, 50);
        await golfclub.setMaxSupply(3, 10);
        await golfclub.issue(defaultAdmin.address, 0).then(r=>r.wait());
        await golfclub.burn(0);
        await golfclub.grantRole(MINTER_ROLE, minter.address);
        await golfclub.grantRole(MINTER_ROLE, bulkIssuer.address);
        bulkIssuer.setContract(golfclub.address);
    });

    it("can issue golfclubs in bulk", async () => {
       expect( await golfclub.balanceOf(account1.address)).to.equal(0);
       expect( await golfclub.getGolfclubSupply(3)).to.equal(0);

       await bulkIssuer.bulkIssue(account1.address, 3, 10);

       expect( await golfclub.balanceOf(account1.address)).to.equal(10);
       expect( await golfclub.getGolfclubSupply(3)).to.equal(10);

       
       await expect(
            bulkIssuer.bulkIssue(account1.address, 3, 1)
       ).to.be.revertedWith('not enough');
    
    });


});