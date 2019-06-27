pragma solidity ^0.5.8;

import "../account/AbstractAccount.sol";
import "../account/AccountLibrary.sol";


/**
 * @title Guarded
 */
contract Guarded {

  using AccountLibrary for AbstractAccount;

  string constant ERR_ONLY_GUARDIAN = "Sender is not a guardian or guardian device";

  AbstractAccount public guardian;

  modifier onlyGuardian() {
    require(
      (
      address(guardian) == msg.sender ||
      guardian.isAnyDevice(msg.sender)
      ),
      ERR_ONLY_GUARDIAN
    );

    _;
  }

  constructor(address _guardian) internal {
    guardian = AbstractAccount(_guardian);
  }
}
