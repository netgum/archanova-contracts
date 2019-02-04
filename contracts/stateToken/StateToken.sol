pragma solidity ^0.5.0;

import "./AbstractStateToken.sol";

/**
 * @title State Token
 */
contract StateToken is AbstractStateToken {

  address payable private creator;

  constructor() public {
    creator = msg.sender;
  }

  function burn(address payable _beneficiary) public {
    require(
      msg.sender == creator,
      "msg.sender is not a creator"
    );

    selfdestruct(_beneficiary);
  }
}
