pragma solidity >= 0.5.0 < 0.6.0;

import "./AbstractRegistry.sol";
import "./AbstractRegistryService.sol";


/**
 * @title Registry Service Example
 */
contract RegistryServiceExample is AbstractRegistryService {

  function initialize(address _registry) onlyInitializer() public {
    registry = AbstractRegistry(_registry);
  }

  function deployAccount(bytes32 _salt) public {
    address[] memory _devices = new address[](1);
    _devices[0] = msg.sender;

    registry.deployAccount(_salt, _devices);
  }
}
