pragma solidity ^0.5.0;

import "../account/AbstractAccount.sol";
import "./AbstractGuarded.sol";


/**
 * @title Guarded Example
 */
contract GuardedExample is AbstractGuarded {

  bytes state;

  constructor(address _guardian) public {
    guardian = AbstractAccount(_guardian);
  }

  function foo() onlyGuardian public {
    state = msg.data;
  }
}
