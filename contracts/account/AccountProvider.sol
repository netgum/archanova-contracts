pragma solidity >= 0.5.0 < 0.6.0;

import "@netgum/solidity/contracts/ens/AbstractENS.sol";
import "@netgum/solidity/contracts/ens/ENSOwnable.sol";
import "@netgum/solidity/contracts/libraries/BytesSignatureLibrary.sol";
import "../registry/AbstractRegistryService.sol";
import "./AbstractAccount.sol";
import "./AbstractAccountProvider.sol";
import "./AbstractAccountProxy.sol";
import "./AccountLibrary.sol";


/**
 * @title Account Provider
 */
contract AccountProvider is ENSOwnable, AbstractRegistryService, AbstractAccountProvider {

  using BytesSignatureLibrary for bytes;
  using AccountLibrary for AbstractAccount;

  bytes4 private constant INTERFACE_META_ID = bytes4(keccak256("supportsInterface(bytes4)"));
  bytes4 private constant ADDR_INTERFACE_ID = bytes4(keccak256("addr(bytes32)"));

  AbstractAccount private guardian;

  AbstractENS private ens;

  bytes32 private ensRootNode;

  AbstractAccountProxy private accountProxy;

  mapping(bytes32 => address) private ensAccounts;

  function initialize(
    address _guardian,
    address _ens,
    bytes32 _ensRootNode,
    address _accountProxy
  ) onlyInitializer() public {
    guardian = AbstractAccount(_guardian);
    ens = AbstractENS(_ens);
    ensRootNode = _ensRootNode;
    accountProxy = AbstractAccountProxy(_accountProxy);
  }

  function supportsInterface(bytes4 _id) public pure returns (bool) {
    return _id == INTERFACE_META_ID || _id == ADDR_INTERFACE_ID;
  }

  function addr(bytes32 _node) public view returns (address) {
    return ensAccounts[_node];
  }

  function setAddr(bytes32 _node, address _addr) public onlyENSNodeOwner(_node) {
    ensAccounts[_node] = _addr;
    emit AddrChanged(_node, _addr);
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
      addr(_ensNode) == address(0),
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
    ens.setResolver(_ensNode, address(this));

    ensAccounts[_ensNode] = _account;

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
