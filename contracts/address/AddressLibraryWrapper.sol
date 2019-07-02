pragma solidity ^0.5.10;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "./AddressLibrary.sol";


/**
 * @title Address Library Wrapper
 */
contract AddressLibraryWrapper {

  using AddressLibrary for address;
  using ECDSA for bytes32;

  constructor() public {
    //
  }

  function verifySignature(
    address _address,
    bytes32 _messageHash,
    bytes memory _signature,
    bool _strict
  ) public view returns (bool) {
    return _address.verifySignature(
      _messageHash.toEthSignedMessageHash(),
      _signature,
      _strict
    );
  }
}
