pragma solidity >= 0.5.0 < 0.6.0;

import "../account/AbstractAccount.sol";
import "../account/AccountLibrary.sol";
import "../registry/AbstractRegistry.sol";


/**
 * @title Account Basic Service
 */
contract AccountBasicService {

  using BytesSignatureLibrary for bytes;
  using AccountLibrary for AbstractAccount;

  event AccountCreated(address account, address[] devices);

  AbstractRegistry private registry;

  AbstractAccount private guardian;

  bytes private contractCode;

  constructor(
    AbstractRegistry _registry,
    AbstractAccount _guardian,
    bytes memory _contractCode
  ) public {
    registry = _registry;
    guardian = _guardian;
    contractCode = _contractCode;
  }

  function createAccount(
    bytes32 _salt,
    bytes memory _deviceSignature,
    bytes memory _guardianSignature
  ) public {

    address _device = _deviceSignature.recoverAddress(
      abi.encodePacked(
        address(this),
        _salt
      )
    );

    guardian.verifyDeviceSignature(
      _guardianSignature,
      _deviceSignature,
      true
    );

    address payable _account;

    bytes memory _contractCode = contractCode;

    assembly {
      _account := create2(0, add(_contractCode, 0x20), mload(_contractCode), _salt)
      if iszero(extcodesize(_account)) {revert(0, 0)}
    }

    address[] memory _devices = new address[](1);
    _devices[0] = _device;

    AbstractAccount(_account).initialize(_devices);

    registry.registerAccount(_account);

    emit AccountCreated(_account, _devices);
  }
}
