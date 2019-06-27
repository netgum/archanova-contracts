pragma solidity ^0.5.8;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "./AbstractAccount.sol";


/**
 * @title Account Library
 */
library AccountLibrary {

  using ECDSA for bytes32;

  function isOwnerDevice(
    AbstractAccount _account,
    address _device
  ) internal view returns (bool) {
    bool isOwner;
    (isOwner,,) = _account.devices(_device);
    return isOwner;
  }

  function isAnyDevice(
    AbstractAccount _account,
    address _device
  ) internal view returns (bool) {
    bool exists;
    (,exists,) = _account.devices(_device);
    return exists;
  }

  function isExistedDevice(
    AbstractAccount _account,
    address _device
  ) internal view returns (bool) {
    bool existed;
    (,,existed) = _account.devices(_device);
    return existed;
  }

  function verifyOwnerSignature(
    AbstractAccount _account,
    bytes32 _messageHash,
    bytes memory _signature
  ) internal view returns (bool _result) {
    address _recovered = _messageHash.recover(_signature);

    if (_recovered != address(0)) {
      _result = isOwnerDevice(_account, _recovered);
    }
  }

  function verifySignature(
    AbstractAccount _account,
    bytes32 _messageHash,
    bytes memory _signature,
    bool _strict
  ) internal view returns (bool _result) {
    address _recovered = _messageHash.recover(_signature);

    if (_recovered != address(0)) {
      if (_strict) {
        _result = isAnyDevice(_account, _recovered);
      } else {
        _result = isExistedDevice(_account, _recovered);
      }
    }
  }
}
