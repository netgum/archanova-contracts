const HDWalletProvider = require('truffle-hdwallet-provider');
const ganache = require('ganache-core');
const config = require('./config');

/**
 * It looks like `ganache-core` is still not ready for constantinople hard fork
 */
const USE_GANACHE_FOR_TESTING = false;

const defaultNetwork = {
  provider: () => new HDWalletProvider(
    config.accounts.mnemonic,
    config.network.providerEndpoint,
    0,
    config.accounts.count,
  ),
  network_id: '*',
};

const ganacheNetwork = {
  provider: () => ganache.provider({
    mnemonic: config.accounts.mnemonic,
    hardfork: 'constantinople',
    total_accounts: config.accounts.count,
  }),
  network_id: '*',
};

module.exports = {
  networks: {
    development: defaultNetwork,
    testing: USE_GANACHE_FOR_TESTING ? ganacheNetwork : defaultNetwork,
  },
  compilers: {
    solc: {
      version: '0.5.0',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        evmVersion: 'constantinople',
      },
    },
  },
};
