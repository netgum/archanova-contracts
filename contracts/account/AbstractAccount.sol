pragma solidity ^0.5.2;

/**
 * @title Abstract Account
 */
contract AbstractAccount {

  event DeviceAdded(address device, AccessTypes accessType);
  event DeviceRemoved(address device);
  event TransactionExecuted(address recipient, uint256 value, bytes data, bytes response);

  enum AccessTypes {
    NONE,
    OWNER,
    DELEGATE
  }

  struct Device {
    AccessTypes accessType;
    bool existed;
  }

  mapping(address => Device) public devices;

  function initialize(address[] memory _devices, uint256 _refund, address payable _beneficiary) public;

  function addDevice(address _device, AccessTypes _accessType) public;

  function removeDevice(address _device) public;

  function executeTransaction(address payable _recipient, uint256 _value, bytes memory _data) public returns (bytes memory _response);
}
