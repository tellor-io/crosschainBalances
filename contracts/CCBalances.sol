// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "usingtellor/contracts/UsingTellor.sol";
import "./helpers/MerkleTree.sol";

/**
 @author @themandalore && @justbrendax
 @title CCBalances
 @dev Contract for querying balances from another chain
 //shout out to https://github.com/jochem-brouwer/ERC20Snapshot for some of the code!
*/
contract CCBalances is UsingTellor{

    mapping(address => address) tokenToMerkleTree;
    mapping(address => bytes32) rootHash;
   
       
    
   constructor(address payable _tellor) UsingTellor(_tellor){
       rootHash = _rootHash;

   }

   function newMerkleTree(bytes32 _rootHash, address _token) external{
       MerkleTree _address = new MerkleTree();
       rootHash[_address] = _rootHash;
       tokenToMerkleTree[_token] = _address;
   }

   function getCrossChainBalances(uint256 _chain, address _tokenAddress){
       //format query
       //run getDataBefore 12 hours for data
   }

    function hash(address target, uint balance) public pure returns (bytes32) {
        return keccak256(abi.encode(target,balance));
    }

    function verifyBalance(address target, uint balance, bytes32[] calldata hashes, bool[] calldata right) external view returns(bool) {
        bytes32 myHash = hash(target, balance);
        if (hashes.length == 1) {
            require(hashes[0] == myHash);
        } else {
            require(hashes[0] == myHash || hashes[1] == myHash);
        }
        require(MerkleTree.InTree(rootHash, hashes, right));
        return true;
    }
    
    function checkProof(bytes32[] calldata hashes, bool[] calldata hashRight) external view returns (bool) {
        return MerkleTree.InTree(rootHash, hashes, hashRight);
    }
}
