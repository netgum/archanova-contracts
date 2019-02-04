pragma solidity ^0.5.0;

import "./AbstractContractCreator.sol";

/**
 * @title Contract Creator Example
 */
contract ContractCreatorExample is AbstractContractCreator {

  event ContractCreated(address contractAddress);

  constructor(bytes memory _contractCode) public {
    contractCode = _contractCode;
  }

  function createContract(bytes32 _salt) public {
    address _contractAddress = _createContract(_salt);

    emit ContractCreated(_contractAddress);
  }
}
