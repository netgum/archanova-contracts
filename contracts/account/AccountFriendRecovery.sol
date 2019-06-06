pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";
import "./AbstractAccount.sol";
import "./AccountLibrary.sol";


/**
 * @title Account Friend Recovery
 */
contract AccountFriendRecovery {

  event RequiredFriendsChanged(address account, uint256 requiredFriends);
  event FriendsChanged(address account, address[] friends);

  using AccountLibrary for AbstractAccount;
  using ECDSA for bytes32;
  using SafeMath for uint256;
  using BytesLib for bytes;

  struct Account {
    uint256 nonce;
    uint256 requiredFriends;
    address[] friends;
    mapping(address => bool) friendsMap;
  }

  mapping(address => Account) public accounts;

  modifier onlyConnectedAccount() {
    require(
      AbstractAccount(msg.sender).isOwnerDevice(address(this))
    );

    _;
  }

  function setup(uint256 _requiredFriends, address[] memory _friends) onlyConnectedAccount public {
    _setRequiredFriends(_requiredFriends);
    _setFriends(_friends);
  }

  function setRequiredFriends(uint256 _requiredFriends) onlyConnectedAccount public {
    _setRequiredFriends(_requiredFriends);
  }

  function setFriends(address[] memory _friends) onlyConnectedAccount public {
    _setFriends(_friends);
  }

  function recoverAccount(
    address _account,
    address _device,
    address[] memory _friends,
    bytes memory _signatures,
    uint256 _gasFee
  ) public {
    uint friendsLength = _friends.length;
    uint signaturesLength = _signatures.length;

    require(
      accounts[_account].requiredFriends > 0 &&
      accounts[_account].requiredFriends == friendsLength &&
      signaturesLength == friendsLength * 65
    );

    bytes32 _messageHash = keccak256(
      abi.encodePacked(
        address(this),
        msg.sig,
        _account,
        _device,
        accounts[_account].nonce,
        _gasFee,
        tx.gasprice
      )
    ).toEthSignedMessageHash();

    for (uint i = 0; i < friendsLength; i++) {
      bytes memory signature = _signatures.slice(i * 65, 65);

      require(
        accounts[_account].friendsMap[_friends[i]] &&
        AbstractAccount(_friends[i]).verifyOwnerSignature(_messageHash, signature)
      );

      for (uint j = 0; j < friendsLength; j++) {
        if (j != i) {
          require(_friends[i] != _friends[j]);
        }
      }
    }

    accounts[_account].nonce = accounts[_account].nonce.add(1);

    AbstractAccount(_account).addDevice(_device, true);

    if (_gasFee > 0) {
      AbstractAccount(_account).executeTransaction(
        msg.sender,
        _gasFee.mul(tx.gasprice),
        new bytes(0)
      );
    }
  }

  function _setRequiredFriends(uint256 _requiredFriends) private {
    accounts[msg.sender].requiredFriends = _requiredFriends;

    emit RequiredFriendsChanged(msg.sender, _requiredFriends);
  }

  function _setFriends(address[] memory _friends) private {
    uint friendsLength = accounts[msg.sender].friends.length;
    uint i;

    for (i = 0; i < friendsLength; i++) {
      delete accounts[msg.sender].friendsMap[accounts[msg.sender].friends[i]];
    }

    accounts[msg.sender].friends = _friends;

    friendsLength = _friends.length;

    for (i = 0; i < friendsLength; i++) {
      require(
        !accounts[msg.sender].friendsMap[_friends[i]] && _friends[i] != address(0)
      );

      accounts[msg.sender].friendsMap[_friends[i]] = true;
    }

    emit FriendsChanged(msg.sender, _friends);
  }
}
