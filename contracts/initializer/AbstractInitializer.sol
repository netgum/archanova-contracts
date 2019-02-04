pragma solidity ^0.5.0;

/**
 * @title Abstract Initializer
 */
contract AbstractInitializer {

  address internal initializer;

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
