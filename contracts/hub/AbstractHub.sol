pragma solidity >= 0.5.0 < 0.6.0;


/**
 * @title Abstract Hub
 */
contract AbstractHub {

  event ProviderRegistered(address provider, uint8 providerType);

  function providerExists(address _provider) public view returns (bool);

  function providerExists(address _provider, uint8 _providerType) public view returns (bool);

  function accountExists(address _account) public view returns (bool);

  function registerProvider(address _provider, uint8 _providerType) public;

  function registerAccount(address _account) public;
}
