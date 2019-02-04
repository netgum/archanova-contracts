pragma solidity ^0.5.0;

import "../contractCreator/AbstractContractCreator.sol";


/**
 * @title Abstract State Token Factory
 */
contract AbstractStateTokenFactory is AbstractContractCreator {

  event TokenReleaseRequested(bytes32 tokenHash, uint tokenReleaseDueTime);

  event TokenReleaseRejected(bytes32 tokenHash);

  event TokenReleased(bytes32 tokenHash);

  event TokenBurned(bytes32 tokenHash, address beneficiaryAddress);

  function releaseToken(uint256 _tokenId) public;

  function burnToken(
    address _tokenFounder,
    uint256 _tokenId,
    bytes32 _stateHash,
    address _stateGuardian,
    bytes memory _stateSignature,
    bytes memory _stateGuardianSignature
  ) public;
}
