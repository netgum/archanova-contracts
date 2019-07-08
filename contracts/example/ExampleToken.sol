pragma solidity ^0.5.10;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";


/**
 * @title Example Token
 */
contract ExampleToken is ERC20Detailed("ExampleToken", "ETK", 0), ERC20 {

  constructor() public {
    //
  }

  function mint(uint256 amount) public returns (bool) {
    _mint(msg.sender, amount);
    return true;
  }
}
