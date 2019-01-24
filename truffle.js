const HDWalletProvider = require('truffle-hdwallet-provider');
const config = require('./config');

const network = {
  provider: () => new HDWalletProvider(
    config.accounts.mnemonic,
    config.network.endpoint,
    0,
    config.accounts.count,
  ),
  network_id: '*',
};

module.exports = {
  networks: {
    development: network,
    testing: network,
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
