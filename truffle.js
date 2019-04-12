const HDWalletProvider = require('truffle-hdwallet-provider');

const {
  KOVAN_PROVIDER_ENDPOINT,
  KOVAN_ACCOUNT_MNEMONIC,
} = process.env;

module.exports = {
  networks: {
    test: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
    },
    kovan: {
      provider: () => new HDWalletProvider(
        KOVAN_ACCOUNT_MNEMONIC,
        KOVAN_PROVIDER_ENDPOINT,
        0,
        10,
      ),
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
