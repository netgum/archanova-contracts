const { getEnsNameInfo } = require('@netgum/utils');

const {
  ACCOUNTS_MNEMONIC,
  ACCOUNTS_COUNT,
  NETWORK_PROVIDER_ENDPOINT,
  PLATFORM_ACCOUNT_PROVIDER_ENS_ROOT_NODE_NAME,
} = process.env;

module.exports = {
  accounts: {
    mnemonic: ACCOUNTS_MNEMONIC || 'false myself sadness rebuild shallow powder outdoor thank basket light fun tip',
    count: parseInt(ACCOUNTS_COUNT, 10) || 10,
  },
  network: {
    providerEndpoint: NETWORK_PROVIDER_ENDPOINT || 'http://localhost:8545',
  },
  platform: {
    accountProvider: {
      ensNode: getEnsNameInfo(PLATFORM_ACCOUNT_PROVIDER_ENS_ROOT_NODE_NAME || 'smartsafe.test'),
    },
  },
};
