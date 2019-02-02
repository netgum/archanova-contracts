pragma solidity ^0.5.0;

import "../account/AbstractAccount.sol";
import "../account/AccountLibrary.sol";


/**
 * @title Abstract Guarded
 */
contract AbstractGuarded {

  using AccountLibrary for AbstractAccount;

  AbstractAccount public guardian;

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

  constructor() internal {
    //
  }

  function verifyGuardianSignature(bytes memory _signature, bytes memory _message) public view returns (address _device) {
    _device = guardian.verifyDeviceSignature(
      _signature,
      _message,
      true
    );
  }
}
