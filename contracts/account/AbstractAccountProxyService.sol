pragma solidity >= 0.5.0 < 0.6.0;

import "./AbstractAccount.sol";


/**
 * @title Abstract Account Proxy Service
 */
contract AbstractAccountProxyService {

  event AccountVirtualDeviceAdded(address account, address device, address purpose, uint256 limit, bool unlimited);
  event AccountVirtualDeviceRemoved(address account, address device);

  function getAccount(
    address _account
  ) public view returns (bool _connected, uint256 _nonce);

  function getAccountVirtualDevice(
    address _account,
    address _device
  ) public view returns (address _purpose, uint256 _limit, bool _unlimited);

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
}
