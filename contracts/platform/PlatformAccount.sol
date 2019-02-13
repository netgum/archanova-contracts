pragma solidity ^0.5.0;

import "../account/Account.sol";
import "../initializer/Initializer.sol";
import "./AbstractPlatformAccount.sol";


/**
 * @title Platform Account
 */
contract PlatformAccount is AbstractPlatformAccount, Account(address(0)), Initializer {

  function initialize(address[] memory _devices, uint256 _refundAmount, address payable _refundBeneficiary) onlyInitializer() public {
    for (uint i = 0; i < _devices.length; i++) {
      if (_devices[i] != address(0)) {
        devicesAccessType[_devices[i]] = AccessTypes.OWNER;
        devicesLog[_devices[i]] = true;
      }
    }

    if (_refundAmount > 0) {
      if (_refundBeneficiary == address(0)) {
        msg.sender.transfer(_refundAmount);
      } else {
        _refundBeneficiary.transfer(_refundAmount);
      }
    }
  }

  function() external payable {
    //
  }
}
