pragma solidity >= 0.5.0 < 0.6.0;

import "@netgum/solidity/contracts/ens/AbstractENS.sol";
import "@netgum/solidity/contracts/ens/AbstractENSResolver.sol";
import "@netgum/solidity/contracts/libraries/BytesSignatureLibrary.sol";
import "../registry/AbstractRegistryService.sol";
import "./AbstractAccount.sol";
import "./AbstractAccountProvider.sol";
import "./AbstractAccountProxy.sol";
import "./AccountLibrary.sol";


/**
 * @title Account Provider
 */
contract AccountProvider is AbstractRegistryService, AbstractAccountProvider {

  using BytesSignatureLibrary for bytes;
  using AccountLibrary for AbstractAccount;

  AbstractAccount private guardian;

  AbstractENS private ens;

  AbstractENSResolver private ensResolver;

  AbstractAccountProxy private accountProxy;

  bytes32 private ensRootNode;

  function initialize(
    address _guardian,
    address _ens,
    address _ensResolver,
    address _accountProxy,
    bytes32 _ensRootNode
  ) onlyInitializer() public {
    guardian = AbstractAccount(_guardian);
    ens = AbstractENS(_ens);
    ensResolver = AbstractENSResolver(_ensResolver);
    accountProxy = AbstractAccountProxy(_accountProxy);
    ensRootNode = _ensRootNode;
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

    address payable _account = _createAccount(_salt, _device);

    emit AccountCreated(_account);
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

    emit AccountCreated(_account);
  }

  function _createAccount(bytes32 _salt, address _ownerDevice) internal returns (address payable _account) {
    address[] memory _devices = new address[](2);
    _devices[0] = _ownerDevice;
    _devices[1] = address(accountProxy);

    _account = registry.deployAccount(_salt, _devices);

    accountProxy.connectAccount(_account);
  }
}
