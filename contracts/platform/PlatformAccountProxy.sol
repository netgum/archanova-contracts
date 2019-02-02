pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../account/AbstractAccount.sol";
import "./AbstractPlatformAccountProxy.sol";


/**
 * @title Platform Account Proxy
 */
contract PlatformAccountProxy is AbstractPlatformAccountProxy {

  using ECDSA for bytes32;
  using SafeMath for uint256;

  struct AccountVirtualDevice {
    address purpose;
    uint256 limit;
    bool unlimited;
  }

  struct Account {
    uint256 nonce;
    mapping(address => AccountVirtualDevice) virtualDevices;
  }

  mapping(address => Account) accounts;

  modifier verifyAccountNonce(address _account, uint256 _nonce) {
    require(
      getAccountNonce(_account) == _nonce,
      "invalid account nonce"
    );

    accounts[_account].nonce = accounts[_account].nonce.add(1);

    _;
  }

  modifier onlyAccountOwner(address _account, address _device) {
    require(
      AbstractAccount(_account).getDeviceAccessType(_device) == AbstractAccount.AccessTypes.OWNER,
      "device is not an account owner"
    );
    _;
  }

  function getAccountNonce(address _account) public view returns (uint256) {
    return accounts[_account].nonce;
  }

  function getAccountVirtualDevice(
    address _account,
    address _device
  ) public view returns (address _purpose, uint256 _limit, bool _unlimited) {

    _purpose = accounts[_account].virtualDevices[_device].purpose;
    _limit = accounts[_account].virtualDevices[_device].limit;
    _unlimited = accounts[_account].virtualDevices[_device].unlimited;
  }

  function accountVirtualDeviceExists(address _account, address _device) public view returns (bool) {
    return accounts[_account].virtualDevices[_device].purpose != address(0);
  }

  function addAccountDevice(
    address _account,
    uint256 _nonce,
    address _device,
    AbstractAccount.AccessTypes _accessType,
    uint256 _fixedGas,
    bytes memory _signature
  ) public {

    uint _refundStartGas = gasleft();

    address _sender = keccak256(
      abi.encodePacked(
        address(this),
        msg.sig,
        _account,
        _nonce,
        _device,
        _accessType,
        _fixedGas,
        tx.gasprice
      )
    ).toEthSignedMessageHash().recover(_signature);

    _addAccountDevice(
      _sender,
      _account,
      _nonce,
      _device,
      _accessType
    );

    _refundGas(_account, _refundStartGas, _fixedGas);
  }

  function removeAccountDevice(
    address _account,
    uint256 _nonce,
    address _device,
    uint256 _fixedGas,
    bytes memory _signature
  ) public {

    uint _refundStartGas = gasleft();

    address _sender = keccak256(
      abi.encodePacked(
        address(this),
        msg.sig,
        _account,
        _nonce,
        _device,
        _fixedGas,
        tx.gasprice
      )
    ).toEthSignedMessageHash().recover(_signature);

    _removeAccountDevice(
      _sender,
      _account,
      _nonce,
      _device
    );

    _refundGas(_account, _refundStartGas, _fixedGas);
  }

  function addAccountVirtualDevice(
    address _account,
    uint256 _nonce,
    address _device,
    address _purpose,
    uint256 _limit,
    bool _unlimited,
    uint256 _fixedGas,
    bytes memory _signature
  ) public {

    uint _refundStartGas = gasleft();

    address _sender = _fixedGas == 0 && _signature.length == 0
    ? msg.sender
    : keccak256(
      abi.encodePacked(
        address(this),
        msg.sig,
        _account,
        _nonce,
        _device,
        _purpose,
        _limit,
        _unlimited,
        _fixedGas,
        tx.gasprice
      )
    ).toEthSignedMessageHash().recover(_signature);


    _addAccountVirtualDevice(
      _sender,
      _account,
      _nonce,
      _device,
      _purpose,
      _limit,
      _unlimited
    );

    _refundGas(_account, _refundStartGas, _fixedGas);
  }

  function setAccountVirtualDeviceLimit(
    address _account,
    uint256 _nonce,
    address _device,
    uint256 _limit,
    uint256 _fixedGas,
    bytes memory _signature
  ) public {

    uint _refundStartGas = gasleft();

    address _sender = _fixedGas == 0 && _signature.length == 0
    ? msg.sender
    : keccak256(
      abi.encodePacked(
        address(this),
        msg.sig,
        _account,
        _nonce,
        _device,
        _limit,
        _fixedGas,
        tx.gasprice
      )
    ).toEthSignedMessageHash().recover(_signature);

    _setAccountVirtualDeviceLimit(
      _sender,
      _account,
      _nonce,
      _device,
      _limit
    );

    _refundGas(_account, _refundStartGas, _fixedGas);
  }

  function removeAccountVirtualDevice(
    address _account,
    uint256 _nonce,
    address _device,
    uint256 _fixedGas,
    bytes memory _signature
  ) public {

    uint _refundStartGas = gasleft();

    address _sender = _fixedGas == 0 && _signature.length == 0
    ? msg.sender
    : keccak256(
      abi.encodePacked(
        address(this),
        msg.sig,
        _account,
        _nonce,
        _device,
        _fixedGas,
        tx.gasprice
      )
    ).toEthSignedMessageHash().recover(_signature);

    _removeAccountVirtualDevice(
      _sender,
      _account,
      _nonce,
      _device
    );

    _refundGas(_account, _refundStartGas, _fixedGas);
  }

  function executeTransaction(
    address _account,
    uint256 _nonce,
    address payable _to,
    uint256 _value,
    bytes memory _data,
    uint256 _fixedGas,
    bytes memory _signature
  ) public {

    uint _refundStartGas = gasleft();

    address _sender = _fixedGas == 0 && _signature.length == 0
    ? msg.sender
    : keccak256(
      abi.encodePacked(
        address(this),
        msg.sig,
        _account,
        _nonce,
        _to,
        _value,
        _data,
        _fixedGas,
        tx.gasprice
      )
    ).toEthSignedMessageHash().recover(_signature);


    _executeTransaction(
      _sender,
      _account,
      _nonce,
      _to,
      _value,
      _data
    );

    _refundGas(_account, _refundStartGas, _fixedGas);
  }

  function _addAccountDevice(
    address _sender,
    address _account,
    uint256 _nonce,
    address _device,
    AbstractAccount.AccessTypes _accessType
  ) internal verifyAccountNonce(_account, _nonce) onlyAccountOwner(_account, _sender) {

    AbstractAccount(_account).addDevice(_device, _accessType);
  }

  function _removeAccountDevice(
    address _sender,
    address _account,
    uint256 _nonce,
    address _device
  ) internal verifyAccountNonce(_account, _nonce) onlyAccountOwner(_account, _sender) {

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
  ) internal verifyAccountNonce(_account, _nonce) onlyAccountOwner(_account, _sender) {

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

    AbstractAccount(_account).addDevice(_device, AbstractAccount.AccessTypes.DELEGATE);

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
  ) internal verifyAccountNonce(_account, _nonce) onlyAccountOwner(_account, _sender) {

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
  ) internal verifyAccountNonce(_account, _nonce) onlyAccountOwner(_account, _sender) {

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
  ) internal verifyAccountNonce(_account, _nonce) {

    AbstractAccount.AccessTypes _accessType = AbstractAccount(_account).getDeviceAccessType(_sender);
    require(
      _accessType != AbstractAccount.AccessTypes.NONE,
      "invalid sender access type"
    );

    if (_accessType != AbstractAccount.AccessTypes.OWNER) {
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
          _virtualDevice.limit = _virtualDevice.limit.sub(_value);

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

  function _refundGas(address _account, uint _startGas, uint256 _fixedGas) internal {
    if (_fixedGas > 0) {
      uint256 _gasTotal = _fixedGas.add(_startGas).sub(gasleft());

      AbstractAccount(_account).executeTransaction(
        msg.sender,
        _gasTotal.mul(tx.gasprice),
        new bytes(0)
      );
    }
  }
}
