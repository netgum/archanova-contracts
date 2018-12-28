pragma solidity >= 0.5.0 < 0.6.0;

import "../account/AbstractAccount.sol";
import "./AbstractRegistry.sol";
import "./AbstractRegistryService.sol";


/**
 * @title Registry
 */
contract Registry is AbstractRegistry {

  bytes32 constant ACCOUNT_CONTRACT_ALIAS = keccak256("io.archanova.Account");

  struct DeployedService {
    bytes32 contractCodeAlias;
    bool enabled;
    bool isAccountProvider;
  }

  AbstractAccount private guardian;

  mapping(address => bool) private deployedAccounts;

  mapping(address => DeployedService) private deployedServices;

  mapping(bytes32 => bytes) private registeredContractCodes;

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

    registeredContractCodes[ACCOUNT_CONTRACT_ALIAS] = _accountContractCode;

    deployedAccounts[address(guardian)] = true;
  }

  function accountDeployed(address _account) public view returns (bool) {
    return deployedAccounts[_account];
  }

  function serviceDeployed(address _service) public view returns (bool) {
    return deployedServices[_service].contractCodeAlias != bytes32(0);
  }

  function serviceEnabled(address _service) public view returns (bool) {
    return deployedServices[_service].enabled;
  }

  function serviceIsAccountProvider(address _service) public view returns (bool) {
    return deployedServices[_service].isAccountProvider;
  }

  function contractCodeRegistered(bytes32 _codeAlias) public view returns (bool) {
    return registeredContractCodes[_codeAlias].length > 0;
  }

  function computeContractAddress(bytes32 _codeAlias, bytes32 _salt) public view returns (address _address) {
    if (contractCodeRegistered(_codeAlias)) {
      bytes32 _hash = keccak256(
        abi.encodePacked(
          byte(0xff),
          address(this),
          _salt,
          keccak256(registeredContractCodes[_codeAlias])
        )
      );

      assembly {
        mstore(0, _hash)
        _address := mload(0)
      }
    }
  }

  function deployAccount(bytes32 _salt, address[] memory _devices) public onlyGuardianOrAccountProvider returns (address payable _account) {
    _account = _deployContract(
      ACCOUNT_CONTRACT_ALIAS,
      _salt
    );

    deployedAccounts[_account] = true;

    AbstractAccount(_account).initialize(_devices);

    emit AccountDeployed(msg.sender, _account);
  }

  function deployService(bytes32 _contractCodeAlias, bytes32 _salt, bool _isAccountProvider) public onlyGuardian returns (address payable _service) {
    _service = _deployContract(
      _contractCodeAlias,
      _salt
    );

    deployedServices[_service].contractCodeAlias = _contractCodeAlias;
    deployedServices[_service].enabled = true;
    deployedServices[_service].isAccountProvider = _isAccountProvider;

    AbstractRegistryService(_service).transferInitializer(msg.sender);

    emit ServiceDeployed(msg.sender, _service);
  }

  function enableService(address _service) public onlyGuardian {
    require(
      serviceDeployed(_service),
      "service doesn't exist"
    );
    require(
      !serviceEnabled(_service),
      "service already enabled"
    );

    deployedServices[_service].enabled = true;

    emit ServiceEnabled(msg.sender, _service);
  }

  function disableService(address _service) public onlyGuardian {
    require(
      serviceDeployed(_service),
      "service doesn't exist"
    );
    require(
      serviceEnabled(_service),
      "service already disabled"
    );

    deployedServices[_service].enabled = false;

    emit ServiceDisabled(msg.sender, _service);
  }


  function registerContractCode(bytes32 _alias, bytes memory _code) public onlyGuardian {
    require(
      !contractCodeRegistered(_alias),
      "contract code already registered"
    );

    registeredContractCodes[_alias] = _code;
  }

  function _deployContract(bytes32 _codeAlias, bytes32 _salt) internal returns (address payable _address) {
    require(
      contractCodeRegistered(_codeAlias),
      "contract code alias not registered"
    );

    bytes memory _code = registeredContractCodes[_codeAlias];

    assembly {
      _address := create2(0, add(_code, 0x20), mload(_code), _salt)
      if iszero(extcodesize(_address)) {revert(0, 0)}
    }
  }
}
