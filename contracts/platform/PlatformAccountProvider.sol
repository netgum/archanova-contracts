pragma solidity >= 0.5.0 < 0.6.0;

import "@netgum/solidity/contracts/ens/AbstractENS.sol";
import "@netgum/solidity/contracts/ens/ENSOwnable.sol";
import "@netgum/solidity/contracts/libraries/BytesSignatureLibrary.sol";
import "../shared/AbstractContractCreator.sol";
import "../shared/AbstractGuarded.sol";
import "./AbstractPlatformAccount.sol";
import "./AbstractPlatformAccountProvider.sol";


/**
 * @title Platform Account Provider
 */
contract PlatformAccountProvider is ENSOwnable, AbstractContractCreator, AbstractGuarded, AbstractPlatformAccountProvider {

  using BytesSignatureLibrary for bytes;

  bytes4 private constant INTERFACE_META_ID = bytes4(keccak256("supportsInterface(bytes4)"));
  bytes4 private constant ADDR_INTERFACE_ID = bytes4(keccak256("addr(bytes32)"));

  AbstractENS private ens;

  mapping(bytes32 => address) private ensResolverAddresses;

  bytes32 private ensNode;

  address accountProxy;

  constructor(
    address _ens,
    bytes32 _ensNode,
    address _guardian,
    address _accountProxy,
    bytes memory _contractCode
  ) public {
    ens = AbstractENS(_ens);
    ensNode = _ensNode;
    guardian = AbstractGuardian(_guardian);
    accountProxy = _accountProxy;
    contractCode = _contractCode;
  }

  function supportsInterface(bytes4 _id) public pure returns (bool) {
    return _id == INTERFACE_META_ID || _id == ADDR_INTERFACE_ID;
  }

  function addr(bytes32 _node) public view returns (address) {
    return ensResolverAddresses[_node];
  }

  function setAddr(bytes32 _node, address _addr) public onlyENSNodeOwner(_node) {
    ensResolverAddresses[_node] = _addr;
    emit AddrChanged(_node, _addr);
  }

  function releaseENSNode() onlyGuardian public {
    ens.setOwner(ensNode, msg.sender);
  }

  function createAccount(
    bytes32 _ensLabel,
    uint256 _refundAmount,
    bytes memory _deviceSignature,
    bytes memory _guardianSignature
  ) public {

    address _device = _deviceSignature.recoverAddress(
      abi.encodePacked(
        address(this),
        msg.sig,
        _ensLabel,
        _refundAmount
      )
    );

    guardian.verifyDeviceSignature(
      _guardianSignature,
      _deviceSignature,
      true
    );

    bytes32 _salt = keccak256(abi.encodePacked(_device));

    _createAccount(
      _salt,
      _device,
      _ensLabel,
      _refundAmount
    );
  }

  function createAccount(
    bytes32 _ensLabel,
    uint256 _refundAmount,
    bytes memory _deviceSignature
  ) onlyGuardian public {

    address _device = _deviceSignature.recoverAddress(
      abi.encodePacked(
        address(this),
        msg.sig,
        _ensLabel,
        _refundAmount
      )
    );

    bytes32 _salt = keccak256(abi.encodePacked(_device));

    _createAccount(
      _salt,
      _device,
      _ensLabel,
      _refundAmount
    );
  }

  function unsafeCreateAccount(
    uint256 _accountId,
    address _device,
    bytes32 _ensLabel,
    uint256 _refundAmount
  ) onlyGuardian public {

    bytes32 _salt = keccak256(
      abi.encodePacked(
        msg.sig,
        _accountId
      )
    );

    _createAccount(
      _salt,
      _device,
      _ensLabel,
      _refundAmount
    );
  }

  function _createAccount(
    bytes32 _salt,
    address _device,
    bytes32 _ensLabel,
    uint256 _refundAmount
  ) internal {

    bytes32 _accountEnsNode = keccak256(abi.encodePacked(ensNode, _ensLabel));

    require(
      addr(_accountEnsNode) == address(0),
      "ens label already taken"
    );

    // create account
    address _accountAddress = _createContract(_salt);

    // initialize account
    AbstractPlatformAccount _account = AbstractPlatformAccount(_accountAddress);
    address[] memory _devices = new address[](2);
    _devices[0] = accountProxy;
    _devices[1] = _device;
    _account.initialize(_devices, _refundAmount);

    // setup ens name
    ens.setSubnodeOwner(ensNode, _ensLabel, address(this));
    ens.setResolver(_accountEnsNode, address(this));
    ens.setOwner(_accountEnsNode, _accountAddress);
    setAddr(_accountEnsNode, _accountAddress);
  }
}
