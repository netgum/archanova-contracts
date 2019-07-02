const HDWalletProvider = require('truffle-hdwallet-provider');
const { providerMnemonic, providerEndpoint } = require('./config');

function provider() {
  if (!providerMnemonic) {
    throw new Error('Please setup PROVIDER_MNEMONIC env variable');
  }

  return new HDWalletProvider(
    providerMnemonic,
    providerEndpoint,
    0,
    10,
  );
}

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
    ropsten: {
      provider,
      network_id: '3',
    },
    rinkeby: {
      provider,
      network_id: '4',
    },
    kovan: {
      provider,
      network_id: '42',
    },
  },
  compilers: {
    solc: {
      version: '0.5.10',
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
