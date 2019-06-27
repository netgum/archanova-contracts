pragma solidity ^0.5.8;

/**
 * @title Contract Creator
 */
contract ContractCreator {

  bytes private contractCode;
  bytes32 private contractCodeHash;

  constructor(bytes memory _contractCode) internal {
    contractCode = _contractCode;
    contractCodeHash = keccak256(_contractCode);
  }

  function _createContract(bytes32 _salt) internal returns (address _contract) {
    bytes memory _contractCode = contractCode;

    assembly {
      let p := add(_contractCode, 0x20)
      let n := mload(_contractCode)
      _contract := create2(0, p, n, _salt)
      if iszero(extcodesize(_contract)) {revert(0, 0)}
    }
  }

  function _computeContractAddress(bytes32 _salt) internal view returns (address _contractAddress) {
    bytes32 _data = keccak256(
      abi.encodePacked(
        bytes1(0xff),
        address(this),
        _salt,
        contractCodeHash
      )
    );

    _contractAddress = address(bytes20(_data << 96));
  }
}
