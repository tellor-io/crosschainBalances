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
contract CCBalances is UsingTellor, MerkleTree{

   mapping(uint256 => mapping(address => bytes32)) rootHash;
   
   constructor(address payable _tellor) UsingTellor(_tellor){}

   function getCrossChainBalances(uint256 _chain, address _address) external returns(bytes32 _newRootHash){
        bytes memory _b = abi.encode("CrossChainBalance", abi.encode(_chain, _address));
        bytes32 _queryId = keccak256(_b);
        bool _didGet;
        uint256 _timestamp;
        bytes memory _value;
        (_didGet, _value, _timestamp) = getDataBefore(_queryId,block.timestamp - 12 hours);
        _newRootHash = abi.decode(_value,(bytes32));
        rootHash[_chain][_address] = _newRootHash;
   }

    function verifyBalance(uint256 _chain, address _token, uint256 balance, bytes32[] calldata hashes, bool[] calldata right) external view returns(bool) {
        bytes32 _rootHash = rootHash[_chain][_token];
        bytes32 myHash = keccak256(abi.encode(_token,balance));
        if (hashes.length == 1) {
            require(hashes[0] == myHash);
        } else {
            require(hashes[0] == myHash || hashes[1] == myHash);
        }
        return(MerkleTree.InTree(_rootHash, hashes, right));
    }
    
    function checkProof(uint _chain, address _token, bytes32[] calldata hashes, bool[] calldata hashRight) external view returns (bool) {
        return MerkleTree.InTree(rootHash[_chain][_token], hashes, hashRight);
    }
}
