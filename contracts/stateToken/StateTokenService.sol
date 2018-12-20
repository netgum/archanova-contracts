pragma solidity >= 0.5.0 < 0.6.0;

import "../account/AbstractAccount.sol";
import "../account/AccountLibrary.sol";
import "../registry/AbstractRegistryService.sol";
import "./AbstractStateToken.sol";
import "./AbstractStateTokenService.sol";


/**
 * @title State Token Service
 */
contract StateTokenService is AbstractRegistryService, AbstractStateTokenService {

  using AccountLibrary for AbstractAccount;

  AbstractAccount private guardian;

  uint private tokenReleaseTime;

  mapping(bytes32 => uint) private tokensReleaseDueTime;

  bytes private tokenContractCode;

  function initialize(
    address _guardian,
    uint _tokenReleaseTime,
    bytes memory _tokenContractCode
  ) onlyInitializer() public {

    guardian = AbstractAccount(_guardian);
    tokenReleaseTime = _tokenReleaseTime;
    tokenContractCode = _tokenContractCode;
  }

  function releaseToken(uint256 _tokenId) public {
    bytes32 _tokenHash = keccak256(abi.encodePacked(msg.sender, _tokenId));

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

  function useToken(
    address _tokenFounder,
    uint256 _tokenId,
    bytes32 _stateHash,
    bytes memory _stateSignature,
    bytes memory _guardianSignature
  ) public {
    AbstractAccount(_tokenFounder).verifyDeviceSignature(
      _stateSignature,
      abi.encodePacked(
        address(this),
        msg.sig,
        _tokenFounder,
        _tokenId,
        _stateHash,
        msg.sender
      ),
      false
    );

    guardian.verifyDeviceSignature(
      _guardianSignature,
      _stateSignature,
      false
    );

    bytes32 _tokenHash = keccak256(abi.encodePacked(_tokenFounder, _tokenId));


    if (tokensReleaseDueTime[_tokenHash] != 0) {
      delete tokensReleaseDueTime[_tokenHash];
      emit TokenReleaseRejected(_tokenHash);
    }

    _burnToken(_tokenHash);

    emit TokenUsed(_tokenHash, msg.sender);
  }

  function _burnToken(bytes32 _tokenHash) internal {
    address _token;
    bytes memory _tokenContractCode = tokenContractCode;

    assembly {
      _token := create2(0, add(_tokenContractCode, 0x20), mload(_tokenContractCode), _tokenHash)
      if iszero(extcodesize(_token)) {revert(0, 0)}
    }

    AbstractStateToken(_token).burn(msg.sender);
  }
}
