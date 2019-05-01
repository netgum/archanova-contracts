pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../contractCreator/ContractCreator.sol";
import "../ens/ENSMultiManager.sol";
import "../guardian/Guarded.sol";
import "./AbstractAccount.sol";


/**
 * @title Account Provider
 */
contract AccountProvider is ContractCreator, ENSMultiManager, Guarded {

  using ECDSA for bytes32;
  using SafeMath for uint256;

  event AccountCreated(address account);

  bytes1 constant ACCOUNT_SALT_MSG_PREFIX = 0x01;
  bytes1 constant ACCOUNT_SALT_MSG_PREFIX_UNSAFE = 0x02;

  address private accountProxy;

  constructor(
    address _guardian,
    bytes memory _accountContractCode,
    address _accountProxy,
    address _ens
  ) ContractCreator(_accountContractCode) ENSMultiManager(_ens) Guarded(_guardian) public {
    accountProxy = _accountProxy;
  }

  function createAccount(
    bytes32 _ensLabel,
    bytes32 _ensNode,
    uint256 _refundGas,
    bytes memory _signature
  ) onlyGuardian public {
    address _device = keccak256(
      abi.encodePacked(
        address(this),
        msg.sig,
        _ensLabel,
        _ensNode,
        _refundGas,
        tx.gasprice
      )
    ).toEthSignedMessageHash().recover(_signature);

    bytes32 _salt = keccak256(abi.encodePacked(
        ACCOUNT_SALT_MSG_PREFIX,
        keccak256(abi.encodePacked(_device))
      ));

    _createAccount(
      _salt,
      _device,
      _ensLabel,
      _ensNode,
      _refundGas
    );
  }

  function unsafeCreateAccount(
    uint256 _accountId,
    address _device,
    bytes32 _ensLabel,
    bytes32 _ensNode,
    uint256 _refundGas
  ) onlyGuardian public {
    bytes32 _salt = keccak256(
      abi.encodePacked(
        ACCOUNT_SALT_MSG_PREFIX_UNSAFE,
        _accountId
      )
    );

    _createAccount(
      _salt,
      _device,
      _ensLabel,
      _ensNode,
      _refundGas
    );
  }

  function _createAccount(
    bytes32 _salt,
    address _device,
    bytes32 _ensLabel,
    bytes32 _ensNode,
    uint256 _refundGas
  ) private {
    // initialize account
    AbstractAccount _account = AbstractAccount(_createContract(_salt));

    if (_refundGas > 0) {
      _account.executeTransaction(
        msg.sender,
        _refundGas.mul(tx.gasprice),
        new bytes(0)
      );
    }

    _account.addDevice(_device, true);
    _account.addDevice(accountProxy, true);
    _account.removeDevice(address(this));

    _register(
      _ensLabel,
      _ensNode,
      address(_account)
    );

    emit AccountCreated(address(_account));
  }
}
