require("dotenv").config();
const fs = require("fs");
const {checkTransactionTrade} = require("./trade-bot");
const Web3 = require("web3");
const fetch = require('node-fetch');
const manaAbi = require("./abi/mana");
const {promisify} = require("util");
console.log("web3 provider",process.env.WEB3_HTTP_PROVIDER)
const provider = new Web3.providers.HttpProvider(process.env.WEB3_HTTP_PROVIDER);
if(!process.env.WEB3_HTTP_PROVIDER){
    console.error("missing provider");process.exit(1);
}
const web3 = new Web3(provider);
const mana = new web3.eth.Contract(manaAbi, "0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4");
const LASTBLOCK_FILENAME = '.last-block';
const BLOCK_SPAN = 2000;
if (!fs.existsSync(LASTBLOCK_FILENAME)) {
    fs.writeFileSync(LASTBLOCK_FILENAME, "22273091", "utf8");
}
let lastBlock = Number(fs.readFileSync(LASTBLOCK_FILENAME, 'utf8'));

(async () => {
    //TODO check transfer events on mana where "to" is 0x5Ca6690fFC030fB09DbB49C24CDC78c1c8b59B9E
    while(true) {
        console.log("lastBlock, web3.eth.getBlockNumber()",lastBlock, await web3.eth.getBlockNumber())
        while(lastBlock > await web3.eth.getBlockNumber()){
            await sleep(60000)
        }
        await check();
    }
})();

async function check(){
    console.log("checking block",lastBlock,lastBlock + BLOCK_SPAN);
    const result = await mana.getPastEvents("Transfer", {
        filter: {to: "0x5Ca6690fFC030fB09DbB49C24CDC78c1c8b59B9E"},
        fromBlock: lastBlock,
        toBlock: lastBlock + BLOCK_SPAN,
    });
    if(result && result.length){
        for(let event of result){
            await checkTransactionTrade(event, web3);
            lastBlock = Math.max(lastBlock, event.blockNumber+1);
        }
    }else{
        const currentBlock = await web3.eth.getBlockNumber();
        if(currentBlock < (lastBlock + BLOCK_SPAN + 1)){
            console.log("done");
            await sleep(60000);
        }
        lastBlock = Math.min(currentBlock, lastBlock + BLOCK_SPAN + 1);
    }
    fs.writeFileSync(LASTBLOCK_FILENAME, lastBlock.toString(), "utf8");
    await sleep(10000)
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}