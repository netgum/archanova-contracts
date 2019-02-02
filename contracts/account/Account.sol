pragma solidity ^0.5.0;

import "./AbstractAccount.sol";


/**
 * @title Account
 */
contract Account is AbstractAccount {

  mapping(address => AccessTypes) internal devicesAccessType;
  mapping(address => bool) internal devicesLog;

  modifier onlyOwner() {
    require(
      getDeviceAccessType(msg.sender) == AccessTypes.OWNER,
      "msg.sender is not owner"
    );

    _;
  }

  constructor(address _device) public {
    if (_device != address(0)) {
      devicesAccessType[_device] = AccessTypes.OWNER;
      devicesLog[_device] = true;
    }
  }

  function() external payable {
    //
  }

  function deviceExists(address _device) public view returns (bool) {
    return devicesAccessType[_device] != AccessTypes.NONE;
  }

  function deviceExisted(address _device) public view returns (bool) {
    return devicesLog[_device];
  }

  function getDeviceAccessType(address _device) public view returns (AccessTypes) {
    return devicesAccessType[_device];
  }

  function addDevice(address _device, AccessTypes _accessType) onlyOwner public {
    require(
      _accessType != AccessTypes.NONE,
      "invalid device access type"
    );
    require(
      _device != address(0),
      "invalid device address"
    );
    require(
      !deviceExists(_device),
      "device already exists"
    );

    devicesAccessType[_device] = _accessType;
    devicesLog[_device] = true;

    emit DeviceAdded(_device, _accessType);
  }

  function removeDevice(address _device) onlyOwner public {
    require(
      deviceExists(_device),
      "device doesn't exists"
    );

    delete devicesAccessType[_device];

    emit DeviceRemoved(_device);
  }

  function executeTransaction(address payable _to, uint256 _value, bytes memory _data) onlyOwner public returns (bytes memory _response) {
    require(
      _to != address(0) &&
      _to != address(this),
      "invalid address"
    );

    bool _succeeded;
    (_succeeded, _response) = _to.call.value(_value)(_data);

    require(
      _succeeded,
      "transaction failed"
    );

    emit TransactionExecuted(_to, _value, _data, _response);
  }
}
