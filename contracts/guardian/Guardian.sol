pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "../account/Account.sol";
import "./AbstractGuardian.sol";


/**
 * @title Guardian
 */
contract Guardian is AbstractGuardian, Account {

  using ECDSA for bytes32;

  constructor(address _device) Account(_device) public {}

  function verifyDeviceSignature(bytes memory _signature, bytes memory _message, bool _strict) public view returns (address _device) {
    _device = keccak256(_message).toEthSignedMessageHash().recover(_signature);

    require(
      _device != address(0),
      "invalid signature"
    );

    require(
      deviceExists(_device) ||
      (
      !_strict &&
      deviceExisted(_device)
      ),
      "invalid signer"
    );
  }
}
