pragma solidity >= 0.5.0 < 0.6.0;

import "./AbstractStateToken.sol";

/**
 * @title State Token
 */
contract StateToken is AbstractStateToken {

  address payable private creator;

  constructor() public {
    creator = msg.sender;
  }

  modifier onlyCreator() {
    require(
      msg.sender == creator,
      "msg.sender is not a creator"
    );

    _;
  }

  function selfDestruct(address payable _recipient) public onlyCreator {
    selfdestruct(_recipient);
  }
}
