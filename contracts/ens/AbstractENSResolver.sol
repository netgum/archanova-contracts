pragma solidity ^0.5.0;


/**
 * @title Abstract ENS Resolver
 */
contract AbstractENSResolver {

  event AddrChanged(bytes32 indexed node, address addr);

  function supportsInterface(bytes4 _id) public pure returns (bool);

  function addr(bytes32 _node) public view returns (address);

  function setAddr(bytes32 _node, address _addr) public;
}
