const { expect } = require("chai");

const { ethers, upgrades } = require("hardhat");
const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
describe("Golfclub", function () {
    let golfclub;
    let defaultAdmin, secondAdmin, royaltyReceiver, account1, account2, minter;
    let zeroAddress = "0x0000000000000000000000000000000000000000";

    beforeEach(async function () {
        const Golfclub = await ethers.getContractFactory("Golfclub");
        golfclub = await upgrades.deployProxy(Golfclub, ["Golfclub", "GCB", "https://tokenuris/"]);
        await golfclub.deployed();
        [defaultAdmin, secondAdmin, royaltyReceiver, account1, account2, minter] = await hre.ethers.getSigners();
        await golfclub.setMaxSupply(0, 10);
        await golfclub.setMaxSupply(1, 10);
        await golfclub.setMaxSupply(2, 10);
        await golfclub.issue(defaultAdmin.address, 0).then(r=>r.wait());
        await golfclub.burn(0);
        await golfclub.grantRole(MINTER_ROLE, minter.address);
    });

    describe("royalties", ()=>{
        it("should allow admin to set royalties", async ()=>{
            await golfclub.setRoyalties(royaltyReceiver.address, 500);
            const [receiver, amount] = await golfclub.connect(account2).royaltyInfo(0,100);
            expect(receiver).to.be.equal(royaltyReceiver.address);
            expect(amount.toString()).to.be.equal("5");
        });

        it("should not allow other address than admin to setRoyalties", async ()=>{
            await expect(
                golfclub.connect(minter).setRoyalties(minter.address, 1)
            ).to.be.revertedWith('admin');
        });
    });

    describe("maxSupply", ()=>{
        it("should allow admin to set maxSupply for tokenId", async () => {
            await golfclub.connect(minter).issue(defaultAdmin.address, 1).then(r=>r.wait());//supply 1
            await golfclub.setMaxSupply(1, 1);
            await expect(
                golfclub.connect(minter).issue(account1.address, 1)
            ).to.be.revertedWith('Reached max supply');
        });
    })

    describe("tokenURI", ()=>{
        it("should return baseURI/golfclubId/tokenId and allow to change baseURI", async () => {
            await issueAndGetReceipt(defaultAdmin, 0);

            expect( await golfclub.tokenURI(1)).to.equal("https://tokenuris/0/1");

            await golfclub.setBaseURI("https://golfcraftgame.com/").then(t=>t.wait());

            expect( await golfclub.tokenURI(1)).to.equal("https://golfcraftgame.com/0/1");
        });
    })

    it("Should return the contractURI", async function () {
        const setContractURITx = await golfclub.setContractURI("https://contract.json");

        await setContractURITx.wait();

        expect(await golfclub.contractURI()).to.equal("https://contract.json");
    });

    describe("getGolfclubId", ()=>{
        it("should return golfclubId from tokenId", async () => {
            const golfclubId = 2;

            await issueAndGetReceipt(account1, golfclubId);
            await issueAndGetReceipt(account1, golfclubId);

            expect(await golfclub.getGolfclubId(1)).to.equal(golfclubId);
            expect(await golfclub.getGolfclubId(2)).to.equal(golfclubId);
        });
    });

    describe("burn", ()=>{
        it("should set player to zero address", async () => {
            const golfclubId = 1;

            await issueAndGetReceipt(account1, golfclubId);
            expect(await golfclub.getPlayer(1)).to.equal(account1.address);

            await golfclub.connect(account1).burn(1);

            expect(await golfclub.getPlayer(1)).to.equal(zeroAddress);
        });
    });

    describe("transfer", ()=>{
        it("should setPlayer", async () => {
             const golfclubId = 1;

             await issueAndGetReceipt(account1, golfclubId);

             expect(await golfclub.getPlayer(1)).to.equal(account1.address);
             expect(await golfclub.balanceOf(account1.address)).to.equal(1);
             expect(await golfclub.ownerOf(1)).to.equal(account1.address);

            await golfclub.connect(account1)["safeTransferFrom(address,address,uint256)"](account1.address, account2.address, 1);
            expect(await golfclub.balanceOf(account1.address)).to.equal(0);
            expect(await golfclub.balanceOf(account2.address)).to.equal(1);

            expect(await golfclub.getPlayer(1)).to.equal(account2.address);
        });
    })

    describe("issue", ()=>{
        it("should assign player a golfclubId as first property", async function () {
            const golfclubId = 1;
            const txReceipt1 = await issueAndGetReceipt(account1, golfclubId);
            const tokenId1 = Number(getEventFromReceipt(txReceipt1, "Issued").args[0].toString());

            expect(await golfclub.getPlayer(tokenId1)).to.equal(account1.address);
            expect(tokenId1).to.equal(1);
            expect(await golfclub.getGolfclubId(tokenId1)).to.equal(golfclubId);
            expect( (await golfclub.balanceOf(account1.address) ) ).to.equal(1);
            assertEvents(txReceipt1, ["Transfer", "PlayerSet", "Issued"]);

            const receipt2 = await issueAndGetReceipt(account2, golfclubId);
            const tokenId2 = Number(getEventFromReceipt(receipt2, "Issued").args[0].toString());

            expect(await golfclub.getPlayer(tokenId2)).to.equal(account2.address);
            expect(tokenId2).to.equal(2);
            expect( (await golfclub.balanceOf(account2.address) ) ).to.equal(1);
        });

        it("Prevents issuing for non minters", async function () {
            await expect(
                golfclub.connect(account1).issue(account1.address, 1)
            ).to.be.revertedWith('Golfclub: must have minter role to issue new golfclub');
        });
    })


    describe("Golfclub name", ()=>{
        it("Allows golfclub owner to set name", async () => {
            await golfclub.issue(account1.address, 1).then(t=>t.wait());
            await golfclub.connect(account1).setName(1, "Felix");

            expect(await golfclub.getName(1)).to.equal("Felix")
        });

        it("Prevents set name for tokens owned by others", async function () {
            await golfclub.issue(account1.address, 1).then(t=>t.wait());
            const setNameTx = golfclub.connect(account2).setName(1, "Felix");

            await expect(setNameTx).to.be.revertedWith('Golfclub: must be the owner of the token to set name');
        });
    });

     describe("Properties", ()=>{
        beforeEach(async ()=>{
            await issueAndGetReceipt(account1, 1);
        });

        it("Sets property", async function () {
            await golfclub.setProperty(1, 1, 200).then(t=>t.wait());

            expect(await golfclub.getProperty(1, 1)).to.equal(200);
        });

        it("Prevents set property for non minters", async function () {
            await expect(
                golfclub.connect(account1).setProperty(1, 1, 100)
            ).to.be.revertedWith('Golfclub: must have minter role to set property');
        });
    });

    describe("UpgradeV2", ()=>{
       beforeEach(async ()=>{
           await issueAndGetReceipt(account1, 1);
       });

       it("The properties remain the same", async function () {
           // Initialize
           await golfclub.setProperty(1, 1, 200).then(t=>t.wait());
           expect(await golfclub.getProperty(1, 1)).to.equal(200);
           await golfclub.connect(account1).setName(1, "Felix");
           expect(await golfclub.getName(1)).to.equal("Felix");

           // Upgrade
           const GolfclubV2 = await ethers.getContractFactory("GolfclubV2");
           const upgraded = await upgrades.upgradeProxy(golfclub.address, GolfclubV2);

           // Test values
           expect(await upgraded.getProperty(1, 1)).to.equal(200);
           expect(await upgraded.getName(1)).to.equal("Felix");

           // Set values
           await upgraded.setProperty(1, 1, 300).then(t=>t.wait());
           expect(await upgraded.getProperty(1, 1)).to.equal(300);
           await upgraded.connect(account1).setName(1, "Pepe");
           expect(await upgraded.getName(1)).to.equal("Pepe");
       });

       it("initializeEIP712", async function () {
           // Upgrade
           const GolfclubV2 = await ethers.getContractFactory("GolfclubV2");
           const upgraded = await upgrades.upgradeProxy(golfclub.address, GolfclubV2);

           // Only admin can initializeEIP712
           await expect(
               upgraded.connect(account1).initializeEIP712()
           ).to.be.revertedWith('admin');

           await upgraded.initializeEIP712().then(t=>t.wait());

           // initializeEIP712 can only be executed once
           await expect(
               upgraded.initializeEIP712()
           ).to.be.revertedWith('already initialized');

       });

   });

    async function issueAndGetReceipt(account, golfclubId){
        return await (await golfclub.issue(account.address, golfclubId)).wait();
    };


    describe("UpgradeV3", ()=>{
        beforeEach(async ()=>{
            await issueAndGetReceipt(account1, 1);
        });
 
        it("The properties remain the same", async function () {
            // Initialize
            await golfclub.setProperty(1, 1, 200).then(t=>t.wait());
            expect(await golfclub.getProperty(1, 1)).to.equal(200);
            await golfclub.connect(account1).setName(1, "Felix");
            expect(await golfclub.getName(1)).to.equal("Felix");
 
            // Upgrade
            const GolfclubV3 = await ethers.getContractFactory("GolfclubV3");
            const upgraded = await upgrades.upgradeProxy(golfclub.address, GolfclubV3);
            await upgraded.initOwnable();

            // Test values
            expect(await upgraded.getProperty(1, 1)).to.equal(200);
            expect(await upgraded.getName(1)).to.equal("Felix");
 
            // Set values
            await upgraded.setProperty(1, 1, 300).then(t=>t.wait());
            expect(await upgraded.getProperty(1, 1)).to.equal(300);
            await upgraded.connect(account1).setName(1, "Pepe");
            expect(await upgraded.getName(1)).to.equal("Pepe");
        });

        it("Init ownership", async function () {
            // Upgrade
            const GolfclubV3 = await ethers.getContractFactory("GolfclubV3");
            const upgraded = await upgrades.upgradeProxy(golfclub.address, GolfclubV3);

            await upgraded.initOwnable();

            await expect(
                upgraded.initOwnable()
            ).to.be.revertedWith('Ownable: already initialized');

            expect(await upgraded.owner()).to.equal(defaultAdmin.address);
        });

    });

});

function assertEvents(receipt, eventNames){
    expect(!!eventNames.every((eventName)=>!!getEventFromReceipt(receipt, eventName))).to.be.true;
}

function getEventFromReceipt(receipt, eventName){
    return receipt.events.find(e=>e.event === eventName)
}
