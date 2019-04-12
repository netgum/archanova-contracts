pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/utils/address.sol";
import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "../account/AbstractAccount.sol";
import "../account/AccountLibrary.sol";


/**
 * @title Address Library
 */
library AddressLibrary {

  using AccountLibrary for AbstractAccount;
  using Address for address;
  using ECDSA for bytes32;

  function verifySignature(
    address _address,
    bytes32 _messageHash,
    bytes memory _signature,
    bool _strict
  ) internal view returns (bool _result) {
    if (_address.isContract()) {
      _result = AbstractAccount(_address).verifySignature(
        _messageHash,
        _signature,
        _strict
      );
    } else {
      address _recovered = _messageHash.recover(_signature);
      _result = _recovered == _address;
    }
  }
}
