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

  using AccountLibrary for AbstractAccount;
  using ECDSA for bytes32;
  using SafeMath for uint256;
  using BytesLib for bytes;

  struct Account {
    bool connected;
    uint256 nonce;
    uint256 requiredFriends;
    mapping(address => bool) friends;
  }

  mapping(address => Account) public accounts;

  modifier onlyConnectedAccount() {
    require(
      accounts[msg.sender].connected && AbstractAccount(msg.sender).isOwnerDevice(address(this))
    );

    _;
  }

  function connect(uint256 _requiredFriends, address[] memory _friends) public {
    require(
      !accounts[msg.sender].connected && AbstractAccount(msg.sender).isOwnerDevice(address(this))
    );

    accounts[msg.sender].connected = true;

    _setRequiredFriends(_requiredFriends);
    _addFriends(_friends);
  }

  function disconnect() onlyConnectedAccount public {
    AbstractAccount(msg.sender).removeDevice(address(this));

    accounts[msg.sender].connected = false;
  }

  function setRequiredFriends(uint256 _requiredFriends) onlyConnectedAccount public {
    _setRequiredFriends(_requiredFriends);
  }

  function addFriend(address _friend) onlyConnectedAccount public {
    accounts[msg.sender].friends[_friend] = true;
  }

  function addFriends(address[] memory _friends) onlyConnectedAccount public {
    _addFriends(_friends);
  }

  function removeFriend(address _friend) onlyConnectedAccount public {
    delete accounts[msg.sender].friends[_friend];
  }

  function removeFriends(address[] memory _friends) onlyConnectedAccount public {
    uint friendsLength = _friends.length;

    for (uint i = 0; i < friendsLength; i++) {
      delete accounts[msg.sender].friends[_friends[i]];
    }
  }

  function recoverAccount(
    address _account,
    address _device,
    address[] memory _friends,
    bytes memory _signatures,
    uint256 _gasFee
  ) public {
    require(
      accounts[_account].connected
    );

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
        AbstractAccount(_friends[i]).verifyOwnerSignature(_messageHash, signature)
      );
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
  }

  function _addFriends(address[] memory _friends) private {
    uint friendsLength = _friends.length;

    for (uint i = 0; i < friendsLength; i++) {
      accounts[msg.sender].friends[_friends[i]] = true;
    }
  }

}
