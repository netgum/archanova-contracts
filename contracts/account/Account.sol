pragma solidity >= 0.5.0 < 0.6.0;

import "../shared/AbstractInitializer.sol";
import "./AbstractAccount.sol";

/**
 * @title Account
 */
contract Account is AbstractInitializer, AbstractAccount {

  mapping(address => AccessType) internal devicesAccessType;
  mapping(address => bool) private devicesLog;

  modifier onlyOwner() {
    require(
      getDeviceAccessType(msg.sender) == AccessType.OWNER,
      "msg.sender is not owner"
    );

    _;
  }

  function() external payable {
    //
  }

  function initialize(address[] memory _devices) onlyInitializer() public {
    for (uint i = 0; i < _devices.length; i++) {
      if (_devices[i] != address(0)) {
        devicesAccessType[_devices[i]] = AccessType.OWNER;
        devicesLog[_devices[i]] = true;
      }
    }
  }

  function deviceExists(address _device) public view returns (bool) {
    return devicesAccessType[_device] != AccessType.NONE;
  }

  function deviceExisted(address _device) public view returns (bool) {
    return devicesLog[_device];
  }

  function getDeviceAccessType(address _device) public view returns (AccessType) {
    return devicesAccessType[_device];
  }

  function addDevice(address _device, AccessType _accessType) onlyOwner public {
    require(
      _accessType != AccessType.NONE,
      "invalid device type"
    );
    require(
      _device != address(0),
      "invalid device"
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

  function executeTransaction(
    address payable _to,
    uint256 _value,
    bytes memory _data
  ) onlyOwner public returns (bytes memory _response) {
    require(
      _to != address(0) &&
      _to != address(this),
      "invalid recipient"
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
