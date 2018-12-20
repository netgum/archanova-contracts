pragma solidity >= 0.5.0 < 0.6.0;

/**
 * @title Abstract Initializer
 */
contract AbstractInitializer {

  bool public initialized;

  address initializer;

  modifier canInitialize() {
    require(
      !initialized,
      "already initialized"
    );
    require(
      initializer == msg.sender,
      "msg.sender is not a initializer"
    );

    _;

    initialized = true;
  }

  constructor() public {
    initializer = msg.sender;
  }

  function initialize(bytes memory data) public;
}
