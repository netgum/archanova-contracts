const { getEnsNameInfo } = require('@netgum/utils');

const {
  TRUFFLE_ACCOUNTS_MNEMONIC,
  TRUFFLE_ACCOUNTS_COUNT,
  TRUFFLE_NETWORK_ENDPOINT,
  TRUFFLE_ENS_ROOT_NODE,
} = process.env;

module.exports = {
  accounts: {
    mnemonic: TRUFFLE_ACCOUNTS_MNEMONIC || 'false myself sadness rebuild shallow powder outdoor thank basket light fun tip',
    count: parseInt(TRUFFLE_ACCOUNTS_COUNT, 10) || 10,
  },
  network: {
    endpoint: TRUFFLE_NETWORK_ENDPOINT || 'http://localhost:8545',
  },
  ens: {
    nameInfo: getEnsNameInfo(TRUFFLE_ENS_ROOT_NODE || 'smartsafe.test'),
  },
};
