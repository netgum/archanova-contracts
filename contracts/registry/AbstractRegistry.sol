pragma solidity >= 0.5.0 < 0.6.0;


/**
 * @title Abstract Registry
 */
contract AbstractRegistry {

  event AccountRegistered(address sender, address account);
  event AccountDeployed(address sender, address account);
  event ServiceRegistered(address sender, address service);
  event ServiceDeployed(address sender, address service);
  event ServiceEnabled(address sender, address service);
  event ServiceDisabled(address sender, address service);

  function accountExists(address _account) public view returns (bool);

  function serviceExists(address _service) public view returns (bool);

  function serviceEnabled(address _service) public view returns (bool);

  function serviceIsAccountProvider(address _service) public view returns (bool);

  function registerAccount(address _account) public;

  function deployAccount(bytes32 _salt, address[] memory _devices) public returns (address payable _account);

  function registerService(address _service, bool _isAccountProvider) public;

  function deployService(bytes32 _salt, bytes memory _code, bool _isAccountProvider) public returns (address payable _service);

  function enableService(address _service) public;

  function disableService(address _service) public;
}
