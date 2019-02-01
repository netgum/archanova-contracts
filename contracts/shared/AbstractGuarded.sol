pragma solidity >= 0.5.0 < 0.6.0;

import "./AbstractGuardian.sol";


/**
 * @title Abstract Guarded
 */
contract AbstractGuarded {

  AbstractGuardian public guardian;

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
}
