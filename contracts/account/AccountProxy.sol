pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./AbstractAccount.sol";
import "./AccountLibrary.sol";


/**
 * @title Account Proxy
 */
contract AccountProxy {

  using AccountLibrary for AbstractAccount;
  using ECDSA for bytes32;
  using SafeMath for uint256;

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
    bytes32 _messageHash = keccak256(
      abi.encodePacked(
        address(this),
        msg.sig,
        _account,
        _nonce,
        _data,
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

    (_succeeded,) = _account.call(_data);

    require(
      _succeeded,
      ERR_CALL_FAILED
    );

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
