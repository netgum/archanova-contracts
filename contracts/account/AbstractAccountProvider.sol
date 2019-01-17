pragma solidity >= 0.5.0 < 0.6.0;

import "@netgum/solidity/contracts/ens/AbstractENSResolver.sol";


/**
 * @title Abstract Account Provider
 */
contract AbstractAccountProvider is AbstractENSResolver {

  event AccountCreated(address account);
  event EnsRootNodeAdded(bytes32 node);
  event EnsRootNodeRemoved(bytes32 node);

  function addEnsRootNode(bytes32 _ensRootNode) public;

  function removeEnsRootNode(bytes32 _ensRootNode) public;

  function createAccount(
    bytes32 _salt,
    uint256 _refundAmount,
    bytes memory _deviceSignature,
    bytes memory _guardianSignature
  ) public;

  function createAccountWithEnsLabel(
    bytes32 _salt,
    uint256 _refundAmount,
    bytes32 _ensLabel,
    bytes32 _ensRootNode,
    bytes memory _deviceSignature,
    bytes memory _guardianSignature
  ) public;
}
