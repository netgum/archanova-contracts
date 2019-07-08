pragma solidity ^0.5.10;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "../address/AddressLibrary.sol";

/**
 * @title Virtual Payment Manager
 */
contract VirtualPaymentManager {

  using AddressLibrary for address;
  using ECDSA for bytes32;
  using SafeMath for uint256;

  event NewDeposit(address owner, address token, uint256 value);
  event NewWithdrawal(address recipient, address token, uint256 value);
  event NewWithdrawalRequest(address owner, address token, uint256 unlockedAt);
  event NewPayment(address sender, address recipient, address token, uint256 id, uint256 value);

  struct Deposit {
    uint256 value;
    uint256 withdrawalUnlockedAt;
  }

  struct Payment {
    uint256 value;
  }

  mapping(address => mapping(address => Deposit)) public deposits;
  mapping(bytes32 => Payment) public payments;

  address public guardian;
  uint256 public depositWithdrawalLockPeriod;

  string constant ERR_INVALID_SIGNATURE = "Invalid signature";
  string constant ERR_INVALID_VALUE = "Invalid value";
  string constant ERR_INVALID_TOKEN = "Invalid token";

  constructor(
    address _guardian,
    uint256 _depositWithdrawalLockPeriod
  ) public {
    guardian = _guardian;
    depositWithdrawalLockPeriod = _depositWithdrawalLockPeriod;
  }

  function getDepositValue(address _owner, address _token) public view returns (uint256) {
    return deposits[_owner][_token].value;
  }

  function getDepositWithdrawalUnlockedAt(address _owner, address _token) public view returns (uint256) {
    return deposits[_owner][_token].withdrawalUnlockedAt;
  }

  function() external payable {
    deposits[msg.sender][address(0)].value = deposits[msg.sender][address(0)].value.add(msg.value);

    emit NewDeposit(msg.sender, address(0), msg.value);
  }

  function depositToken(address _token, uint256 _value) public {
    require(
      _token != address(0),
      ERR_INVALID_TOKEN
    );

    IERC20(_token).transferFrom(msg.sender, address(this), _value);

    deposits[msg.sender][_token].value = deposits[msg.sender][_token].value.add(_value);

    emit NewDeposit(msg.sender, _token, _value);
  }

  function depositPayment(
    address _sender,
    address _recipient,
    address _token,
    uint256 _id,
    uint256 _value,
    bytes memory _senderSignature,
    bytes memory _guardianSignature
  ) public {
    uint256 _processedValue = _processPayment(
      _sender,
      _recipient,
      _token,
      _id,
      _value,
      _senderSignature,
      _guardianSignature
    );

    deposits[_recipient][_token].value = deposits[_recipient][_token].value.add(_processedValue);

    emit NewPayment(_sender, _recipient, _token, _id, _processedValue);
    emit NewDeposit(_recipient, _token, _processedValue);
  }

  function withdrawPayment(
    address _sender,
    address _recipient,
    address _token,
    uint256 _id,
    uint256 _value,
    bytes memory _senderSignature,
    bytes memory _guardianSignature
  ) public {
    uint256 _processedValue = _processPayment(
      _sender,
      _recipient,
      _token,
      _id,
      _value,
      _senderSignature,
      _guardianSignature
    );

    _transfer(_recipient, _token, _processedValue);

    emit NewPayment(_sender, _recipient, _token, _id, _processedValue);
    emit NewWithdrawal(_recipient, _token, _processedValue);
  }

  function withdrawDeposit(address _token) public {
    if (
      deposits[msg.sender][_token].withdrawalUnlockedAt != 0 && deposits[msg.sender][_token].withdrawalUnlockedAt <= now
    ) {
      _transfer(msg.sender, _token, deposits[msg.sender][_token].value);

      emit NewWithdrawal(msg.sender, _token, deposits[msg.sender][_token].value);

      delete deposits[msg.sender][_token];
    } else {
      deposits[msg.sender][_token].withdrawalUnlockedAt = now.add(depositWithdrawalLockPeriod);

      emit NewWithdrawalRequest(msg.sender, _token, deposits[msg.sender][_token].withdrawalUnlockedAt);
    }
  }

  function _processPayment(
    address _sender,
    address _recipient,
    address _token,
    uint256 _id,
    uint256 _value,
    bytes memory _senderSignature,
    bytes memory _guardianSignature
  ) private returns (uint256 _processedValue) {
    bytes32 _messageHash = keccak256(
      abi.encodePacked(
        address(this),
        _sender,
        _recipient,
        _token,
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
        _recipient,
        _token,
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
      deposits[_sender][_token].value >= _processedValue,
      ERR_INVALID_VALUE
    );

    if (deposits[_sender][_token].withdrawalUnlockedAt > 0) {
      delete deposits[_sender][_token].withdrawalUnlockedAt;
    }

    payments[_paymentHash].value = _value;
    deposits[_sender][_token].value = deposits[_sender][_token].value.sub(_processedValue);
  }

  function _transfer(address _recipient, address _token, uint256 _value) private {
    if (_token == address(0)) {
      address payable _payableRecipient = address(uint160(_recipient));
      _payableRecipient.transfer(_value);
    } else {
      IERC20(_token).transfer(_recipient, _value);
    }
  }
}
