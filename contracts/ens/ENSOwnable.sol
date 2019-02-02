pragma solidity ^0.5.0;

import "@ensdomains/ens/contracts/ENS.sol";


/**
 * @title ENS Ownable
 */
contract ENSOwnable {

  ENS internal ens;

  modifier onlyENSNodeOwner(bytes32 _node) {
    require(
      ens.owner(_node) == msg.sender,
      "msg.sender is not ENS node owner"
    );
    _;
  }
}
