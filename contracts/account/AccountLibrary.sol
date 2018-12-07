pragma solidity >= 0.5.0 < 0.6.0;

import "../shared/BytesSignatureLibrary.sol";
import "./AbstractAccount.sol";


/**
 * @title Account Library
 */
library AccountLibrary {

  using BytesSignatureLibrary for bytes;

  function verifyDeviceSignature(
    AbstractAccount _account,
    bytes memory _signature,
    bytes memory _message,
    bool _strict
  ) public view returns (address _device) {
    _device = _signature.recoverAddress(_message);

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
