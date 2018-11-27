const { TEST_MNEMONIC, TEST_ENDPOINT } = process.env;

module.exports = {
  accounts: {
    mnemonic: TEST_MNEMONIC || 'false myself sadness rebuild shallow powder outdoor thank basket light fun tip',
    count: 10,
  },
  endpoint: TEST_ENDPOINT || 'http://localhost:8545',
};
