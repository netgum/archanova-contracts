pragma solidity ^0.5.2;

import "@ensdomains/ens/contracts/ENS.sol";


/**
 * @title ENS Ownable
 */
contract ENSOwnable {

  string constant ERR_ONLY_ENS_NODE_OWNER = "Sender is not ENS node owner";

  ENS internal ens;

  modifier onlyENSNodeOwner(bytes32 _node) {
    require(
      ens.owner(_node) == msg.sender,
      ERR_ONLY_ENS_NODE_OWNER
    );

    _;
  }

  constructor(address _ens) internal {
    ens = ENS(_ens);
  }
}
