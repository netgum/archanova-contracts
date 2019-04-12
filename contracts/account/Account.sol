pragma solidity ^0.5.2;

import "./AbstractAccount.sol";


/**
 * @title Account
 */
contract Account is AbstractAccount {

  string constant ERR_ONLY_OWNER = "Sender is not owner";
  string constant ERR_ONLY_INITIALIZER = "Sender is not a initializer";
  string constant ERR_INVALID_DEVICE = "Invalid device";
  string constant ERR_INVALID_ACCESS_TYPE = "Invalid access type";
  string constant ERR_INVALID_RECIPIENT = "Invalid recipient";
  string constant ERR_DEVICE_ALREADY_EXISTS = "Device already exists";
  string constant ERR_DEVICE_DOESNT_EXIST = "Device doesn't exist";
  string constant ERR_TRANSACTION_FAILED = "Transaction failed";

  address private initializer;

  modifier onlyOwner() {
    require(
      devices[msg.sender].accessType == AccessTypes.OWNER,
      ERR_ONLY_OWNER
    );

    _;
  }

  modifier onlyInitializer() {
    require(
      msg.sender == initializer,
      ERR_ONLY_INITIALIZER
    );

    delete initializer;

    _;
  }

  constructor() public {
    initializer = msg.sender;
  }

  function() external payable {
    //
  }

  function initialize(address[] memory _devices, uint256 _refund, address payable _beneficiary) onlyInitializer() public {
    for (uint i = 0; i < _devices.length; i++) {
      if (_devices[i] != address(0)) {
        devices[_devices[i]].accessType = AccessTypes.OWNER;
        devices[_devices[i]].existed = true;
      }
    }

    if (_refund > 0) {
      _beneficiary.transfer(_refund);
    }
  }

  function addDevice(address _device, AccessTypes _accessType) onlyOwner public {
    require(
      _device != address(0),
      ERR_INVALID_DEVICE
    );
    require(
      _accessType != AccessTypes.NONE,
      ERR_INVALID_ACCESS_TYPE
    );
    require(
      devices[_device].accessType == AccessTypes.NONE,
      ERR_DEVICE_ALREADY_EXISTS
    );

    devices[_device].accessType = _accessType;

    if (!devices[_device].existed) {
      devices[_device].existed = true;
    }

    emit DeviceAdded(_device, _accessType);
  }

  function removeDevice(address _device) onlyOwner public {
    require(
      devices[_device].accessType != AccessTypes.NONE,
      ERR_DEVICE_DOESNT_EXIST
    );

    delete devices[_device].accessType;

    emit DeviceRemoved(_device);
  }

  function executeTransaction(address payable _recipient, uint256 _value, bytes memory _data) onlyOwner public returns (bytes memory _response) {
    require(
      _recipient != address(0) &&
      _recipient != address(this),
      ERR_INVALID_RECIPIENT
    );

    bool _succeeded;
    (_succeeded, _response) = _recipient.call.value(_value)(_data);

    require(
      _succeeded,
      ERR_TRANSACTION_FAILED
    );

    emit TransactionExecuted(_recipient, _value, _data, _response);
  }
}
