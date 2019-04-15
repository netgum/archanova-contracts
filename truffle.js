const HDWalletProvider = require('truffle-hdwallet-provider');

const {
  TRUFFLE_PROVIDER_ENDPOINT,
  TRUFFLE_ACCOUNT_MNEMONIC,
} = process.env;

const provider = () => new HDWalletProvider(
  TRUFFLE_ACCOUNT_MNEMONIC || 'false myself sadness rebuild shallow powder outdoor thank basket light fun tip',
  TRUFFLE_PROVIDER_ENDPOINT || 'http://localhost:8545',
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
