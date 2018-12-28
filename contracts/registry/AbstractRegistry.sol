pragma solidity >= 0.5.0 < 0.6.0;


/**
 * @title Abstract Registry
 */
contract AbstractRegistry {

  event AccountDeployed(address sender, address account);
  event ServiceDeployed(address sender, address service);
  event ServiceEnabled(address sender, address service);
  event ServiceDisabled(address sender, address service);

  function accountDeployed(address _account) public view returns (bool);

  function serviceDeployed(address _service) public view returns (bool);

  function serviceEnabled(address _service) public view returns (bool);

  function serviceIsAccountProvider(address _service) public view returns (bool);

  function contractCodeRegistered(bytes32 _codeAlias) public view returns (bool);

  function computeContractAddress(bytes32 _codeAlias, bytes32 _salt) public view returns (address _address);

  function deployAccount(bytes32 _salt, address[] memory _devices) public returns (address payable _account);

  function deployService(bytes32 _codeAlias, bytes32 _salt, bool _isAccountProvider) public returns (address payable _service);

  function enableService(address _service) public;

  function disableService(address _service) public;

  function registerContractCode(bytes32 _alias, bytes memory _code) public;
}
