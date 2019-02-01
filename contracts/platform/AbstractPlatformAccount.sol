pragma solidity >= 0.5.0 < 0.6.0;

import "../shared/AbstractAccount.sol";
import "../shared/AbstractInitializer.sol";


/**
 * @title Abstract Platform Account
 */
contract AbstractPlatformAccount is AbstractAccount, AbstractInitializer {

  function initialize(address[] memory _devices, uint256 _refundAmount) public;
}
