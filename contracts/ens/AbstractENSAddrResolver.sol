pragma solidity ^0.5.10;

/**
 * @title Abstract ENS Addr Resolver
 */
contract AbstractENSAddrResolver {

  event AddrChanged(bytes32 indexed node, address addr);

  function addr(bytes32 _node) public view returns (address);

  function setAddr(bytes32 _node, address _addr) public;
}
