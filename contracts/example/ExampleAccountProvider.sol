pragma solidity >= 0.5.0 < 0.6.0;

import "../account/Account.sol";
import "../hub/AbstractHub.sol";


/**
 * @title Example Account Provider
 */
contract ExampleAccountProvider {

  event AccountCreated(address account, address[] devices);

  AbstractHub private hub;

  Account private guardian;

  bytes private contractCode;

  modifier onlyGuardian() {
    require(
      guardian.deviceExists(msg.sender),
      "msg.sender is not a guardian device"
    );
    _;
  }

  constructor(AbstractHub _hub, Account _guardian, bytes memory _contractCode) public {
    hub = _hub;
    guardian = _guardian;
    contractCode = _contractCode;
  }

  function createAccount(uint256 _salt, address _device) public onlyGuardian {
    bytes memory _contractCode = contractCode;

    address payable _account;

    assembly {
      _account := create2(0, add(_contractCode, 0x20), mload(_contractCode), _salt)
      if iszero(extcodesize(_account)) {revert(0, 0)}
    }

    address[] memory _devices = new address[](1);
    _devices[0] = _device;

    Account(_account).initialize(_devices);

    hub.registerAccount(_account);

    emit AccountCreated(_account, _devices);
  }
}
