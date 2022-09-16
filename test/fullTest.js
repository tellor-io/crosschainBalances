require("@nomiclabs/hardhat-waffle");
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { abi, bytecode } = require("usingtellor/artifacts/contracts/TellorPlayground.sol/TellorPlayground.json")
const h = require("usingtellor/test/helpers/helpers.js");
const assert = require('chai').assert
const MerkleTreeJS = require("../src/MerkleTree")
const MerkleTree = new MerkleTreeJS(Web3);
const Snapshot = require("../src/Snapshot")

describe("Tellor CrosschainBalanceTest", function() {
  let ccBalances;
  let tellorOracle;
  let addr0, addr1, addr2, addr3, addr4
  let Snap

  // Set up Tellor Playground Oracle and SampleUsingTellor
  beforeEach(async function () {
    let TellorOracle = await ethers.getContractFactory(abi, bytecode);
    tellorOracle = await TellorOracle.deploy();
    await tellorOracle.deployed();

    let SampleUsingTellor = await ethers.getContractFactory("SampleUsingTellor");
    sampleUsingTellor = await SampleUsingTellor.deploy(tellorOracle.address);
    await sampleUsingTellor.deployed();

    let CCBalances = await ethers.getContractFactory("CCBalances");
    ccBalances = await CCBalances.deploy(tellorOracle.address);
    await ccBalances.deployed();


    [addr0, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    const initBlock = await hre.ethers.provider.getBlock("latest")
    Snap = new Snapshot(tellorOracle.address, initBlock, web3)


  });
  it("test Constructor()", async function(){
      assert(await ccBalances.tellor() == tellorOracle.address, "tellor addy should be set")
  });
  it("test getCrossChainBalances() for a token", async function() {


    //give addresses a balance
    await tellorOracle.faucet(addr1.address);
    await tellorOracle.faucet(addr2.address);
    await tellorOracle.faucet(addr2.address);
    await tellorOracle.faucet(addr3.address);
    await tellorOracle.faucet(addr3.address);
    await tellorOracle.faucet(addr3.address);
    await tellorOracle.faucet(addr4.address);
    await tellorOracle.faucet(addr4.address);
    await tellorOracle.faucet(addr4.address);
    await tellorOracle.faucet(addr4.address);
    
    //Take snapshop
    let blockN = await ethers.provider.getBlockNumber()
    blockN = blockN*1
    console.log("block", blockN)
    console.log(0)
    let root = await Snap.getRootHash(blockN);
console.log(1)
    await Snap.setupData(blockN);
    let hashList = Snap.data[blockN].hashList;
    Snap.setSnapshotContract(ccBalances.address);
    console.log(2)
    let data = Snap.data[blockN]
    console.log(3)
    for (key in data.sortedAccountList) {
      let account = data.sortedAccountList[key];
      let tx = await Snap.getClaimTX(blockN, account);
      
      let rcpt = await tx.send({from: accounts[0]})

      let newBalance = await ERC20SnapshotContract.methods.balanceOf(account).call();
      
      console.log("Balance was: " + data.balanceMap[account] / 1e18 + " and is in the new contract: " + newBalance / 1e18)
      console.log("Gas usage: " + rcpt.gasUsed);
      assert.equal(data.balanceMap[account], newBalance, "balances should be equal") 
    }
    console.log(4)

    const abiCoder = new ethers.utils.AbiCoder
    const queryDataArgs = abiCoder.encode(['string', 'string'], ['btc', 'usd'])
    const queryData = abiCoder.encode(['string', 'bytes'], ['MKtree', queryDataArgs])
    const queryId = ethers.utils.keccak256(queryData)
    const mockValue = 50000;//mktree from snapshot.js
    // submit value takes 4 args : queryId, value, nonce and queryData
    await tellorOracle.submitValue(queryId,mockValue,0,queryData);
    let retrievedVal = await sampleUsingTellor.readTellorValue(queryId);
    expect(retrievedVal).to.equal(h.bytes(mockValue));
  });


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
  //checkProof(uint _chain, address _token, bytes32[] calldata hashes, bool[] calldata hashRight)
  it("test checkProof()", async function() {
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
