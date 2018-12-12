pragma solidity >= 0.5.0 < 0.6.0;

import "@netgum/solidity/contracts/ens/AbstractENS.sol";
import "@netgum/solidity/contracts/ens/AbstractENSResolver.sol";
import "@netgum/solidity/contracts/libraries/BytesSignatureLibrary.sol";
import "../account/AbstractAccount.sol";
import "../account/AccountLibrary.sol";
import "../registry/AbstractRegistry.sol";


/**
 * @title Account Proxy Service
 */
contract AccountProxyService {

  event AccountDevicePurposeUpdated(address account, address device, address purpose, uint256 limit, bool unlimited);

  using BytesSignatureLibrary for bytes;
  using AccountLibrary for AbstractAccount;

  struct Account {
    bool connected;
    mapping(address => AccountDevice) devices;
  }

  struct AccountDevice {
    bool exists;
    uint256 nonce;
    mapping(address => AccountDevicePurpose) purposes;
  }

  struct AccountDevicePurpose {
    bool exists;
    uint256 limit;
    bool unlimited;
  }

  mapping(address => Account) accounts;

  constructor() public {
    //
  }

  function accountConnected(address _account) public view returns (bool) {
    return accounts[_account].connected;
  }

  function accountDeviceExists(
    address _account,
    address _device
  ) public view returns (bool) {
    return (
    accountConnected(_account) &&
    accounts[_account].devices[_device].exists
    );
  }

  function accountDevicePurposeExists(
    address _account,
    address _device,
    address _purpose
  ) public view returns (bool) {
    return (
    accountDeviceExists(_account, _device) &&
    accounts[_account].devices[_device].purposes[_purpose].exists
    );
  }

  function getAccountDeviceNonce(
    address _account,
    address _device
  ) public view returns (uint256) {
    return accounts[_account].devices[_device].nonce;
  }

  function verifyAccountDevicePurposeLimit(
    address _account,
    address _device,
    address _purpose,
    uint256 _limit
  ) public view returns (bool) {
    return (
    accountDevicePurposeExists(_account, _device, _purpose) &&
    (
    accounts[_account].devices[_device].purposes[_purpose].unlimited ||
    accounts[_account].devices[_device].purposes[_purpose].limit >= _limit
    )
    );
  }

  function connectAccount(AbstractAccount _account) public {
    require(
      !accountConnected(address(_account)),
      "account already connected"
    );

    _verifyAccountOwnerDevice(
      _account,
      address(this)
    );

    accounts[address(_account)].connected = true;
  }

  function addAccountDevice(
    AbstractAccount _account,
    uint256 _nonce,
    address _device,
    address _purpose,
    uint256 _limit,
    bool _unlimited,
    uint256 _refundGasBase,
    bytes memory _messageSignature
  ) public {
    uint _startGas = gasleft();

    address _signingDevice = _messageSignature.recoverAddress(
      abi.encodePacked(
        address(this),
        msg.sig,
        address(_account),
        _nonce,
        _device,
        _purpose,
        _limit,
        _unlimited,
        _refundGasBase,
        tx.gasprice
      )
    );

    _commonVerification(
      _account,
      _signingDevice,
      _nonce
    );

    _verifyAccountOwnerDevice(
      _account,
      _signingDevice
    );


    require(
      _device != address(0),
      "invalid device"
    );

    require(
      !_account.deviceExists(_device),
      "account device already exists"
    );


    if (_purpose == address(_account) && _unlimited) {
      _account.addDevice(
        _device,
        AbstractAccount.AccessType.OWNER
      );
    } else {
      _account.addDevice(
        _device,
        AbstractAccount.AccessType.DELEGATE
      );

      if (_purpose != address(_purpose)) {
        _verifyLimit(
          _limit,
          _unlimited
        );

        accounts[address(_account)].devices[_device].exists = true;
        accounts[address(_account)].devices[_device].purposes[_purpose].exists = true;
        accounts[address(_account)].devices[_device].purposes[_purpose].limit = _limit;
        accounts[address(_account)].devices[_device].purposes[_purpose].unlimited = _unlimited;

        emit AccountDevicePurposeUpdated(
          address(_account),
          _device,
          _purpose,
          _limit,
          _unlimited
        );
      }
    }

    _refundGas(_account, _refundGasBase, _startGas);
  }

  function _commonVerification(
    AbstractAccount _account,
    address _device,
    uint256 _nonce
  ) internal {
    require(
      address(_account) != address(0),
      "invalid account"
    );

    require(
      accountConnected(address(_account)),
      "account not connected"
    );

    require(
      (
      _device != address(0) &&
      _account.deviceExists(_device)
      ),
      "invalid account device"
    );

    require(
      accounts[address(_account)].devices[_device].nonce == _nonce,
      "invalid nonce"
    );

    ++accounts[address(_account)].devices[_device].nonce;
  }

  function _verifyAccountOwnerDevice(
    AbstractAccount _account,
    address _device
  ) internal view {
    require(
      _account.getDeviceAccessType(_device) == AbstractAccount.AccessType.OWNER,
      "account device is not an owner"
    );
  }

  function _verifyLimit(
    uint256 _limit,
    bool _unlimited
  ) internal pure {
    require(
      (_unlimited && _limit == 0) ||
      (!_unlimited && _limit > 0),
      "invalid limit"
    );
  }

  function _refundGas(AbstractAccount _account, uint256 _gasBase, uint _startGas) internal {
    if (_gasBase > 0) {
      uint256 _gasTotal = _gasBase + _startGas - gasleft();

      (bool _succeeded,) = _account.executeTransaction(
        msg.sender,
        _gasTotal * tx.gasprice,
        new bytes(0)
      );

      require(
        _succeeded,
        "can't refund gas"
      );
    }
  }
}
