// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "usingtellor/contracts/UsingTellor.sol";
import "./helpers/MerkleTree.sol";
import "hardhat/console.sol";

/**
 @author @themandalore && @justbrendax
 @title CCBalances
 @dev Contract for querying balances from another chain
 //shout out to https://github.com/jochem-brouwer/ERC20Snapshot for some of the code!
*/
contract CCBalances is UsingTellor, MerkleTree{

   mapping(uint256 => mapping(address => bytes32)) public rootHash;
   
   constructor(address payable _tellor) UsingTellor(_tellor){}

   /** Gets the balances for the specified chain and token address. The chain id and 
    * token address are the encoded parameters that create the queryId in tellor. 
    * @param _chain chain id
    * @param _address is the token address containing the balances 
    */
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

    /** Verifies the balance claimed by the add
     * @param _chain chain id
     * @param _token is the token address containing the balances 
     * @param _balance being claimed
     * @param _hashes The array of the hash items. The first is hashed with the second, the second with the third, etc.
     * @return A boolean wether `TargetHash` is part of the Merkle Tree with root hash `RootHash`. True if it is part of this tree, false if not. 
     */
    function verifyBalance(uint256 _chain, address _token, address _account, uint256 _balance, bytes32[] calldata _hashes, bool[] calldata _right) external view returns(bool) {
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
    
    /** Checks the proof provided...
     * @param _chain chain id
     * @param _token is the token address containing the balances 
     * @param _hashes the hashes 
     * @param _hashes The array of the hash items. The first is hashed with the second, the second with the third, etc.
     * @param _hashRight true/false if 
     * @return A boolean wether `TargetHash` is part of the Merkle Tree with root hash `RootHash`. True if it is part of this tree, false if not. 
     */
    function checkProof(uint _chain, address _token, bytes32[] calldata _hashes, bool[] calldata _hashRight) external view returns (bool) {
        return MerkleTree.InTree(rootHash[_chain][_token], _hashes, _hashRight);
    }
}
