pragma solidity >= 0.5.0 < 0.6.0;

import "@netgum/solidity/contracts/common/BytesSignatureLibrary.sol";
import "@netgum/solidity/contracts/ens/AbstractENS.sol";
import "@netgum/solidity/contracts/ens/AbstractENSResolver.sol";
import "@netgum/solidity/contracts/sharedAccount/SharedAccountLibrary.sol";
import "../account/AbstractAccount.sol";
import "../registry/AbstractRegistry.sol";


/**
 * @title Account Creator Basic Service
 */
contract AccountCreatorBasicService {

  using BytesSignatureLibrary for bytes;
  using SharedAccountLibrary for AbstractAccount;

  event AccountCreated(address account, bytes32 ensNode, address[] devices);

  AbstractRegistry private registry;

  AbstractAccount private guardian;

  AbstractENS private ens;

  AbstractENSResolver private ensResolver;

  bytes32 private ensRootNode;

  bytes private contractCode;

  constructor(
    AbstractRegistry _registry,
    AbstractAccount _guardian,
    AbstractENS _ens,
    AbstractENSResolver _ensResolver,
    bytes32 _ensRootNode,
    bytes memory _contractCode
  ) public {
    registry = _registry;
    guardian = _guardian;
    ens = _ens;
    ensResolver = _ensResolver;
    ensRootNode = _ensRootNode;
    contractCode = _contractCode;
  }

  function createAccount(
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
        _ensNode
      )
    );

    guardian.verifyDeviceSignature(
      _guardianSignature,
      _deviceSignature,
      true
    );

    address payable _account;

    bytes memory _contractCode = contractCode;

    assembly {
      _account := create2(0, add(_contractCode, 0x20), mload(_contractCode), _ensNode)
      if iszero(extcodesize(_account)) {revert(0, 0)}
    }

    address[] memory _devices = new address[](1);
    _devices[0] = _device;

    AbstractAccount(_account).initialize(_devices);

    registry.registerAccount(_account);

    ens.setSubnodeOwner(ensRootNode, _ensLabel, address(this));
    ens.setResolver(_ensNode, address(ensResolver));

    ensResolver.setAddr(_ensNode, _account);

    emit AccountCreated(_account, _ensNode, _devices);
  }
}
