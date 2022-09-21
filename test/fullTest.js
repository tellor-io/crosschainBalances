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

describe("Tellor CrosschainBalanceTest", function() {
  let ccBalances
  let tellorOracle
  let accounts
  let Snap

  // Set up Tellor Playground Oracle and SampleUsingTellor
  beforeEach(async function () {
    let TellorOracle = await ethers.getContractFactory(abi, bytecode)
    tellorOracle = await TellorOracle.deploy()
    await tellorOracle.deployed()

    let SampleUsingTellor = await ethers.getContractFactory("SampleUsingTellor")
    sampleUsingTellor = await SampleUsingTellor.deploy(tellorOracle.address)
    await sampleUsingTellor.deployed()

    let CCBalances = await ethers.getContractFactory("CCBalances")
    ccBalances = await CCBalances.deploy(tellorOracle.address)
    await ccBalances.deployed()

    accounts = await ethers.getSigners()
    const initBlock = await hre.ethers.provider.getBlock("latest")
    Snap = new Snapshot(tellorOracle.address, initBlock, web3)
  });

  it("test Constructor()", async function(){
      assert(await ccBalances.tellor() == tellorOracle.address, "tellor addy should be set")
  });

  it("test getCrossChainBalances()", async function() {
    //give addresses a balance
    await tellorOracle.faucet(accounts[1].address)
    await tellorOracle.faucet(accounts[2].address)
    await tellorOracle.faucet(accounts[2].address)
    await tellorOracle.faucet(accounts[3].address)
    await tellorOracle.faucet(accounts[3].address)
    await tellorOracle.faucet(accounts[3].address)
    await tellorOracle.faucet(accounts[4].address)
    await tellorOracle.faucet(accounts[4].address)
    await tellorOracle.faucet(accounts[4].address)
    await tellorOracle.faucet(accounts[4].address)
    //Take snapshop
    let blockN = await ethers.provider.getBlockNumber()
    let root = await Snap.getRootHash(blockN)
    //create Tellor's queryData
    const abiCoder = new ethers.utils.AbiCoder
    const queryData = abiCoder.encode(['string', 'bytes'], ['CrossChainBalance', abiCoder.encode(['uint256', 'address'], [1,tellorOracle.address])])
    const queryId = ethers.utils.keccak256(queryData)
    // submit value: it takes 4 args : queryId, value, nonce and queryData
    await tellorOracle.submitValue(queryId,root,0,queryData)
    //fastward 12 hours (43200) since getcrosschainbalances looks for a value from 12 hours ago
    advanceTimeAndBlock(45000)
    //get root reported to tellor for the specified chain and token address
    let bal = await ccBalances.getCrossChainBalances(1,tellorOracle.address);
    assert(await ccBalances.rootHash(1,tellorOracle.address) == root, "root should be correct")
  });

  it("test verifyBalance()", async function() {
    //give addresses a balance
    await tellorOracle.faucet(accounts[1].address)
    await tellorOracle.faucet(accounts[2].address)
    await tellorOracle.faucet(accounts[2].address)
    await tellorOracle.faucet(accounts[3].address)
    await tellorOracle.faucet(accounts[3].address)
    await tellorOracle.faucet(accounts[3].address)
    await tellorOracle.faucet(accounts[4].address)
    await tellorOracle.faucet(accounts[4].address)
    await tellorOracle.faucet(accounts[4].address)
    await tellorOracle.faucet(accounts[4].address)
    //Take snapshop
    let blockN = await ethers.provider.getBlockNumber()
    let root = await Snap.getRootHash(blockN)
    //create Tellor's queryData
    const abiCoder = new ethers.utils.AbiCoder
    const queryData = abiCoder.encode(['string', 'bytes'], ['CrossChainBalance', abiCoder.encode(['uint256', 'address'], [1,tellorOracle.address])])
    const queryId = ethers.utils.keccak256(queryData)
    // submit value takes 4 args : queryId, value, nonce and queryData
    await tellorOracle.submitValue(queryId,root,0,queryData)
    //fastward 12 hours (43200)
    advanceTimeAndBlock(45000)
    let bal = await ccBalances.getCrossChainBalances(1,tellorOracle.address)
    assert(await ccBalances.rootHash(1,tellorOracle.address) == root, "root should be correct")

    //should we use the block number when this is pushed to tellor or the one where the snapshot
    //was originally taken? 
    //blockN = await ethers.provider.getBlockNumber()
    //await Snap.setupData(blockN)
    console.log(1)
    Snap.setSnapshotContract(ccBalances.address)
    
    console.log(2)

    console.log(3)
    let data = Snap.data[blockN]

    console.log(4)
    let sdata = data.sortedAccountList
    console.log("sdata" , sdata)
    for (key in data.sortedAccountList) {
      let account = data.sortedAccountList[key];
      let tx = await Snap.getClaimTX(blockN, account);
      let balance = web3.utils.fromWei(data.balanceMap[account]);
      console.log('tx',tx)
      console.log('balance', balance)
      //verifyBalance(uint256 _chain, address _token, uint256 _balance, bytes32[] calldata _hashes, bool[] calldata _right)
      let found = await ccBalances.verifyBalance(1,tellorOracle.address,web3.utils.toWei(balance), tx.hashes, tx.hashRight)
      console.log("key,found", key,found)
      //let bool =  Snap.checkProof(chain,token,tx.hashes, tx.hashRight).call();
      //let alldata = Snap.claim(account, balance, tx.hashes, tx.hashRight);
    }

    //let proof = await Snap.getClaimTX(blockN, accounts[3].address)
    console.log(5)
    
    assert( web3.utils.fromWei(await tellorOracle.balanceOf(accounts[3].address)) == 3000, "account balance should be correct")
    //assert(await ccBalances.verifyBalance(1,tellorOracle.address,web3.utils.toWei(1000),proof.hashes, proof.right),"should verify")
  });

  //checkProof(uint _chain, address _token, bytes32[] calldata hashes, bool[] calldata hashRight)
  // it("test checkProof()", async function() {
  //   //give addresses a balance
  //   await tellorOracle.faucet(accounts[1].address)
  //   await tellorOracle.faucet(accounts[2].address)
  //   await tellorOracle.faucet(accounts[2].address)
  //   await tellorOracle.faucet(accounts[3].address)
  //   await tellorOracle.faucet(accounts[3].address)
  //   await tellorOracle.faucet(accounts[3].address)
  //   await tellorOracle.faucet(accounts[4].address)
  //   await tellorOracle.faucet(accounts[4].address)
  //   await tellorOracle.faucet(accounts[4].address)
  //   await tellorOracle.faucet(accounts[4].address)

  //   //Take snapshop
  //   let blockN = await ethers.provider.getBlockNumber()
  //   let root = await Snap.getRootHash(blockN)
  //   //create Tellor's queryData
  //   const abiCoder = new ethers.utils.AbiCoder
  //   const queryData = abiCoder.encode(['string', 'bytes'], ['CrossChainBalance', abiCoder.encode(['uint256', 'address'], [1,tellorOracle.address])])
  //   const queryId = ethers.utils.keccak256(queryData)
  //   // submit value takes 4 args : queryId, value, nonce and queryData
  //   await tellorOracle.submitValue(queryId,root,0,queryData)
  //   //fastward 12 hours (43200)
  //   advanceTimeAndBlock(45000)
  //   let bal = await ccBalances.getCrossChainBalances(1,tellorOracle.address)
  //   assert(await ccBalances.rootHash(1,tellorOracle.address) == root, "root should be correct")
  //   blockN = await ethers.provider.getBlockNumber()
  //   await Snap.setupData(blockN)
  //   let hashList = Snap.data[blockN].hashList
  //   Snap.setSnapshotContract(ccBalances.address)
  //   let data = Snap.data[blockN]
  //   let proof = await Snap.getClaimTX(blockN, accounts[4].address)
  //   assert(await tellorOracle.balanceOf(accounts[4].address == web3.utils.toWei("2000")), "account balance should be correct")
  //   assert(await ccBalances.checkProof(1,tellorOracle.address,proof.hashes, proof.right),"should checkProof")
  // });

});
