pragma solidity ^0.5.0;

import "../account/AbstractAccount.sol";
import "../account/AccountLibrary.sol";
import "./AbstractStateToken.sol";
import "./AbstractStateTokenFactory.sol";


/**
 * @title State Token Factory
 */
contract StateTokenFactory is AbstractStateTokenFactory {

  using AccountLibrary for AbstractAccount;

  uint private tokenReleaseTime;

  mapping(bytes32 => uint) private tokensReleaseDueTime;

  constructor(uint _tokenReleaseTime, bytes memory _contractCode) public {
    tokenReleaseTime = _tokenReleaseTime;
    contractCode = _contractCode;
  }

  function releaseToken(uint256 _tokenId) public {
    bytes32 _tokenHash = keccak256(abi.encodePacked(
        msg.sender,
        _tokenId
      ));

    if (tokensReleaseDueTime[_tokenHash] == 0) {
      tokensReleaseDueTime[_tokenHash] = now + tokenReleaseTime;

      emit TokenReleaseRequested(_tokenHash, tokensReleaseDueTime[_tokenHash]);

    } else {
      require(
        tokensReleaseDueTime[_tokenHash] >= now,
        "invalid token release due time"
      );

      delete tokensReleaseDueTime[_tokenHash];

      _burnToken(_tokenHash);

      emit TokenReleased(_tokenHash);
    }
  }

  function burnToken(
    address _tokenFounder,
    uint256 _tokenId,
    bytes32 _stateHash,
    address _stateGuardian,
    bytes memory _stateSignature,
    bytes memory _stateGuardianSignature
  ) public {

    AbstractAccount(_tokenFounder).verifyDeviceSignature(
      _stateSignature,
      abi.encodePacked(
        address(this),
        msg.sig,
        _tokenFounder,
        _tokenId,
        _stateHash,
        _stateGuardian,
        msg.sender
      ),
      false
    );

    AbstractAccount(_stateGuardian).verifyDeviceSignature(
      _stateGuardianSignature,
      _stateSignature,
      false
    );

    bytes32 _tokenHash = keccak256(abi.encodePacked(
        _tokenFounder,
        _tokenId
      ));

    if (tokensReleaseDueTime[_tokenHash] != 0) {
      delete tokensReleaseDueTime[_tokenHash];

      emit TokenReleaseRejected(_tokenHash);
    }

    _burnToken(_tokenHash);

    emit TokenBurned(_tokenHash, msg.sender);
  }

  function _burnToken(bytes32 _tokenHash) internal {
    address _tokenAddress = _createContract(_tokenHash, false);

    AbstractStateToken(_tokenAddress).burn(msg.sender);
  }
}
