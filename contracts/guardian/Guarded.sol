pragma solidity ^0.5.0;

import "../account/AbstractAccount.sol";
import "../account/AccountLibrary.sol";
import "./AbstractGuarded.sol";


/**
 * @title Guarded
 */
contract Guarded is AbstractGuarded {

  using AccountLibrary for AbstractAccount;

  modifier onlyGuardian() {
    require(
      (
      address(guardian) == msg.sender ||
      guardian.deviceExists(msg.sender)
      ),
      "msg.sender is not a guardian device"
    );
    _;
  }

  constructor(address _guardian) public {
    guardian = AbstractAccount(_guardian);
  }

  function verifyGuardianSignature(bytes memory _signature, bytes memory _message) public view returns (address _device) {
    _device = guardian.verifyDeviceSignature(
      _signature,
      _message,
      true
    );
  }
}
