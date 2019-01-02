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
    bool enabled;
    bool isAccountProvider;
  }

  AbstractAccount private guardian;

  mapping(address => bool) private accounts;

  mapping(address => Service) private services;

  bytes private accountContractCode;

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

  modifier onlyGuardianOrAccountProvider() {
    require(
      (
      address(guardian) == msg.sender ||
      guardian.deviceExists(msg.sender) ||
      (
      serviceEnabled(msg.sender) && serviceIsAccountProvider(msg.sender)
      )
      ),
      "msg.sender is not a guardian device or account provider"
    );
    _;
  }

  constructor(AbstractAccount _guardian, bytes memory _accountContractCode) public {
    guardian = _guardian;

    accountContractCode = _accountContractCode;

    accounts[address(guardian)] = true;
  }

  function accountExists(address _account) public view returns (bool) {
    return accounts[_account];
  }

  function serviceExists(address _service) public view returns (bool) {
    return services[_service].exists;
  }

  function serviceEnabled(address _service) public view returns (bool) {
    return services[_service].enabled;
  }

  function serviceIsAccountProvider(address _service) public view returns (bool) {
    return services[_service].isAccountProvider;
  }

  function registerAccount(address _account) public onlyGuardianOrAccountProvider {
    require(
      !accountExists(_account),
      "account already exist"
    );

    accounts[_account] = true;

    emit AccountRegistered(msg.sender, _account);
  }

  function deployAccount(bytes32 _salt, address[] memory _devices) public onlyGuardianOrAccountProvider returns (address payable _account) {
    _account = _deployContract(
      _salt,
      accountContractCode
    );

    AbstractAccount(_account).initialize(_devices);

    emit AccountDeployed(msg.sender, _account);

    registerAccount(_account);
  }

  function registerService(address _service, bool _isAccountProvider) public onlyGuardian {
    require(
      !serviceExists(_service),
      "service already exist"
    );

    services[_service].exists = true;
    services[_service].enabled = true;
    services[_service].isAccountProvider = _isAccountProvider;

    emit ServiceRegistered(msg.sender, _service);
  }

  function deployService(bytes32 _salt, bytes memory _code, bool _isAccountProvider) public onlyGuardian returns (address payable _service) {
    _service = _deployContract(
      _salt,
      _code
    );

    AbstractRegistryService(_service).transferInitializer(msg.sender);

    emit ServiceDeployed(msg.sender, _service);

    registerService(_service, _isAccountProvider);
  }

  function enableService(address _service) public onlyGuardian {
    require(
      serviceExists(_service),
      "service doesn't exist"
    );
    require(
      !serviceEnabled(_service),
      "service already enabled"
    );

    services[_service].enabled = true;

    emit ServiceEnabled(msg.sender, _service);
  }

  function disableService(address _service) public onlyGuardian {
    require(
      serviceExists(_service),
      "service doesn't exist"
    );
    require(
      serviceEnabled(_service),
      "service already disabled"
    );

    services[_service].enabled = false;

    emit ServiceDisabled(msg.sender, _service);
  }

  function _deployContract(bytes32 _salt, bytes memory _code) internal returns (address payable _address) {
    assembly {
      _address := create2(0, add(_code, 0x20), mload(_code), _salt)
      if iszero(extcodesize(_address)) {revert(0, 0)}
    }
  }
}
