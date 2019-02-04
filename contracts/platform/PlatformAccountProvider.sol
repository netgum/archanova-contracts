pragma solidity ^0.5.0;

import "@ensdomains/ens/contracts/ENS.sol";
import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "../account/AbstractAccount.sol";
import "../contractCreator/ContractCreator.sol";
import "../ens/ENSOwnable.sol";
import "../guardian/Guarded.sol";
import "./AbstractPlatformAccount.sol";
import "./AbstractPlatformAccountProvider.sol";


/**
 * @title Platform Account Provider
 */
contract PlatformAccountProvider is ENSOwnable, ContractCreator, Guarded, AbstractPlatformAccountProvider {

  using ECDSA for bytes32;

  ENS private ens;

  mapping(bytes32 => address) private ensResolverAddresses;

  bytes32 private ensNode;

  address accountProxy;

  constructor(
    address _ens,
    bytes32 _ensNode,
    address _guardian,
    address _accountProxy,
    bytes memory _contractCode
  ) ContractCreator(_contractCode) Guarded(_guardian) public {
    ens = ENS(_ens);
    ensNode = _ensNode;
    accountProxy = _accountProxy;
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

  function createAccountWithGuardianSignature(
    bytes32 _ensLabel,
    uint256 _refundAmount,
    bytes memory _deviceSignature,
    bytes memory _guardianSignature
  ) public {

    address _device = keccak256(
      abi.encodePacked(
        address(this),
        msg.sig,
        _ensLabel,
        _refundAmount
      )
    ).toEthSignedMessageHash().recover(_deviceSignature);

    verifyGuardianSignature(
      _guardianSignature,
      _deviceSignature
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

    address _device = keccak256(
      abi.encodePacked(
        address(this),
        msg.sig,
        _ensLabel,
        _refundAmount
      )
    ).toEthSignedMessageHash().recover(_deviceSignature);

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
  ) private {

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

    ensResolverAddresses[_accountEnsNode] = _accountAddress;

    emit AccountCreated(_accountAddress);
  }
}
