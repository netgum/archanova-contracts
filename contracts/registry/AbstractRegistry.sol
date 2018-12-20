pragma solidity >= 0.5.0 < 0.6.0;


/**
 * @title Abstract Registry
 */
contract AbstractRegistry {

  event AccountDeployed(address sender, address account);
  event ServiceDeployed(address sender, address service);
  event ServiceEnabled(address sender, address service);
  event ServiceDisabled(address sender, address service);

  function accountExists(address _account) public view returns (bool);

  function serviceExists(address _service) public view returns (bool);

  function serviceEnabled(address _service) public view returns (bool);

  function serviceDisabled(address _service) public view returns (bool);

  function deployAccount(bytes32 _salt, address[] memory _devices) public returns (address payable);

  function deployService(bytes32 _salt, bytes memory _code, bool _canRegisterAccounts) public returns (address payable);

  function enableService(address _service) public;

  function disableService(address _service) public;
}
