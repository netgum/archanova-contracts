const HDWalletProvider = require('truffle-hdwallet-provider');
const { truffle } = require('./config');

const provider = () => new HDWalletProvider(
  truffle.accountMnemonic,
  truffle.providerEndpoint,
  0,
  10,
);

module.exports = {
  networks: {
    test: {
      host: '127.0.0.1',
      port: 8555,
      network_id: '*',
    },
    local: {
      provider,
      network_id: '*',
    },
    kovan: {
      provider,
      network_id: '44',
    },
  },
  compilers: {
    solc: {
      version: '0.5.2',
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
