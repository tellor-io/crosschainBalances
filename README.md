# Cross chain balances

This repo allows the creation and verification of the balance of any users' ERC20 token across chains with an example 


## Setting up and testing

Install Dependencies
```
npm i
```
Compile Smart Contracts
```
npx hardhat compile
```

Test Locally
```
npx hardhat test
```

## Integrating the verification

After adding a method of placing a root on-chain (e.g. via the tellor oracle), you'll need the following funciton to verify: 

 ```
   function verifyBalance(uint256 _chain, address _token, address _account, uint256 _balance, bytes32[] calldata _hashes, bool[] calldata _right) public view returns(bool) {
        bytes32 _rootHash = rootHash[_chain][_token];
        bytes32 _myHash = keccak256(abi.encode(_account,_balance));
        if (_hashes.length == 1) {
            require(_hashes[0] == _myHash);

        } else {
            require(_hashes[0] == _myHash || _hashes[1] == _myHash);

        }
        bool _found =  InTree(_rootHash, _hashes, _right);
        return _found;
    }
```



## Creating a root hash

Edit your getRootHash.js file to include the correct address and blocknumber

Edit the hardhat.config file to add your network/chain

```
npx hardhat run scripts/getRootHash.js --network mainnet
```



## Maintainers <a name="maintainers"> </a>
This repository is maintained by the [Tellor team](https://github.com/orgs/tellor-io/people)


## How to Contribute<a name="how2contribute"> </a>  

Check out our issues log here on Github or feel free to reach out anytime [info@tellor.io](mailto:info@tellor.io)

## Copyright

Tellor Inc. 2022



## Use cases
- Allow an airdrop based on the users' balances on a different chain
- Allow a weighted voting based on the users' balances on a different chain
- Allow a user to claim rewards on a different chain



<!---![Trees by Walter Martin. source: unsplash](https://images.unsplash.com/photo-1657729252678-db274e08d7ae?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80))
-->