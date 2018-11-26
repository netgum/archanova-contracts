pragma solidity >= 0.5.0 < 0.6.0;

import "@netgum/solidity/contracts/common/BytesSignatureLibrary.sol";
import "../account/Account.sol";
import "../hub/AbstractHub.sol";
import "../stateToken/StateToken.sol";


/**
 * @title State Token Provider
 */
contract ExampleStateTokenProvider {

  using BytesSignatureLibrary for bytes;

  AbstractHub private hub;

  Account private guardian;

  bytes private contractCode;

  constructor(AbstractHub _hub, Account _guardian, bytes memory _contractCode) public {
    hub = _hub;
    guardian = _guardian;
    contractCode = _contractCode;
  }

  function burnToken(
    uint256 _uniqueId,
    Account _founderAccount,
    bytes32 _founderStateHash,
    bytes memory _founderSignature,
    bytes memory _guardianSignature
  ) public {

    bytes memory _message = abi.encodePacked(
      _uniqueId,
      address(_founderAccount),
      _founderStateHash,
      msg.sender
    );

    address _founderDevice = _founderSignature.recoverAddress(_message);

    require(
      _founderAccount.deviceExists(_founderDevice) ||
      _founderAccount.deviceExisted(_founderDevice),
      "invalid founder signature"
    );

    address _guardianDevice = _guardianSignature.recoverAddress(_founderSignature);

    require(
      guardian.deviceExists(_guardianDevice) ||
      guardian.deviceExisted(_guardianDevice),
      "invalid guardian signature"
    );


    address _token;
    bytes32 _salt = keccak256(abi.encodePacked(_uniqueId, address(_founderAccount)));
    bytes memory _contractCode = contractCode;

    assembly {
      _token := create2(0, add(_contractCode, 0x20), mload(_contractCode), _salt)
      if iszero(extcodesize(_token)) {revert(0, 0)}
    }

    StateToken(_token).burn(msg.sender);
  }
}
