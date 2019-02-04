pragma solidity ^0.5.0;

import "../account/AbstractAccount.sol";


/**
 * @title Abstract Guarded
 */
contract AbstractGuarded {

  AbstractAccount public guardian;

  function verifyGuardianSignature(bytes memory _signature, bytes memory _message) public view returns (address _device);
}
