pragma solidity >= 0.5.0 < 0.6.0;

/**
 * @title Abstract Account
 */
contract AbstractAccount {

  enum AccessType {
    NONE,
    OWNER,
    DELEGATE
  }

  event DeviceAdded(address device, AccessType accessType);

  event DeviceRemoved(address device);

  event TransactionExecuted(address payable to, uint256 value, bytes data, bytes response);

  bool public initialized;

  function initialize(address[] memory _devices) public;

  function deviceExists(address _device) public view returns (bool);

  function deviceExisted(address _device) public view returns (bool);

  function getDeviceAccessType(address _device) public view returns (AccessType);

  function addDevice(address _device, AccessType _accessType) public;

  function removeDevice(address _device) public;

  function executeTransaction(address payable _to, uint256 _value, bytes memory _data) public returns (bytes memory);
}
