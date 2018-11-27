pragma solidity >= 0.5.0 < 0.6.0;

import "@netgum/solidity/contracts/sharedAccount/SharedAccount.sol";
import "./AbstractAccount.sol";


/**
 * @title Account
 */
contract Account is AbstractAccount, SharedAccount {

  bool public initialized;

  constructor() public {
    //
  }

  function initialize(address[] memory _devices) public {
    require(
      !initialized,
      "account already initialized"
    );

    address _purpose = address(this);

    for (uint i = 0; i < _devices.length; i++) {
      devices[_devices[i]].exists = true;
      devices[_devices[i]].purposes[_purpose].exists = true;
      devices[_devices[i]].purposes[_purpose].unlimited = true;
    }

    initialized = true;
  }
}
