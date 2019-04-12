pragma solidity ^0.5.0;

import "@ensdomains/ens/contracts/ENS.sol";
import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "../contractCreator/ContractCreator.sol";
import "../ens/AbstractENSAddrResolver.sol";
import "../ens/ENSOwnable.sol";
import "../guardian/Guarded.sol";


/**
 * @title Account Provider
 */
contract AccountProvider is ContractCreator, AbstractENSAddrResolver, ENSOwnable, Guarded {

  using ECDSA for bytes32;

  event ENSNodeAdded(bytes32 ensNode);
  event ENSNodeRemoved(bytes32 ensNode);
  event AccountCreated(address account);

  bytes1 constant ACCOUNT_SALT_MSG_PREFIX = 0x01;
  bytes1 constant ACCOUNT_SALT_MSG_PREFIX_UNSAFE = 0x02;
  string constant ERR_ENS_NODE_ALREADY_EXISTS = "ENS node already exists";
  string constant ERR_ENS_NODE_DOESNT_EXIST = "ENS node doesn't exist";
  string constant ERR_ENS_LABEL_ALREADY_TAKEN = "ENS label already taken";

  mapping(bytes32 => bool) public ensNodes;
  mapping(bytes32 => address) private ensResolverAddresses;

  address private accountProxy;

  constructor(
    address _guardian,
    bytes memory _accountContractCode,
    address _accountProxy,
    address _ens,
    bytes32[] memory _ensNodes
  ) ContractCreator(_accountContractCode) ENSOwnable(_ens) Guarded(_guardian) public {
    accountProxy = _accountProxy;

    for (uint i = 0; i < _ensNodes.length; i++) {
      ensNodes[_ensNodes[i]] = true;
    }
  }

  function addr(bytes32 _node) public view returns (address) {
    return ensResolverAddresses[_node];
  }

  function setAddr(bytes32 _node, address _addr) public onlyENSNodeOwner(_node) {
    ensResolverAddresses[_node] = _addr;
    emit AddrChanged(_node, _addr);
  }

  function addENSNode(bytes32 _ensNode) onlyGuardian public {
    require(
      !ensNodes[_ensNode],
      ERR_ENS_NODE_ALREADY_EXISTS
    );

    ensNodes[_ensNode] = true;

    emit ENSNodeAdded(_ensNode);
  }

  function removeENSNode(bytes32 _ensNode) onlyGuardian public {
    require(
      ensNodes[_ensNode],
      ERR_ENS_NODE_DOESNT_EXIST
    );

    delete ensNodes[_ensNode];

    emit ENSNodeRemoved(_ensNode);
  }

  function createAccount(
    bytes32 _ensLabel,
    bytes32 _ensNode,
    uint256 _refundAmount,
    bytes memory _signature
  ) onlyGuardian public {
    address _device = keccak256(
      abi.encodePacked(
        address(this),
        msg.sig,
        _ensLabel,
        _ensNode,
        _refundAmount
      )
    ).toEthSignedMessageHash().recover(_signature);

    bytes32 _salt = keccak256(abi.encodePacked(
        ACCOUNT_SALT_MSG_PREFIX,
        keccak256(abi.encodePacked(_device))
      ));

    _createAccount(
      _salt,
      _device,
      _ensLabel,
      _ensNode,
      _refundAmount
    );
  }

  function unsafeCreateAccount(
    uint256 _accountId,
    address _device,
    bytes32 _ensLabel,
    bytes32 _ensNode,
    uint256 _refundAmount
  ) onlyGuardian public {
    bytes32 _salt = keccak256(
      abi.encodePacked(
        ACCOUNT_SALT_MSG_PREFIX_UNSAFE,
        _accountId
      )
    );

    _createAccount(
      _salt,
      _device,
      _ensLabel,
      _ensNode,
      _refundAmount
    );
  }

  function _createAccount(
    bytes32 _salt,
    address _device,
    bytes32 _ensLabel,
    bytes32 _ensNode,
    uint256 _refundAmount
  ) private {
    bytes32 _accountEnsNode = keccak256(abi.encodePacked(_ensNode, _ensLabel));

    require(
      ensNodes[_ensNode],
      ERR_ENS_NODE_DOESNT_EXIST
    );

    require(
      addr(_accountEnsNode) == address(0),
      ERR_ENS_LABEL_ALREADY_TAKEN
    );

    // initialize account
    AbstractAccount _account = AbstractAccount(_createContract(_salt));

    address[] memory _devices = new address[](2);
    _devices[0] = accountProxy;
    _devices[1] = _device;
    _account.initialize(_devices, _refundAmount, msg.sender);

    // setup ens name
    ens.setSubnodeOwner(_ensNode, _ensLabel, address(this));
    ens.setResolver(_accountEnsNode, address(this));
    ens.setOwner(_accountEnsNode, address(_account));

    ensResolverAddresses[_accountEnsNode] = address(_account);

    emit AccountCreated(address(_account));
  }
}
