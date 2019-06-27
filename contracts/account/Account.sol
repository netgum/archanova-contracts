pragma solidity ^0.5.8;
pragma experimental ABIEncoderV2;

import "./AbstractAccount.sol";


/**
 * @title Account
 */
contract Account is AbstractAccount {

  uint256 constant TX_SERIES_LIMIT = 10;

  modifier onlyOwner() {
    require(
      devices[msg.sender].isOwner
    );

    _;
  }

  constructor() public {
    devices[msg.sender].isOwner = true;
    devices[msg.sender].exists = true;
    devices[msg.sender].existed = true;
  }

  function() external payable {
    //
  }

  function addDevice(address _device, bool _isOwner) onlyOwner public {
    require(
      _device != address(0)
    );
    require(
      !devices[_device].exists
    );

    devices[_device].isOwner = _isOwner;
    devices[_device].exists = true;
    devices[_device].existed = true;

    emit DeviceAdded(_device, _isOwner);
  }

  function removeDevice(address _device) onlyOwner public {
    require(
      devices[_device].exists
    );

    devices[_device].isOwner = false;
    devices[_device].exists = false;

    emit DeviceRemoved(_device);
  }

  function executeTransaction(address payable _recipient, uint256 _value, bytes memory _data) onlyOwner public returns (bytes memory _response) {
    require(
      _recipient != address(0),
      "executeTransaction:: Invalid _recipient"
    );

    bool _succeeded;
    (_succeeded, _response) = _recipient.call.value(_value)(_data);

    require(
      _succeeded,
      "executeTransaction:: Unsuccessfull transaction"
    );

    emit TransactionExecuted(_recipient, _value, _data, _response);
  }

  function executeTransactions(address payable[] memory _recipients, uint256[] memory _values, bytes[] memory _datas) onlyOwner public {
    require(_recipients.length <= TX_SERIES_LIMIT, "executeTransactionSeries:: Too many transactions sent (_recipients)");
    require(_values.length <= TX_SERIES_LIMIT, "executeTransactionSeries:: Too many transactions sent (_values)");
    require(_datas.length <= TX_SERIES_LIMIT, "executeTransactionSeries:: Too many transactions sent (_datas)");

    require(_datas.length == _values.length, "executeTransactionSeries:: Transactions params length differ (data <> value)");
    require(_datas.length == _recipients.length, "executeTransactionSeries:: Transactions params length differ (data <> recipient)");

    uint256 len = _recipients.length;
    for(uint256 i = 0; i < len; i++) {
      executeTransaction(_recipients[i], _values[i], _datas[i]);
    }
    
  }
}
