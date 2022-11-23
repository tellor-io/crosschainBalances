require("@nomiclabs/hardhat-waffle")
const Web3 = require('web3')
const web3 = new Web3(hre.network.provider)
const { expect } = require("chai")
const { ethers } = require("hardhat")
const { abi, bytecode } = require("usingtellor/artifacts/contracts/TellorPlayground.sol/TellorPlayground.json")
const h = require("usingtellor/test/helpers/helpers.js")
const assert = require('chai').assert
const MerkleTreeJS = require("../src/MerkleTree")
const MerkleTree = new MerkleTreeJS(Web3)
const Snapshot2 = require("../src/Snapshot2")
require("dotenv").config();
//npx hardhat run scripts/getRootHash.js --network mainnet

const token = "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0"
const blockNumber = 15998590

async function getRootHash(node2) {
    Snap = new Snapshot2(token, blockNumber, web3,node2)
    let root = await Snap.getRootHash(blockNumber)
    console.log("blockNumber", blockNumber);
    console.log("myRootHash", root);
}


getRootHash(process.env.NODE_URL)
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

