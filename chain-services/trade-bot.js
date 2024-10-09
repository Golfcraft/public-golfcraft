const fetch = require("node-fetch");
const DCL_MARKETPLACE = "0x480a0f4e360E8964e68858Dd231c2922f1df45Ef".toLowerCase();
const DCL_BID = "0xb96697fa4a3361ba35b774a42c58daccaad1b8e1".toLowerCase();
const NFT = {
    "0x8a3448e1e5ebae5eabd47407ec5b5f508cc4f39b":"Golfcraft team",
    "0x26294e873f69a25d6ae2321e9042118eca689112":"Golf head",
    "0x909bebffc69bab12c2ce559b74e43b50cdcafd8c":"Oh my golf",
    "0x5c014f91bf867c54ec335c18ba2e27066a83a0e6":"Golfcraft beta",
    "0x1aeb7d9536193a3a25c74d462ec2dc88da9e50dd":"Doki hair",
    "0x59d3a36754d961eca320f1b7281fe9b046b2975f":"Oh my Deluxe",
    "0x85f15ec042d64f3219a058b73ac2e459cb37e393":"SoapPunk Pirate",
    "0xaca48da27e3bb65ec26c361c5fd1a672802d7320":"Golfcraft 2022",
    "0x9b44629ad39b417801441040c586b3debdbd1d04":"Golfcraft - Egypt",
    "0x2d2004f2edff17688d12373db7649742060d7644":"Xmas 2022",
    "0x849a55b6f1769e3cd6335eb2fa09e4171e6bfb23":"Golfcraft space",
    "0x9e6d35de1fb562b1b602eccf73d74486788546ae":"Golfcraft - Dr. Par coat",
    "0xafaea00d1ced6e9718c55386bbe693135213a2db":"Golfcraft - Pride 2023",
    "0xf125c87d127200add9965507ed9cdeb617039787":"Golfcraft - DCL Awards 2023",
    "0x1ab875dfca8d73d173295897f858733fbfa059c7":"Golfcraft Halloween 2022",
    "0x688e5c0e65823ddf4a92dcf171b56cb476f22cbd":"Golfcraft - Urban collection",
    "0xd14026bf5e455f3487dc57cbff3d408d4c11949f":"Golfcraft - Paella",
    "0xcdfcffe8e83cce105b60c0b3077bf5422fae1bcd":"Golfcraft - Jungle",
    "0xdc79766323592ff93b8ea3b96945cbe508f08e61":"Golfcraft x Nayek",
    "0x3a4707e9859cf93ac4017b371d3d8fbbf2cee591":"Golfcraft - Mountain",
    "0x2d53ed65afd4b761c52932938426a9aa97f96c14":"Golfcraft - Techno Jungle",
    "0x0ac8a8b8bb1426ee15b6ab1048117d96e4fd66a6":"Golfcraft - Tournament organizer"
};

function checkTransactionTrade(receipt, web3){
    console.log("checkTransactionTrade", receipt.blockNumber, receipt.txHash);
    return new Promise((resolve, reject)=>{
        const {transactionHash, blockNumber, returnValues} = receipt;
        const {from, value} = returnValues ||{};
        web3.eth.getTransactionReceipt(transactionHash,(error, txReceipt)=>{
            if(error) console.error(error);
            if(txReceipt && !checkDCLMarketplaceTx(txReceipt)){
                if(!checkDCLBid(txReceipt)){
                    checkOpenseaTx(txReceipt);
                }
            }
            resolve();
        });
    })


    function checkDCLBid(txReceipt){
        const marketplaceLog = txReceipt.logs.find(log=>log.address.toLowerCase() === DCL_BID && log.topics.length > 2);
        if(!marketplaceLog) return null;
        if(marketplaceLog){
            const [fHex, tokenAddressHex, assetIdHex, sellerHex ] = marketplaceLog.topics;
            const data = web3.eth.abi.decodeLog([
                {
                    type:"bytes32",
                    name:"id"
                },
                {
                    type:"address",
                    name:"bidder"
                },
                {
                    type:"uint256",
                    name:"price"
                },
                {
                    type:"uint256",
                    name:"fee"
                }
            ], marketplaceLog.data);
            const {price, bidder, id} = data;
            const nftAddress = hexWithoutPad(tokenAddressHex);
            const assetId = hexWithoutPad(assetIdHex);
            if(NFT[nftAddress.toLowerCase()]){
                discordDCLMarket({assetId, buyer:bidder, seller:"", id, nftAddress, totalPrice:price, tx:txReceipt});
            }
            return marketplaceLog;
        }
    }

    function checkOpenseaTx(txReceipt){
        //TODO process opensea transaction , e.g. https://polygonscan.com/tx/0x0fe2f68aa5fe168481bd27f12dc17b1cfd02ebb3915a41bc4276d38632b41cde
        console.log("non decentraland marketplace tx", txReceipt);
    }

    function checkDCLMarketplaceTx(tx){
        const marketplaceLog = tx.logs.find(log=>log.address.toLowerCase() === DCL_MARKETPLACE && log.topics.length > 2);
        if(!marketplaceLog) return null;
        if(marketplaceLog){
            const [f, assetId, buyer, seller] = marketplaceLog.topics;
            const data = web3.eth.abi.decodeLog([
                {
                    type:"bytes32",
                    name:"id"
                },
                {
                    type:"address",
                    name:"nftAddress"
                },
                {
                    type:"uint256",
                    name:"totalPrice"
                }
            ], marketplaceLog.data);
            const {id, nftAddress, totalPrice} = data;
            if(NFT[nftAddress.toLowerCase()]){
                discordDCLMarket({assetId, buyer, seller, id, nftAddress, totalPrice, tx});
            }
            return marketplaceLog;
        }
    }

    function discordDCLMarket({id, nftAddress, totalPrice, assetId, buyer, seller, tx}){
        console.log(`${NFT[nftAddress.toLowerCase()]} sold by ${web3.utils.fromWei(totalPrice)} MANA on Decentraland Marketplace`);
        console.log("tx hash", tx && tx.transactionHash);
        console.log(`https://market.decentraland.org/contracts/${nftAddress.toLowerCase()}/tokens/${web3.utils.hexToNumberString(assetId)}`);
        callDiscordHook({
            "username":"Bot",
            "content": null,
            "embeds": [
                {
                    "color": null,//TODO Apply rare, legendary , etc?
                    "author": {
                        "name": `${NFT[nftAddress.toLowerCase()]} sold for ${web3.utils.fromWei(totalPrice)} MANA on Decentraland Marketplace`,
                        "url": `https://market.decentraland.org/contracts/${nftAddress.toLowerCase()}/tokens/${web3.utils.hexToNumberString(assetId)}`
                    },
                    /*  "image": {
                       "url": `https://voxters.com/thumbnail`
                     },
                     "thumbnail": {
                       "url": userData.avatars[0].avatar.snapshots.face128
                     } */
                }
            ]
        });
    }

    function hexWithoutPad(hex){
        return web3.utils.toHex( web3.utils.hexToNumberString(hex));
    }
}

module.exports = {
    checkTransactionTrade
}

function callDiscordHook(str, url = "https://discordapp.com/api/webhooks/906781944380031006/nMF7o9M-MtiWlV510kJshIpH_Pxj-w2K7evahDhHeWMnz4TFNMc_kFOT15hgCsXFcS6O"){
    var body = typeof str === "string"?{
        username:"Bot",
        content: `${str}`
    }:str;

    return fetch(url,
        {
            method:"POST",
            body:JSON.stringify(body),
            headers:{'Content-Type':"application/json"}
        })
}