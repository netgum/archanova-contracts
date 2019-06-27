pragma solidity ^0.5.8;

import "@ensdomains/ens/contracts/ENS.sol";
import "./AbstractENSAddrResolver.sol";


/**
 * @title ENS Multi Manager
 */
contract ENSMultiManager is AbstractENSAddrResolver {

  event EnsRootNodeAdded(bytes32 rootNode, address owner);
  event EnsRootNodeVerified(bytes32 rootNode);
  event EnsRootNodeReleased(bytes32 rootNode);

  struct EnsRootNode {
    address owner;
    bool verified;
  }

  string constant ERR_ONLY_NODE_OWNER = "Sender is not ENS node owner";
  string constant ERR_LABEL_ALREADY_TAKEN = "ENS label already taken";
  string constant ERR_ROOT_NODE_NOT_VERIFIED = "ENS root node not verified";
  string constant ERR_ROOT_NODE_DOESNT_EXIST = "ENS root node doesn't exist";

  mapping(bytes32 => EnsRootNode) public ensRootNodes;
  mapping(bytes32 => address) private ensNodeAddresses;

  ENS private ens;

  constructor(address _ens) internal {
    ens = ENS(_ens);
  }

  function addr(bytes32 _node) public view returns (address) {
    return ensNodeAddresses[_node];
  }

  function setAddr(bytes32 _node, address _addr) public {
    require(
      ensNodeAddresses[_node] == msg.sender,
      ERR_ONLY_NODE_OWNER
    );

    ensNodeAddresses[_node] = _addr;

    emit AddrChanged(_node, _addr);
  }

  function addEnsRootNode(bytes32 _rootNode) public {
    require(
      ens.owner(_rootNode) == msg.sender,
      ERR_ONLY_NODE_OWNER
    );

    ensRootNodes[_rootNode].owner = msg.sender;

    emit EnsRootNodeAdded(_rootNode, msg.sender);
  }

  function verifyEnsRootNode(bytes32 _rootNode) public {
    require(
      ens.owner(_rootNode) == address(this),
      ERR_ROOT_NODE_NOT_VERIFIED
    );

    ensRootNodes[_rootNode].verified = true;

    emit EnsRootNodeVerified(_rootNode);
  }

  function releaseEnsRootNode(bytes32 _rootNode) public {
    require(
      ensRootNodes[_rootNode].owner == msg.sender,
      ERR_ONLY_NODE_OWNER
    );

    if (ensRootNodes[_rootNode].verified) {
      ens.setOwner(_rootNode, msg.sender);
    }

    delete ensRootNodes[_rootNode];

    emit EnsRootNodeReleased(_rootNode);
  }

  function _register(bytes32 _label, bytes32 _rootNode, address _addr) internal {
    require(
      ensRootNodes[_rootNode].owner != address(0),
      ERR_ROOT_NODE_DOESNT_EXIST
    );
    require(
      ensRootNodes[_rootNode].verified,
      ERR_ROOT_NODE_NOT_VERIFIED
    );

    bytes32 _node = keccak256(abi.encodePacked(_rootNode, _label));

    require(
      ensNodeAddresses[_node] == address(0),
      ERR_LABEL_ALREADY_TAKEN
    );

    ensNodeAddresses[_node] = _addr;

    ens.setSubnodeOwner(_rootNode, _label, address(this));
    ens.setResolver(_node, address(this));
    ens.setOwner(_node, _addr);
  }
}
