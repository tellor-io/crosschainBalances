// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "usingtellor/contracts/UsingTellor.sol";

/**
 @author @themandalore && @justbrendax
 @title CCBalances
 @dev Contract for querying balances from another chain
 //shout out to https://github.com/jochem-brouwer/ERC20Snapshot for some of the code!
*/
contract CCBalances is UsingTellor{
   
   constructor(address payable _tellor) UsingTellor(_tellor){

   }

   function getCrossChainBalances(uint256 _chain, address _tokenAddress){
       //format query
       //run getDataBefore 12 hours for data
   }


    bytes32 public rootHash;
    
    mapping(address => bool) claimed;
    
    /** @dev Contract constructor
      * @param _rootHash The bytes32 rootHash of the Merkle Tree
      * @param _cap The token supply cap
      * @param _name The name of the token 
      * @param _symbol The symbol of the token
      * @param _decimals The decimals of the token
      */
    constructor(bytes32 _rootHash, uint _cap, string memory _name, string memory _symbol, uint _decimals) 
        ERC20(_cap, _name, _symbol, _decimals)
        public 
    { 
        rootHash = _rootHash;
        _balances[msg.sender] = 0;
    }
    
    function hash(address target, uint balance) public pure returns (bytes32) {
        return keccak256(abi.encode(target,balance));
    }

    function claim(address target, uint balance, bytes32[] calldata hashes, bool[] calldata right) external {
        bytes32 myHash = hash(target, balance);
        if (hashes.length == 1) {
            require(hashes[0] == myHash);
        } else {
            require(hashes[0] == myHash || hashes[1] == myHash);
        }
        require(MerkleTree.InTree(rootHash, hashes, right));
        require(!claimed[target]);
        claimed[target] = true;
        
        _balances[target] = balance;
        emit Transfer(address(0x0), target, balance);
    }
    
    function checkProof(bytes32[] calldata hashes, bool[] calldata hashRight) external view returns (bool) {
        return MerkleTree.InTree(rootHash, hashes, hashRight);
    }
}
