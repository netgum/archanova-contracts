const BN = require('bn.js');

const AccountAccessTypes = {
  NONE: new BN(0),
  OWNER: new BN(1),
  DELEGATE: new BN(2),
  INVALID: new BN(3),
};

module.exports = {
  AccountAccessTypes,
};
