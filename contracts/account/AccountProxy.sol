pragma solidity >= 0.5.0 < 0.6.0;

import "@netgum/solidity/contracts/libraries/BytesSignatureLibrary.sol";
import "../registry/AbstractRegistry.sol";
import "../registry/AbstractRegistryService.sol";
import "./AbstractAccount.sol";
import "./AbstractAccountProxy.sol";
import "./AccountLibrary.sol";


/**
 * @title Account Proxy
 */
contract AccountProxy is AbstractRegistryService, AbstractAccountProxy {

  using BytesSignatureLibrary for bytes;
  using AccountLibrary for AbstractAccount;

  struct AccountVirtualDevice {
    address purpose;
    uint256 limit;
    bool unlimited;
  }

  struct Account {
    bool connected;
    uint256 nonce;
    mapping(address => AccountVirtualDevice) virtualDevices;
  }

  mapping(address => Account) accounts;

  modifier verifyAccount(address _account, uint256 _nonce) {
    require(
      accountConnected(_account),
      "account is not connected"
    );
    require(
      accounts[_account].nonce == _nonce,
      "invalid account nonce"
    );

    _;

    ++accounts[_account].nonce;
  }

  modifier onlyAccountOwner(address _account, address _device) {
    require(
      AbstractAccount(_account).getDeviceAccessType(_device) == AbstractAccount.AccessType.OWNER,
      "device is not an account owner"
    );
    _;
  }

  function getAccount(
    address _account
  ) public view returns (bool _connected, uint256 _nonce) {
    _connected = accounts[_account].connected;
    _nonce = accounts[_account].nonce;
  }

  function getAccountVirtualDevice(
    address _account,
    address _device
  ) public view returns (address _purpose, uint256 _limit, bool _unlimited) {
    _purpose = accounts[_account].virtualDevices[_device].purpose;
    _limit = accounts[_account].virtualDevices[_device].limit;
    _unlimited = accounts[_account].virtualDevices[_device].unlimited;
  }

  function accountConnected(address _account) public view returns (bool) {
    return accounts[_account].connected;
  }

  function accountVirtualDeviceExists(address _account, address _device) public view returns (bool) {
    return accounts[_account].virtualDevices[_device].purpose != address(0);
  }

  function connectAccount(address _account) public onlyAccountOwner(_account, address(this)) {
    require(
      !accountConnected(_account),
      "account already connected"
    );

    accounts[_account].connected = true;
  }

  function disconnectAccount(address _account) public onlyAccountOwner(_account, msg.sender) {
    require(
      accountConnected(_account),
      "account already disconnected"
    );

    delete accounts[_account];
  }

  function addAccountDevice(
    address _account,
    uint256 _nonce,
    address _device,
    AbstractAccount.AccessType _accessType,
    uint256 _refundGasBase,
    bytes memory _signature
  ) public {
    uint _refundStartGas = gasleft();

    address _sender = _signature.recoverAddress(
      abi.encodePacked(
        address(this),
        msg.sig,
        _account,
        _nonce,
        _device,
        _accessType,
        _refundGasBase,
        tx.gasprice
      )
    );

    _addAccountDevice(
      _sender,
      _account,
      _nonce,
      _device,
      _accessType
    );

    _refundGas(_account, _refundStartGas, _refundGasBase);
  }

  function removeAccountDevice(
    address _account,
    uint256 _nonce,
    address _device,
    uint256 _refundGasBase,
    bytes memory _signature
  ) public {
    uint _refundStartGas = gasleft();

    address _sender = _signature.recoverAddress(
      abi.encodePacked(
        address(this),
        msg.sig,
        _account,
        _nonce,
        _device,
        _refundGasBase,
        tx.gasprice
      )
    );

    _removeAccountDevice(
      _sender,
      _account,
      _nonce,
      _device
    );

    _refundGas(_account, _refundStartGas, _refundGasBase);
  }

  function addAccountVirtualDevice(
    address _account,
    uint256 _nonce,
    address _device,
    address _purpose,
    uint256 _limit,
    bool _unlimited,
    uint256 _refundGasBase,
    bytes memory _signature
  ) public {
    uint _refundStartGas = gasleft();

    address _sender = _refundGasBase == 0 && _signature.length == 0
    ? msg.sender
    : _signature.recoverAddress(
      abi.encodePacked(
        address(this),
        msg.sig,
        _account,
        _nonce,
        _device,
        _purpose,
        _limit,
        _unlimited,
        _refundGasBase,
        tx.gasprice
      )
    );

    _addAccountVirtualDevice(
      _sender,
      _account,
      _nonce,
      _device,
      _purpose,
      _limit,
      _unlimited
    );

    _refundGas(_account, _refundStartGas, _refundGasBase);
  }

  function setAccountVirtualDeviceLimit(
    address _account,
    uint256 _nonce,
    address _device,
    uint256 _limit,
    uint256 _refundGasBase,
    bytes memory _signature
  ) public {
    uint _refundStartGas = gasleft();

    address _sender = _refundGasBase == 0 && _signature.length == 0
    ? msg.sender
    : _signature.recoverAddress(
      abi.encodePacked(
        address(this),
        msg.sig,
        _account,
        _nonce,
        _device,
        _limit,
        _refundGasBase,
        tx.gasprice
      )
    );

    _setAccountVirtualDeviceLimit(
      _sender,
      _account,
      _nonce,
      _device,
      _limit
    );

    _refundGas(_account, _refundStartGas, _refundGasBase);
  }

  function removeAccountVirtualDevice(
    address _account,
    uint256 _nonce,
    address _device,
    uint256 _refundGasBase,
    bytes memory _signature
  ) public {
    uint _refundStartGas = gasleft();

    address _sender = _refundGasBase == 0 && _signature.length == 0
    ? msg.sender
    : _signature.recoverAddress(
      abi.encodePacked(
        address(this),
        msg.sig,
        _account,
        _nonce,
        _device,
        _refundGasBase,
        tx.gasprice
      )
    );

    _removeAccountVirtualDevice(
      _sender,
      _account,
      _nonce,
      _device
    );

    _refundGas(_account, _refundStartGas, _refundGasBase);
  }

  function executeTransaction(
    address _account,
    uint256 _nonce,
    address payable _to,
    uint256 _value,
    bytes memory _data,
    uint256 _refundGasBase,
    bytes memory _signature
  ) public {
    uint _refundStartGas = gasleft();

    address _sender = _refundGasBase == 0 && _signature.length == 0
    ? msg.sender
    : _signature.recoverAddress(
      abi.encodePacked(
        address(this),
        msg.sig,
        _account,
        _nonce,
        _to,
        _value,
        _data,
        _refundGasBase,
        tx.gasprice
      )
    );

    _executeTransaction(
      _sender,
      _account,
      _nonce,
      _to,
      _value,
      _data
    );

    _refundGas(_account, _refundStartGas, _refundGasBase);
  }

  function _addAccountDevice(
    address _sender,
    address _account,
    uint256 _nonce,
    address _device,
    AbstractAccount.AccessType _accessType
  ) public verifyAccount(_account, _nonce) onlyAccountOwner(_account, _sender) {
    AbstractAccount(_account).addDevice(_device, _accessType);
  }

  function _removeAccountDevice(
    address _sender,
    address _account,
    uint256 _nonce,
    address _device
  ) public verifyAccount(_account, _nonce) onlyAccountOwner(_account, _sender) {
    AbstractAccount(_account).removeDevice(_device);
  }

  function _addAccountVirtualDevice(
    address _sender,
    address _account,
    uint256 _nonce,
    address _device,
    address _purpose,
    uint256 _limit,
    bool _unlimited
  ) public verifyAccount(_account, _nonce) onlyAccountOwner(_account, _sender) {
    require(
      !accountVirtualDeviceExists(_account, _device),
      "device already exists"
    );
    require(
      _verifyPurpose(_account, _purpose),
      "invalid purpose"
    );
    require(
      _verifyLimit(_limit, _unlimited),
      "invalid limit"
    );

    AbstractAccount(_account).addDevice(_device, AbstractAccount.AccessType.DELEGATE);

    accounts[_account].virtualDevices[_device].purpose = _purpose;
    accounts[_account].virtualDevices[_device].limit = _limit;
    accounts[_account].virtualDevices[_device].unlimited = _unlimited;

    emit AccountVirtualDeviceAdded(_account, _device, _purpose, _limit, _unlimited);
  }

  function _setAccountVirtualDeviceLimit(
    address _sender,
    address _account,
    uint256 _nonce,
    address _device,
    uint256 _limit
  ) public verifyAccount(_account, _nonce) onlyAccountOwner(_account, _sender) {
    require(
      accountVirtualDeviceExists(_account, _device),
      "device doesn't exists"
    );
    require(
      !accounts[_account].virtualDevices[_device].unlimited,
      "device already unlimited"
    );

    accounts[_account].virtualDevices[_device].limit = _limit;

    emit AccountVirtualDeviceLimitUpdated(_account, _device, _limit);
  }

  function _removeAccountVirtualDevice(
    address _sender,
    address _account,
    uint256 _nonce,
    address _device
  ) public verifyAccount(_account, _nonce) onlyAccountOwner(_account, _sender) {
    require(
      accountVirtualDeviceExists(_account, _device),
      "device doesn't exists"
    );

    AbstractAccount(_account).removeDevice(_device);

    delete accounts[_account].virtualDevices[_device];

    emit AccountVirtualDeviceRemoved(_account, _device);
  }

  function _executeTransaction(
    address _sender,
    address _account,
    uint256 _nonce,
    address payable _to,
    uint256 _value,
    bytes memory _data
  ) public verifyAccount(_account, _nonce) {
    AbstractAccount.AccessType _accessType = AbstractAccount(_account).getDeviceAccessType(_sender);
    require(
      _accessType != AbstractAccount.AccessType.NONE,
      "invalid sender access type"
    );

    if (_accessType != AbstractAccount.AccessType.OWNER) {
      AccountVirtualDevice memory _virtualDevice = accounts[_account].virtualDevices[_sender];

      require(
        (
        _virtualDevice.purpose != address(0) &&
        _virtualDevice.purpose == _to
        ),
        "invalid sender purpose"
      );

      if (!_virtualDevice.unlimited) {
        require(
          _virtualDevice.limit >= (_value == 0 ? 1 : _value),
          "invalid sender limit"
        );

        if (_value > 0) {
          _virtualDevice.limit -= _value;

          emit AccountVirtualDeviceLimitUpdated(_account, _sender, _virtualDevice.limit);
        }
      }
    }

    AbstractAccount(_account).executeTransaction(_to, _value, _data);
  }

  function _verifyPurpose(
    address _account,
    address _purpose
  ) internal view returns (bool) {
    return (
    _purpose != address(0) &&
    _purpose != _account &&
    _purpose != address(this)
    );
  }

  function _verifyLimit(
    uint256 _limit,
    bool _unlimited
  ) internal pure returns (bool) {
    return (
    (_unlimited && _limit == 0) ||
    (!_unlimited && _limit > 0)
    );
  }

  function _refundGas(address _account, uint _startGas, uint256 _gasBase) internal {
    if (_gasBase > 0) {
      uint256 _gasTotal = _gasBase + _startGas - gasleft();

      AbstractAccount(_account).executeTransaction(
        msg.sender,
        _gasTotal * tx.gasprice,
        new bytes(0)
      );
    }
  }
}
