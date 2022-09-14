const { expect } = require("chai");
const { ethers } = require("hardhat");
const { abi, bytecode } = require("usingtellor/artifacts/contracts/TellorPlayground.sol/TellorPlayground.json")
const h = require("usingtellor/test/helpers/helpers.js");
const Web3 = require('web3')
const assert = require('chai').assert
const MerkleTreeJS = require("../src/MerkleTree")
const MerkleTree = new MerkleTreeJS(Web3);
const Snapshot = require("../src/Snapshot")

describe("Tellor CrosschainBalanceTest", function() {
  let ccBalances;
  let tellorOracle;

  // Set up Tellor Playground Oracle and SampleUsingTellor
  beforeEach(async function () {
    let TellorOracle = await ethers.getContractFactory(abi, bytecode);
    tellorOracle = await TellorOracle.deploy();
    await tellorOracle.deployed();

    let CCBalances = await ethers.getContractFactory("CCBalances.sol");
    ccBalances = await CCBalances.deploy(tellorOracle.address);
    await sampleUsingTellor.deployed();
  });
  it("test Constructor()", async function(){
      assert(ccBalances.tellor() == tellorOracle.address, "tellor addy should be set")
  }
  it("test getCrossChainBalances()", async function() {
    const abiCoder = new ethers.utils.AbiCoder
    const queryDataArgs = abiCoder.encode(['string', 'string'], ['btc', 'usd'])
    const queryData = abiCoder.encode(['string', 'bytes'], ['SpotPrice', queryDataArgs])
    const queryId = ethers.utils.keccak256(queryData)
    const mockValue = 50000;
    // submit value takes 4 args : queryId, value, nonce and queryData
    await tellorOracle.submitValue(queryId,mockValue,0,queryData);
    let retrievedVal = await sampleUsingTellor.readTellorValue(queryId);
    expect(retrievedVal).to.equal(h.bytes(mockValue));
  });
  it("test verifyBalance()", async function() {
    const abiCoder = new ethers.utils.AbiCoder
    const queryDataArgs = abiCoder.encode(['string', 'string'], ['btc', 'usd'])
    const queryData = abiCoder.encode(['string', 'bytes'], ['SpotPrice', queryDataArgs])
    const queryId = ethers.utils.keccak256(queryData)
    const mockValue = 50000;
    // submit value takes 4 args : queryId, value, nonce and queryData
    await tellorOracle.submitValue(queryId,mockValue,0,queryData);
    let retrievedVal = await sampleUsingTellor.readTellorValue(queryId);
    expect(retrievedVal).to.equal(h.bytes(mockValue));
  });
});
