//to run:

// adjust parameters
// npx hardhat run scripts/generateMerkeRoot.js

const Snapshot = require("../src/Snapshot")
const Web3 = require('web3')
require("dotenv").config();

var chainId = 1;
var contractAddress = '0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0'
var blockNumber = 15675564

async function generate(_nodeURL, _chainId, _contractAddress, _blockNumber) {
    console.log("generating Merkle Root for chain: ",_chainId,", address: ",_contractAddress,", blockNumber: ",_blockNumber)
    var provider = new ethers.providers.JsonRpcProvider(_nodeURL)
    const web3 = await new Web3(provider)
    const Snap = new Snapshot(_contractAddress, 0, web3)
    console.log(Snap)
    console.log(_blockNumber)
    let root = await Snap.getRootHash(_blockNumber)
    console.log(4)
    console.log("Your merkle root: ", root)
    return root
}


generate(process.env.NODE_URL, chainId, contractAddress, blockNumber)
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });