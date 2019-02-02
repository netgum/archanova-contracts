pragma solidity ^0.5.0;

import "../account/Account.sol";
import "./AbstractPlatformAccount.sol";


/**
 * @title Platform Account
 */
contract PlatformAccount is AbstractPlatformAccount, Account(address(0)) {

  function initialize(address[] memory _devices, uint256 _refundAmount) onlyInitializer() public {
    for (uint i = 0; i < _devices.length; i++) {
      if (_devices[i] != address(0)) {
        devicesAccessType[_devices[i]] = AccessTypes.OWNER;
        devicesLog[_devices[i]] = true;
      }
    }

    if (_refundAmount > 0) {
      msg.sender.transfer(_refundAmount);
    }
  }
}
