pragma solidity >= 0.5.0 < 0.6.0;


/**
 * @title State Token
 */
contract StateToken {

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

  function burn(address payable _recipient) public onlyCreator {
    selfdestruct(_recipient);
  }
}
