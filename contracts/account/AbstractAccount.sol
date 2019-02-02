pragma solidity ^0.5.0;

/**
 * @title Abstract Account
 */
contract AbstractAccount {

  enum AccessTypes {
    NONE,
    OWNER,
    DELEGATE
  }

  event DeviceAdded(address deviceAddress, AccessTypes deviceAccessType);

  event DeviceRemoved(address deviceAddress);

  event TransactionExecuted(address payable to, uint256 value, bytes data, bytes response);

  function deviceExists(address _device) public view returns (bool);

  function deviceExisted(address _device) public view returns (bool);

  function getDeviceAccessType(address _device) public view returns (AccessTypes);

  function addDevice(address _device, AccessTypes _accessType) public;

  function removeDevice(address _device) public;

  function executeTransaction(address payable _to, uint256 _value, bytes memory _data) public returns (bytes memory _response);
}
