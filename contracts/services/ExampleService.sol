pragma solidity >= 0.5.0 < 0.6.0;

import "../registry/AbstractRegistry.sol";


/**
 * @title Example Service
 */
contract ExampleService {

  AbstractRegistry private registry;

  constructor(AbstractRegistry _registry) public {
    registry = _registry;
  }
  function registerAccount(address _account) public {
    registry.registerAccount(_account);
  }
}
