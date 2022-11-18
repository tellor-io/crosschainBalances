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
const Snapshot = require("../src/Snapshot")
const BN = ethers.BigNumber.from
const tellorMaster = "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0"

describe("Get RootHash", function() {
  let ccBalances
  let tellorOracle
  let accounts
  let Snap

  // Set up Tellor Playground Oracle and SampleUsingTellor
  beforeEach(async function () { 
    this.timeout(20000000)
    let TellorOracle = await ethers.getContractFactory(abi, bytecode)
    console.log("1")
    tellorOracle = TellorOracle.attach(tellorMaster)
    console.log("h2")
    const initBlock = await hre.ethers.provider.getBlock("latest")
    console.log("here")
    console.log(tellorOracle.address, initBlock, web3)
    Snap = new Snapshot(tellorOracle.address, initBlock, web3)
  });

  it("get Root", async function() {
    console.log("grabbing root")
    let blockN = await ethers.provider.getBlockNumber()
    let root = await Snap.getRootHash(blockN)
    console.log("blockNumber", blockN);
    console.log("myRootHash", root);
  }).timeout(99999999);

  //0x9d297bce9514810def3ffeaedd9a0af3bf9324b4f2357b01899d8d53d56d11d5

});
