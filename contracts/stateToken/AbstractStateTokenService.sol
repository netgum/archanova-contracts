pragma solidity >= 0.5.0 < 0.6.0;

/**
 * @title Abstract State Token Service
 */
contract AbstractStateTokenService {

  event TokenReleaseRequested(bytes32 tokenHash, uint tokenReleaseDueTime);
  event TokenReleaseRejected(bytes32 tokenHash);
  event TokenReleased(bytes32 tokenHash);
  event TokenUsed(bytes32 tokenHash, address beneficiary);

  function releaseToken(uint256 _tokenId) public;

  function useToken(
    address _tokenFounder,
    uint256 _tokenId,
    bytes32 _stateHash,
    bytes memory _stateSignature,
    bytes memory _guardianSignature
  ) public;
}
