pragma solidity ^0.5.0;

import "../account/AbstractAccount.sol";


/**
 * @title Abstract Platform Account Proxy
 */
contract AbstractPlatformAccountProxy {

  event AccountVirtualDeviceAdded(
    address accountAddress,
    address deviceAddress,
    address purposeAddress,
    uint256 limit,
    bool unlimited
  );

  event AccountVirtualDeviceLimitUpdated(
    address accountAddress,
    address deviceAddress,
    uint256 limit
  );

  event AccountVirtualDeviceRemoved(
    address accountAddress,
    address deviceAddress
  );

  function getAccountNonce(address _account) public view returns (uint256);

  function getAccountVirtualDevice(address _account, address _device) public view returns (address _purpose, uint256 _limit, bool _unlimited);

  function accountVirtualDeviceExists(address _account, address _device) public view returns (bool);

  function addAccountDevice(
    address _account,
    uint256 _nonce,
    address _device,
    AbstractAccount.AccessTypes _accessType,
    uint256 _fixedGas,
    bytes memory _signature
  ) public;

  function removeAccountDevice(
    address _account,
    uint256 _nonce,
    address _device,
    uint256 _fixedGas,
    bytes memory _signature
  ) public;

  function addAccountVirtualDevice(
    address _account,
    uint256 _nonce,
    address _device,
    address _purpose,
    uint256 _limit,
    bool _unlimited,
    uint256 _fixedGas,
    bytes memory _signature
  ) public;

  function setAccountVirtualDeviceLimit(
    address _account,
    uint256 _nonce,
    address _device,
    uint256 _limit,
    uint256 _fixedGas,
    bytes memory _signature
  ) public;

  function removeAccountVirtualDevice(
    address _account,
    uint256 _nonce,
    address _device,
    uint256 _fixedGas,
    bytes memory _signature
  ) public;

  function executeTransaction(
    address _account,
    uint256 _nonce,
    address payable _to,
    uint256 _value,
    bytes memory _data,
    uint256 _fixedGas,
    bytes memory _signature
  ) public;
}
