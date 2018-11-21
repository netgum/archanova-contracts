const HDWalletProvider = require('truffle-hdwallet-provider');
const config = require('./config');

module.exports = {
  networks: {
    development: {
      provider: function() {
        return new HDWalletProvider(
          config.mnemonic,
          config.endpoint,
          0,
          10,
        );
      },
      network_id: '*',
    },
  },
  compilers: {
    solc: {
      version: '0.5.0-nightly.2018.11.12+commit.9f8ff27',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: 'constantinople',
      },
    },
  },
};
