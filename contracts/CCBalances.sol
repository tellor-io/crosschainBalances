// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "usingtellor/contracts/UsingTellor.sol";

/**
 @author @themandalore && @justbrendax
 @title CCBalances
 @dev Contract for querying balances from another chain
*/
contract CCBalances is UsingTellor{
   
   constructor(address payable _tellor) UsingTellor(_tellor){

   }

   function getCrossChainBalances(uint256 _chain, address _tokenAddress){
       //format query
       //run getDataBefore 12 hours for data
   }
}
