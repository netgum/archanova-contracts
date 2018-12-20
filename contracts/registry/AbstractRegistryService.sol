pragma solidity >= 0.5.0 < 0.6.0;

import "../initializer/AbstractInitializer.sol";
import "./AbstractRegistry.sol";


/**
 * @title Abstract Registry Service
 */
contract AbstractRegistryService is AbstractInitializer {

  AbstractRegistry internal registry;

  constructor() public {
    initializer = msg.sender;
    registry = AbstractRegistry(msg.sender);
  }

  function transferInitializer(address _initializer) onlyInitializer() public {
    initializer = _initializer;
  }
}
