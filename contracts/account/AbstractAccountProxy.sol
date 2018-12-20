pragma solidity >= 0.5.0 < 0.6.0;

import "./AbstractAccount.sol";


/**
 * @title Abstract Account Proxy
 */
contract AbstractAccountProxy {

  event AccountVirtualDeviceAdded(address account, address device, address purpose, uint256 limit, bool unlimited);
  event AccountVirtualDeviceLimitUpdated(address account, address device, uint256 limit);
  event AccountVirtualDeviceRemoved(address account, address device);

  function getAccount(
    address _account
  ) public view returns (bool _connected, uint256 _nonce);

  function getAccountVirtualDevice(
    address _account,
    address _device
  ) public view returns (address _purpose, uint256 _limit, bool _unlimited);

  function accountConnected(address _account) public view returns (bool);

  function accountVirtualDeviceExists(address _account, address _device) public view returns (bool);

  function connectAccount(address _account) public;

  function disconnectAccount(address _account) public;

  function addAccountDevice(
    address _account,
    uint256 _nonce,
    address _device,
    AbstractAccount.AccessType _accessType,
    uint256 _refundGasBase,
    bytes memory _signature
  ) public;

  function removeAccountDevice(
    address _account,
    uint256 _nonce,
    address _device,
    uint256 _refundGasBase,
    bytes memory _signature
  ) public;

  function addAccountVirtualDevice(
    address _account,
    uint256 _nonce,
    address _device,
    address _purpose,
    uint256 _limit,
    bool _unlimited,
    uint256 _refundGasBase,
    bytes memory _signature
  ) public;

  function setAccountVirtualDeviceLimit(
    address _account,
    uint256 _nonce,
    address _device,
    uint256 _limit,
    uint256 _refundGasBase,
    bytes memory _signature
  ) public;

  function removeAccountVirtualDevice(
    address _account,
    uint256 _nonce,
    address _device,
    uint256 _refundGasBase,
    bytes memory _signature
  ) public;

  function executeTransaction(
    address _account,
    uint256 _nonce,
    address payable _to,
    uint256 _value,
    bytes memory _data,
    uint256 _refundGasBase,
    bytes memory _signature
  ) public;
}
