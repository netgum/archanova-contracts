pragma solidity >= 0.5.0 < 0.6.0;

import "@netgum/solidity/contracts/ens/AbstractENS.sol";
import "@netgum/solidity/contracts/ens/AbstractENSResolver.sol";
import "@netgum/solidity/contracts/libraries/BytesSignatureLibrary.sol";
import "../registry/AbstractRegistry.sol";
import "./AbstractAccount.sol";
import "./AbstractAccountCreatorService.sol";
import "./AbstractAccountProxyService.sol";
import "./AccountLibrary.sol";


/**
 * @title Account Creator Service
 */
contract AccountCreatorService is AbstractAccountCreatorService {

  using BytesSignatureLibrary for bytes;
  using AccountLibrary for AbstractAccount;

  AbstractRegistry private registry;

  AbstractAccount private guardian;

  AbstractENS private ens;

  AbstractENSResolver private ensResolver;

  bytes32 private ensRootNode;

  AbstractAccountProxyService private accountProxyService;

  bytes private accountContractCode;

  constructor(
    AbstractRegistry _registry,
    AbstractAccount _guardian,
    AbstractENS _ens,
    AbstractENSResolver _ensResolver,
    bytes32 _ensRootNode,
    AbstractAccountProxyService _accountProxyService,
    bytes memory _accountContractCode
  ) public {
    registry = _registry;
    guardian = _guardian;
    ens = _ens;
    ensResolver = _ensResolver;
    ensRootNode = _ensRootNode;
    accountProxyService = _accountProxyService;
    accountContractCode = _accountContractCode;
  }

  function createAccount(
    bytes32 _salt,
    bytes memory _deviceSignature,
    bytes memory _guardianSignature
  ) public {

    address _device = _deviceSignature.recoverAddress(
      abi.encodePacked(
        address(this),
        msg.sig,
        _salt
      )
    );

    guardian.verifyDeviceSignature(
      _guardianSignature,
      _deviceSignature,
      true
    );

    _createAccount(_salt, _device);
  }

  function createAccountWithEnsLabel(
    bytes32 _salt,
    bytes32 _ensLabel,
    bytes memory _deviceSignature,
    bytes memory _guardianSignature
  ) public {

    bytes32 _ensNode = keccak256(abi.encodePacked(ensRootNode, _ensLabel));

    require(
      ensResolver.addr(_ensNode) == address(0),
      "ens label already taken"
    );

    address _device = _deviceSignature.recoverAddress(
      abi.encodePacked(
        address(this),
        msg.sig,
        _salt,
        _ensLabel
      )
    );

    guardian.verifyDeviceSignature(
      _guardianSignature,
      _deviceSignature,
      true
    );

    address payable _account = _createAccount(_salt, _device);

    ens.setSubnodeOwner(ensRootNode, _ensLabel, address(this));
    ens.setResolver(_ensNode, address(ensResolver));

    ensResolver.setAddr(_ensNode, address(_account));
  }

  function _createAccount(bytes32 _salt, address _ownerDevice) internal returns (address payable _account) {
    bytes memory _accountContractCode = accountContractCode;

    assembly {
      _account := create2(0, add(_accountContractCode, 0x20), mload(_accountContractCode), _salt)
      if iszero(extcodesize(_account)) {revert(0, 0)}
    }

    address[] memory _devices = new address[](2);
    _devices[0] = _ownerDevice;
    _devices[1] = address(accountProxyService);

    AbstractAccount(_account).initialize(_devices);

    registry.registerAccount(_account);
    accountProxyService.connectAccount(_account);

    emit AccountCreated(_account);
  }
}
