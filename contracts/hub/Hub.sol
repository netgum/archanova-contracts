pragma solidity >= 0.5.0 < 0.6.0;

import "../account/Account.sol";
import "./AbstractHub.sol";


/**
 * @title Hub
 */
contract Hub is AbstractHub {

  uint8 private constant PROVIDER_TYPE_ACCOUNT = 1;

  Account private guardian;

  mapping(address => uint8) private providers;

  mapping(address => bool) private accounts;

  modifier onlyGuardian() {
    require(
      guardian.deviceExists(msg.sender),
      "msg.sender is not guardian device"
    );

    _;
  }

  modifier onlyProviderWithType(uint8 _type) {
    require(
      providerExists(msg.sender, _type),
      "msg.sender is not valid provider"
    );

    _;
  }

  constructor(Account _guardian) public {
    guardian = _guardian;
  }

  function providerExists(address _provider) public view returns (bool) {
    return providers[_provider] != 0;
  }

  function providerExists(address _provider, uint8 _providerType) public view returns (bool) {
    return providers[_provider] == _providerType;
  }

  function accountExists(address _account) public view returns (bool) {
    return accounts[_account];
  }

  function registerProvider(address _provider, uint8 _providerType) public onlyGuardian {
    providers[_provider] = _providerType;

    emit ProviderRegistered(_provider, _providerType);
  }

  function registerAccount(address _account) public onlyProviderWithType(PROVIDER_TYPE_ACCOUNT) {
    accounts[_account] = true;
  }
}
