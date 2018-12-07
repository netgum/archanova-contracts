pragma solidity >= 0.5.0 < 0.6.0;

import "./AbstractAccount.sol";

/**
 * @title Account
 */
contract Account is AbstractAccount {

  mapping(address => AccessType) internal devicesAccessType;
  mapping(address => bool) private devicesLog;

  modifier onlyOwner() {
    require(
      devicesAccessType[msg.sender] == AccessType.OWNER,
      "msg.sender is not owner"
    );

    _;
  }

  constructor() public {
    //
  }

  function() external payable {
    //
  }

  function initialize(address[] memory _devices) public {
    require(
      !initialized,
      "account already initialized"
    );

    for (uint i = 0; i < _devices.length; i++) {
      devicesAccessType[_devices[i]] = AccessType.OWNER;
      devicesLog[_devices[i]] = true;
    }

    initialized = true;
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
  ) onlyOwner public returns (bool _succeeded, bytes memory _response) {
    require(
      _to != address(0) &&
      _to != address(this),
      "invalid recipient"
    );

    (_succeeded, _response) = _to.call.gas(0).value(_value)(_data);

    emit TransactionExecuted(_to, _value, _data, _succeeded);
  }
}
