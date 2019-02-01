pragma solidity >= 0.5.0 < 0.6.0;

import "@netgum/solidity/contracts/ens/AbstractENSResolver.sol";
import "./AbstractPlatformAccount.sol";


/**
 * @title Abstract Platform Account Provider
 */
contract AbstractPlatformAccountProvider is AbstractENSResolver {

  function releaseENSNode() public;

  function createAccount(
    bytes32 _ensLabel,
    uint256 _refundAmount,
    bytes memory _deviceSignature,
    bytes memory _guardianSignature
  ) public;

  function createAccount(
    bytes32 _ensLabel,
    uint256 _refundAmount,
    bytes memory _deviceSignature
  ) public;

  function unsafeCreateAccount(
    uint256 _accountId,
    address _device,
    bytes32 _ensLabel,
    uint256 _refundAmount
  ) public;
}
