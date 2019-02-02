pragma solidity ^0.5.0;

import "./AccountLibrary.sol";
import "./AbstractAccount.sol";


/**
 * @title Account Library Example
 */
contract AccountLibraryExample {

  using AccountLibrary for AbstractAccount;

  AbstractAccount account;

  constructor(address _account) public {
    account = AbstractAccount(_account);
  }

  function verifyDeviceSignature(bytes memory _signature, bytes memory _message, bool _strict) public view returns (address _device) {
    _device = account.verifyDeviceSignature(
      _signature,
      _message,
      _strict
    );
  }
}
