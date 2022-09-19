require("@nomiclabs/hardhat-waffle");
const Web3 = require('web3')
const web3 = new Web3(hre.network.provider)

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
  it("test getCrossChainBalances()", async function() {
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
    console.log(root)
    const abiCoder = new ethers.utils.AbiCoder
    const queryDataArgs = abiCoder.encode(['uint256', 'address'], [1,tellorOracle.address])
    const queryData = abiCoder.encode(['string', 'bytes'], ['CrosschainBalance', queryDataArgs])
    const queryId = ethers.utils.keccak256(queryData)
    // submit value takes 4 args : queryId, value, nonce and queryData
    await tellorOracle.submitValue(queryId,root,0,queryData);
    await ccBalances.getCrossChainBalances(1,tellorOracle.address);
    assert(await ccBalances.rootHash(1,tellorOracle.address) == root, "root should be correct")

  });
  it("test verifyBalance()", async function() {
    await Snap.setupData(blockN);
    let hashList = Snap.data[blockN].hashList;
    Snap.setSnapshotContract(ccBalances.address);
    console.log(2)
    let data = Snap.data[blockN]
    console.log(3)
    for (key in data.sortedAccountList) {
      let account = data.sortedAccountList[key];
      let proof = await Snap.getClaimTX(blockN, account);
      
    }
    assert(0==1)
  });
  //checkProof(uint _chain, address _token, bytes32[] calldata hashes, bool[] calldata hashRight)
  it("test checkProof()", async function() {
    await Snap.setupData(blockN);
    let hashList = Snap.data[blockN].hashList;
    Snap.setSnapshotContract(ccBalances.address);
    console.log(2)
    let data = Snap.data[blockN]
    console.log(3)
    for (key in data.sortedAccountList) {
      let account = data.sortedAccountList[key];
      let proof = await Snap.getClaimTX(blockN, account);
      
    }
    assert(0==1)
  });

});
