pragma solidity ^0.5.0;

import "./AbstractContractCreator.sol";

/**
 * @title Contract Creator Example
 */
contract ContractCreatorExample is AbstractContractCreator {

  constructor(bytes memory _contractCode) public {
    contractCode = _contractCode;
  }

  function createContract(bytes32 _salt) public {
    _createContract(_salt);
  }
}
