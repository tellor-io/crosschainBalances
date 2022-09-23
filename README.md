# Cross chain balances

This repo allows the verification of the balance of any users' ERC20 token across chains. 


## How does it work

Step 1: Setup a queryId on Tellor with the chain id and the token address you want to read values from. Tellor reporters will use this to report the root hash to the other chain. Tellor reporters can use the following to create the root hash and report it on a different chain. 

```javascript
    const initBlock = await hre.ethers.provider.getBlock("latest")
    Snap = new Snapshot(tellorOracle.address, initBlock, web3)
    let blockN = await ethers.provider.getBlockNumber()
    let root = await Snap.getRootHash(blockN)
    //Take snapshop
    let blockN = await ethers.provider.getBlockNumber()
    let root = await Snap.getRootHash(blockN)
    //create Tellor's queryData
    const abiCoder = new ethers.utils.AbiCoder
    const queryData = abiCoder.encode(['string', 'bytes'], ['CrossChainBalance', abiCoder.encode(['uint256', 'address'], [1,tellorOracle.address])])
    const queryId = ethers.utils.keccak256(queryData)
    // submit value: it takes 4 args : queryId, value, nonce and queryData
    await tellorOracle.submitValue(queryId,root,0,queryData)
```

Step 2: Make sure your contract inherits CCBalances.sol 

Step 3: Create the inputs to verify balances using this:

```javascript
    let Snap = new Snapshot(tellorOracle.address, initBlock, web3)
    Snap.setSnapshotContract(claimYourPrize.address)
    let data = Snap.data[blockN]
    let sdata = data.sortedAccountList
    for (key in data.sortedAccountList) {
      let account = data.sortedAccountList[key]
      let tx = await Snap.getClaimTX(blockN, account)
      let balance = web3.utils.fromWei(data.balanceMap[account])
      console.log(balance)
      console.log(tx.hashes)
      console.log(tx.hashRight)
    }
```

Step 4: Use the verifyBalance function in your contract to verfy balances and do something cool after verification.

Step 5: Happy building!

## Use cases
- Allow an airdrop based on the users' balances on a different chain
- Allow a weighted voting based on the users' balances on a different chain
- Allow a suser to claim rewards on a different chain



<!---![Trees by Walter Martin. source: unsplash](https://images.unsplash.com/photo-1657729252678-db274e08d7ae?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80))
-->