pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "../address/AddressLibrary.sol";

/**
 * @title Virtual Payment Manager
 */
contract VirtualPaymentManager {

  using AddressLibrary for address;
  using ECDSA for bytes32;
  using SafeMath for uint256;

  event NewDeposit(address sender, uint256 value);
  event NewWithdrawal(address receiver, uint256 value);
  event NewWithdrawalRequest(address receiver, uint256 unlockedAt);
  event NewPayment(address sender, address receiver, uint256 id, uint256 value);

  struct Deposit {
    uint256 value;
    uint256 withdrawalUnlockedAt;
  }

  struct Payment {
    uint256 value;
  }

  mapping(address => Deposit) public deposits;
  mapping(bytes32 => Payment) public payments;

  address public guardian;
  uint256 public depositWithdrawalLockPeriod;

  string constant ERR_INVALID_SIGNATURE = "Invalid signature";
  string constant ERR_INVALID_VALUE = "Invalid value";

  constructor(
    address _guardian,
    uint256 _depositWithdrawalLockPeriod
  ) public {
    guardian = _guardian;
    depositWithdrawalLockPeriod = _depositWithdrawalLockPeriod;
  }

  function() external payable {
    deposits[msg.sender].value = deposits[msg.sender].value.add(msg.value);

    emit NewDeposit(msg.sender, msg.value);
  }

  function depositPayment(
    address _sender,
    address _receiver,
    uint256 _id,
    uint256 _value,
    bytes memory _senderSignature,
    bytes memory _guardianSignature
  ) public {
    uint256 _processedValue = _processPayment(
      _sender,
      _receiver,
      _id,
      _value,
      _senderSignature,
      _guardianSignature
    );

    deposits[_receiver].value = deposits[_receiver].value.add(_processedValue);

    emit NewPayment(_sender, _receiver, _id, _processedValue);
    emit NewDeposit(_receiver, _processedValue);
  }

  function withdrawPayment(
    address _sender,
    address payable _receiver,
    uint256 _id,
    uint256 _value,
    bytes memory _senderSignature,
    bytes memory _guardianSignature
  ) public {
    uint256 _processedValue = _processPayment(
      _sender,
      _receiver,
      _id,
      _value,
      _senderSignature,
      _guardianSignature
    );

    _receiver.transfer(_processedValue);

    emit NewPayment(_sender, _receiver, _id, _processedValue);
    emit NewWithdrawal(_receiver, _processedValue);
  }

  function withdrawDeposit() public {
    if (
      deposits[msg.sender].withdrawalUnlockedAt != 0 && deposits[msg.sender].withdrawalUnlockedAt <= now
    ) {
      msg.sender.transfer(deposits[msg.sender].value);

      emit NewWithdrawal(msg.sender, deposits[msg.sender].value);

      delete deposits[msg.sender];
    } else {
      deposits[msg.sender].withdrawalUnlockedAt = now.add(depositWithdrawalLockPeriod);

      emit NewWithdrawalRequest(msg.sender, deposits[msg.sender].withdrawalUnlockedAt);
    }
  }

  function _processPayment(
    address _sender,
    address _receiver,
    uint256 _id,
    uint256 _value,
    bytes memory _senderSignature,
    bytes memory _guardianSignature
  ) private returns (uint256 _processedValue) {
    bytes32 _messageHash = keccak256(
      abi.encodePacked(
        address(this),
        _sender,
        _receiver,
        _id,
        _value
      )
    ).toEthSignedMessageHash();

    require(
      _sender.verifySignature(_messageHash, _senderSignature, false),
      ERR_INVALID_SIGNATURE
    );
    require(
      guardian.verifySignature(_messageHash, _guardianSignature, true),
      ERR_INVALID_SIGNATURE
    );

    bytes32 _paymentHash = keccak256(abi.encodePacked(
        _sender,
        _receiver,
        _id
      ));

    require(
      _value > 0,
      ERR_INVALID_VALUE
    );

    if (payments[_paymentHash].value > 0) {
      require(
        payments[_paymentHash].value < _value,
        ERR_INVALID_VALUE
      );
      _processedValue = _value.sub(payments[_paymentHash].value);
    } else {
      _processedValue = _value;
    }

    require(
      deposits[_sender].value >= _processedValue,
      ERR_INVALID_VALUE
    );

    if (deposits[_sender].withdrawalUnlockedAt > 0) {
      delete deposits[_sender].withdrawalUnlockedAt;
    }

    payments[_paymentHash].value = _value;
    deposits[_sender].value = deposits[_sender].value.sub(_processedValue);
  }
}
