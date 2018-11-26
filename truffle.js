const HDWalletProvider = require('truffle-hdwallet-provider')
const { accounts, endpoint } = require('./config')

module.exports = {
  networks: {
    development: {
      provider: function () {
        return new HDWalletProvider(
          accounts.mnemonic,
          endpoint,
          0,
          accounts.count
        )
      },
      network_id: '*'
    }
  },
  compilers: {
    solc: {
      version: '0.5.0',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: 'constantinople'
      }
    }
  }
}
