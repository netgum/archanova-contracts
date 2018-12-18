pragma solidity >= 0.5.0 < 0.6.0;

import "../account/AbstractAccount.sol";
import "./AbstractRegistry.sol";


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

  mapping(address => Service) private services;

  mapping(address => bool) private accounts;

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
      "msg.sender is not a guardian device"
    );
    _;
  }

  constructor(AbstractAccount _guardian) public {
    guardian = _guardian;
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

  function accountExists(address _account) public view returns (bool) {
    return accounts[_account];
  }

  function deployService(bytes32 _salt, bytes memory _contractCode) public onlyGuardian {
    address payable _service;
    assembly {
      _service := create2(0, add(_contractCode, 0x20), mload(_contractCode), _salt)
      if iszero(extcodesize(_service)) {revert(0, 0)}
    }

    emit ServiceDeployed(msg.sender, _service);
  }

  function registerService(address _service, bool _canRegisterAccounts) public onlyGuardian {
    require(
      !services[_service].exists,
      "service already registered"
    );

    services[_service].exists = true;
    services[_service].disabled = false;
    services[_service].canRegisterAccounts = _canRegisterAccounts;

    emit ServiceRegistered(msg.sender, _service);
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

  function registerAccount(address _account) public onlyGuardianOrAccountService {
    require(
      !accounts[_account],
      "account already registered"
    );

    accounts[_account] = true;

    emit AccountRegistered(msg.sender, _account);
  }
}
