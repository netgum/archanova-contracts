pragma solidity ^0.5.0;

import "./AbstractInitializer.sol";


/**
 * @title Initializer
 */
contract Initializer is AbstractInitializer {

  address private initializer;

  modifier onlyInitializer() {
    require(
      initializer == msg.sender,
      "msg.sender is not a initializer"
    );

    initializer = address(0);

    _;
  }

  constructor() public {
    initializer = msg.sender;
  }

  function initialized() view public returns (bool) {
    return initializer == address(0);
  }
}
