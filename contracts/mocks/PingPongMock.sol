pragma solidity ^0.5.0;

/**
 * @title Ping Pong Mock
 */
contract PingPongMock {

  function ping() public pure returns (string memory) {
    return "pong";
  }
}
