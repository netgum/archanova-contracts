pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "./AbstractAccount.sol";


/**
 * @title Account Library
 */
library AccountLibrary {

  using ECDSA for bytes32;

  function verifyDeviceSignature(
    AbstractAccount _account,
    bytes memory _signature,
    bytes memory _message,
    bool _strict
  ) public view returns (address _device) {
    _device = keccak256(_message).toEthSignedMessageHash().recover(_signature);

    require(
      _device != address(0),
      "invalid signature"
    );

    require(
      _account.deviceExists(_device) ||
      (
      !_strict &&
      _account.deviceExisted(_device)
      ),
      "invalid signer"
    );
  }
}
