pragma solidity ^0.5.0;

import "../stateToken/AbstractStateTokenFactory.sol";


/**
 * @title Abstract Platform State Token Factory
 */
contract AbstractPlatformStateTokenFactory is AbstractStateTokenFactory {

  event TokenFunded(bytes32 tokenHash, uint256 amount);

  function fundToken(uint256 _tokenId) payable public;
}
