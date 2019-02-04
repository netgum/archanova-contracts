const HDWalletProvider = require('truffle-hdwallet-provider');
const ganache = require('ganache-core');
const config = require('./config');

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
    testing: config.network.useGanacheForTesting
      ? ganacheNetwork
      : defaultNetwork,
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
