pragma solidity >= 0.5.0 < 0.6.0;

import "@netgum/solidity/contracts/ens/AbstractENSResolver.sol";


/**
 * @title Abstract Account Provider
 */
contract AbstractAccountProvider is AbstractENSResolver {

  event AccountCreated(address account);

  function createAccount(
    bytes32 _salt,
    bytes memory _deviceSignature,
    bytes memory _guardianSignature
  ) public;

  function createAccountWithEnsLabel(
    bytes32 _salt,
    bytes32 _ensLabel,
    bytes memory _deviceSignature,
    bytes memory _guardianSignature
  ) public;
}
