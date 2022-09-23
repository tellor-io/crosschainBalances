// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "usingtellor/contracts/UsingTellor.sol";
import "./CCBalances.sol";
import "./helpers/MerkleTree.sol";
import "./helpers/ERC20.sol";


/**
 @author @themandalore && @justbrendax
 @title ClaimYourPrize
 @dev Test contract for querying balances from another chain and allows user to claim other token
 //shout out to https://github.com/jochem-brouwer/ERC20Snapshot for some of the code!
*/
contract ClaimYourPrize is CCBalances, ERC20{

   
   mapping(address => bool) public claimed;

   event claimedPrize (address account, uint256 amount);

   constructor(
       address payable _tellor, 
       uint _cap, 
       string memory _name, 
       string memory _symbol
       )
       CCBalances(_tellor) 
       ERC20(_cap, _name, _symbol)
       {}

   /** Allows the user to claim their tokens based on the balance on another chain.
    * @param _chain chain id
    * @param _token is the token address containing the user balance
    * @param _account is the user address to check the balance for
    * @param _balance being claimed
    * @param _hashes The array of the hash items. The first is hashed with the second, the second with the third, etc.
    */
    function claimYourPrize(uint256 _chain, address _token, address _account, uint256 _balance, bytes32[] calldata _hashes, bool[] calldata _right) external {
        require(verifyBalance(_chain, _token, _account, _balance, _hashes, _right));
        require(claimed[_account]== false);
        claimed[_account] = true;
        transfer(_account, _balance);
        emit claimedPrize (_account, _balance);
    }

 
    
}
