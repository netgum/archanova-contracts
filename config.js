const {
  TRUFFLE_PROVIDER_ENDPOINT,
  TRUFFLE_ACCOUNT_MNEMONIC,
  ENS_ROOT_NODES,
} = process.env;

module.exports = {
  truffle: {
    providerEndpoint: TRUFFLE_PROVIDER_ENDPOINT || 'http://localhost:8545',
    accountMnemonic: TRUFFLE_ACCOUNT_MNEMONIC || 'false myself sadness rebuild shallow powder outdoor thank basket light fun tip',
  },
  ensRootNodes: (ENS_ROOT_NODES || 'archanova.test,smartsafe.test').split(','),
};
