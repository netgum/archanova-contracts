pragma solidity ^0.5.0;

import "./ContractCreator.sol";

/**
 * @title Contract Creator Example
 */
contract ContractCreatorExample is ContractCreator {

  event ContractCreated(address contractAddress);

  constructor(bytes memory _contractCode) ContractCreator(_contractCode) public {
    //
  }

  function createContract(bytes32 _salt) public {
    address _contractAddress = _createContract(_salt);

    emit ContractCreated(_contractAddress);
  }

  function computeContractAddress(bytes32 _salt) public view returns(address) {
    return _computeContractAddress(_salt);
  }
}
