pragma solidity >= 0.5.0 < 0.6.0;

import "./AbstractAccount.sol";


/**
 * @title Abstract Guardian
 */
contract AbstractGuardian is AbstractAccount {

  function verifyDeviceSignature(bytes memory _signature, bytes memory _message, bool _strict) public view returns (address _device);
}
