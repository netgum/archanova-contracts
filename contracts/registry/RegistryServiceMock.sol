pragma solidity >= 0.5.0 < 0.6.0;

import "./AbstractRegistry.sol";


/**
 * @title Registry Service Mock
 */
contract RegistryServiceMock {

  AbstractRegistry private registry;

  constructor(AbstractRegistry _registry) public {
    registry = _registry;
  }
  function registerAccount(address _account) public {
    registry.registerAccount(_account);
  }
}
