pragma solidity >= 0.5.0 < 0.6.0;

import "@netgum/solidity/contracts/libraries/BytesSignatureLibrary.sol";
import "./AbstractGuardian.sol";


/**
 * @title Guardian
 */
contract Guardian is AbstractGuardian {

  using BytesSignatureLibrary for bytes;

  constructor() public {
    devicesAccessType[msg.sender] = AccessTypes.OWNER;
    devicesLog[msg.sender] = true;
  }

  function() external payable {
    //
  }

  function verifyDeviceSignature(bytes memory _signature, bytes memory _message, bool _strict) public view returns (address _device) {
    _device = _signature.recoverAddress(_message);

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
