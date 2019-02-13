pragma solidity ^0.5.0;

import "../account/AbstractAccount.sol";
import "../initializer/AbstractInitializer.sol";


/**
 * @title Abstract Platform Account
 */
contract AbstractPlatformAccount is AbstractAccount, AbstractInitializer {

  function initialize(address[] memory _devices, uint256 _refundAmount, address payable _refundBeneficiary) public;
}
