pragma solidity >= 0.5.0 < 0.6.0;

import "@netgum/solidity/contracts/common/BytesSignatureLibrary.sol";
import "@netgum/solidity/contracts/sharedAccount/SharedAccountLibrary.sol";
import "@netgum/solidity/contracts/stateToken/AbstractStateToken.sol";
import "@netgum/solidity/contracts/stateToken/StateToken.sol";
import "../account/AbstractAccount.sol";
import "../registry/AbstractRegistry.sol";


/**
 * @title State Token Basic Service
 */
contract StateTokenBasicService {

  using BytesSignatureLibrary for bytes;
  using SharedAccountLibrary for AbstractAccount;

  AbstractRegistry private registry;

  AbstractAccount private guardian;

  bytes private contractCode;

  constructor(
    AbstractRegistry _registry,
    AbstractAccount _guardian,
    bytes memory _contractCode
  ) public {
    registry = _registry;
    guardian = _guardian;
    contractCode = _contractCode;
  }

  function burnToken(
    uint256 _id,
    AbstractAccount _founder,
    bytes32 _stateHash,
    bytes memory _founderSignature,
    bytes memory _guardianSignature
  ) public {

    _founder.verifyDeviceSignature(
      _founderSignature,
      abi.encodePacked(
        address(this),
        _id,
        address(_founder),
        _stateHash,
        msg.sender
      ),
      false
    );

    guardian.verifyDeviceSignature(
      _guardianSignature,
      _founderSignature,
      false
    );

    address _token;
    bytes32 _salt = keccak256(abi.encodePacked(_id, address(_founder)));
    bytes memory _contractCode = contractCode;

    assembly {
      _token := create2(0, add(_contractCode, 0x20), mload(_contractCode), _salt)
      if iszero(extcodesize(_token)) {revert(0, 0)}
    }

    AbstractStateToken(_token).burn(msg.sender);
  }
}
