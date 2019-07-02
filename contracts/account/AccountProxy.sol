pragma solidity ^0.5.10;

import "solidity-bytes-utils/contracts/BytesLib.sol";
import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./AbstractAccount.sol";
import "./AccountLibrary.sol";


/**
 * @title Account Proxy
 */
contract AccountProxy {

  using BytesLib for bytes;
  using AccountLibrary for AbstractAccount;
  using ECDSA for bytes32;
  using SafeMath for uint256;

  bytes4 constant MSG_SIG = bytes4(keccak256("forwardAccountOwnerCall(address,uint256,bytes,uint256,bytes)"));
  uint256 constant MAX_CALLS = 5;

  event NewAccountOwnerCall(address account, uint256 nonce);

  struct Account {
    uint256 nonce;
  }

  string constant ERR_INVALID_ACCOUNT_NONCE = "Invalid account nonce";
  string constant ERR_INVALID_MESSAGE_SIGNER = "Invalid message signer";
  string constant ERR_CALL_FAILED = "Call failed";

  mapping(address => Account) public accounts;

  function forwardAccountOwnerCall(
    address _account,
    uint256 _nonce,
    bytes memory _data,
    uint256 _fixedGas,
    bytes memory _signature
  ) public {
    bytes[MAX_CALLS] memory _multiData;
    _multiData[0] = _data;

    _forwardAccountOwnerCall(
      _account,
      _nonce,
      _multiData,
      1,
      _fixedGas,
      _signature
    );
  }

  function forwardAccountOwnerCalls2(
    address _account,
    uint256 _nonce,
    bytes memory _data1,
    bytes memory _data2,
    uint256 _fixedGas,
    bytes memory _signature
  ) public {
    bytes[MAX_CALLS] memory _multiData;
    _multiData[0] = _data1;
    _multiData[1] = _data2;

    _forwardAccountOwnerCall(
      _account,
      _nonce,
      _multiData,
      2,
      _fixedGas,
      _signature
    );
  }

  function forwardAccountOwnerCalls3(
    address _account,
    uint256 _nonce,
    bytes memory _data1,
    bytes memory _data2,
    bytes memory _data3,
    uint256 _fixedGas,
    bytes memory _signature
  ) public {
    bytes[MAX_CALLS] memory _multiData;
    _multiData[0] = _data1;
    _multiData[1] = _data2;
    _multiData[2] = _data3;

    _forwardAccountOwnerCall(
      _account,
      _nonce,
      _multiData,
      3,
      _fixedGas,
      _signature
    );
  }

  function forwardAccountOwnerCalls4(
    address _account,
    uint256 _nonce,
    bytes memory _data1,
    bytes memory _data2,
    bytes memory _data3,
    bytes memory _data4,
    uint256 _fixedGas,
    bytes memory _signature
  ) public {
    bytes[MAX_CALLS] memory _multiData;
    _multiData[0] = _data1;
    _multiData[1] = _data2;
    _multiData[2] = _data3;
    _multiData[3] = _data4;

    _forwardAccountOwnerCall(
      _account,
      _nonce,
      _multiData,
      4,
      _fixedGas,
      _signature
    );
  }

  function forwardAccountOwnerCalls5(
    address _account,
    uint256 _nonce,
    bytes memory _data1,
    bytes memory _data2,
    bytes memory _data3,
    bytes memory _data4,
    bytes memory _data5,
    uint256 _fixedGas,
    bytes memory _signature
  ) public {
    bytes[MAX_CALLS] memory _multiData;
    _multiData[0] = _data1;
    _multiData[1] = _data2;
    _multiData[2] = _data3;
    _multiData[3] = _data4;
    _multiData[4] = _data5;

    _forwardAccountOwnerCall(
      _account,
      _nonce,
      _multiData,
      5,
      _fixedGas,
      _signature
    );
  }

  function _forwardAccountOwnerCall(
    address _account,
    uint256 _nonce,
    bytes[MAX_CALLS] memory _multiData,
    uint256 _multiDataLen,
    uint256 _fixedGas,
    bytes memory _signature
  ) private {
    bytes memory _messageData = _multiData[0];

    for (uint256 i = 1; i < _multiDataLen; i++) {
      _messageData = _messageData.concat(_multiData[i]);
    }

    bytes32 _messageHash = keccak256(
      abi.encodePacked(
        address(this),
        MSG_SIG,
        _account,
        _nonce,
        _messageData,
        _fixedGas,
        tx.gasprice
      )
    ).toEthSignedMessageHash();

    require(
      accounts[_account].nonce == _nonce,
      ERR_INVALID_ACCOUNT_NONCE
    );

    require(
      AbstractAccount(_account).verifyOwnerSignature(_messageHash, _signature),
      ERR_INVALID_MESSAGE_SIGNER
    );

    accounts[_account].nonce = accounts[_account].nonce.add(1);

    emit NewAccountOwnerCall(_account, _nonce);

    bool _succeeded;
    uint _startGas = gasleft();

    for (uint256 i = 0; i < _multiDataLen; i++) {
      (_succeeded,) = _account.call(_multiData[i]);

      require(
        _succeeded,
        ERR_CALL_FAILED
      );
    }


    if (_fixedGas > 0) {
      uint256 _gasTotal = _fixedGas.add(_startGas).sub(gasleft());

      AbstractAccount(_account).executeTransaction(
        msg.sender,
        _gasTotal.mul(tx.gasprice),
        new bytes(0)
      );
    }
  }

}
