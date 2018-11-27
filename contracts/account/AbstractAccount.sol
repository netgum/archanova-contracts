pragma solidity >= 0.5.0 < 0.6.0;

import "@netgum/solidity/contracts/sharedAccount/AbstractSharedAccount.sol";


/**
 * @title Abstract Account
 */
contract AbstractAccount is AbstractSharedAccount {

  bool public initialized;

  function initialize(address[] memory _devices) public;
}
