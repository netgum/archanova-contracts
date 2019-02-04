pragma solidity ^0.5.0;

/**
 * @title Abstract Contract Creator
 */
contract AbstractContractCreator {

  bytes internal contractCode;

  constructor() internal {
    //
  }

  function _createContract(bytes32 _salt) internal returns (address _contract) {
    bytes memory _contractCode = contractCode;

    assembly {
      _contract := create2(0, add(_contractCode, 0x20), mload(_contractCode), _salt)
      if iszero(extcodesize(_contract)) {revert(0, 0)}
    }
  }
}
