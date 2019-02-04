pragma solidity ^0.5.0;

import "./Guarded.sol";


/**
 * @title Guarded Example
 */
contract GuardedExample is Guarded {

  bytes private state;

  constructor(address _guardian) Guarded(_guardian) public {
    //
  }

  function foo() onlyGuardian public {
    state = msg.data;
  }
}
