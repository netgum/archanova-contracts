pragma solidity >= 0.5.0 < 0.6.0;

import "../account/AbstractAccount.sol";
import "./AbstractRegistry.sol";
import "./AbstractRegistryService.sol";


/**
 * @title Registry
 */
contract Registry is AbstractRegistry {

  struct Service {
    bool exists;
    bool disabled;
    bool canRegisterAccounts;
  }

  AbstractAccount private guardian;

  bytes private accountCode;

  mapping(address => bool) private accounts;

  mapping(address => Service) private services;

  modifier onlyGuardian() {
    require(
      (
      address(guardian) == msg.sender ||
      guardian.deviceExists(msg.sender)
      ),
      "msg.sender is not a guardian device"
    );
    _;
  }

  modifier onlyGuardianOrAccountService() {
    require(
      (
      address(guardian) == msg.sender ||
      guardian.deviceExists(msg.sender) ||
      (
      serviceEnabled(msg.sender) &&
      services[msg.sender].canRegisterAccounts
      )
      ),
      "msg.sender is not a guardian device or account service"
    );
    _;
  }

  constructor(AbstractAccount _guardian, bytes memory _accountCode) public {
    guardian = _guardian;
    accountCode = _accountCode;

    accounts[address(guardian)] = true;
  }

  function accountExists(address _account) public view returns (bool) {
    return accounts[_account];
  }

  function serviceExists(address _service) public view returns (bool) {
    return services[_service].exists;
  }

  function serviceEnabled(address _service) public view returns (bool) {
    return serviceExists(_service) && !services[_service].disabled;
  }

  function serviceDisabled(address _service) public view returns (bool) {
    return serviceExists(_service) && services[_service].disabled;
  }

  function deployAccount(bytes32 _salt, address[] memory _devices) public onlyGuardianOrAccountService returns (address payable _account) {
    _account = _deployContract(_salt, accountCode);

    accounts[_account] = true;

    AbstractAccount(_account).initialize(_devices);

    emit AccountDeployed(msg.sender, _account);
  }

  function deployService(bytes32 _salt, bytes memory _code, bool _canRegisterAccounts) public onlyGuardian returns (address payable _service) {
    _service = _deployContract(_salt, _code);

    services[_service].exists = true;
    services[_service].disabled = false;
    services[_service].canRegisterAccounts = _canRegisterAccounts;

    AbstractRegistryService(_service).transferInitializer(msg.sender);

    emit ServiceDeployed(msg.sender, _service);
  }

  function enableService(address _service) public onlyGuardian {
    require(
      serviceDisabled(_service),
      "service is not disabled"
    );

    services[_service].disabled = false;

    emit ServiceEnabled(msg.sender, _service);
  }

  function disableService(address _service) public onlyGuardian {
    require(
      serviceEnabled(_service),
      "service is not enabled"
    );

    services[_service].disabled = true;

    emit ServiceDisabled(msg.sender, _service);
  }

  function _deployContract(bytes32 _salt, bytes memory _code) internal returns (address payable _deployed) {
    assembly {
      _deployed := create2(0, add(_code, 0x20), mload(_code), _salt)
      if iszero(extcodesize(_deployed)) {revert(0, 0)}
    }
  }
}
