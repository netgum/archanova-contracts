pragma solidity ^0.5.0;

import "../stateToken/StateTokenFactory.sol";
import "./AbstractPlatformStateTokenFactory.sol";


/**
 * @title Platform State Token Factory
 */
contract PlatformStateTokenFactory is AbstractPlatformStateTokenFactory, StateTokenFactory {

  constructor(uint _tokenReleaseIn, bytes memory _contractCode) StateTokenFactory(_tokenReleaseIn, _contractCode) public {
    //
  }

  function fundToken(uint256 _tokenId) payable public {
    bytes32 _tokenHash = keccak256(abi.encodePacked(
        msg.sender,
        _tokenId
      ));

    address payable _tokenAddress = address(uint160(_computeContractAddress(_tokenHash)));

    _tokenAddress.transfer(msg.value);

    emit TokenFunded(_tokenHash, msg.value);
  }
}
