pragma solidity ^0.5.8;

import "./ENSMultiManager.sol";


/**
 * @title ENS Multi Manager Wrapper
 */
contract ENSMultiManagerWrapper is ENSMultiManager {

  event Registered(bytes32 label, bytes32 rootNode, address addr);

  constructor(address _ens) public ENSMultiManager(_ens) {
    //
  }

  function register(bytes32 _label, bytes32 _rootNode, address _addr) public {
    _register(_label, _rootNode, _addr);

    emit Registered(_label, _rootNode, _addr);
  }
}
