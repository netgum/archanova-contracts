pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";


/**
 * @title Example Token
 */
contract ExampleToken is ERC20 {

  function mint(uint256 amount) public returns (bool) {
    _mint(msg.sender, amount);
    return true;
  }
}
