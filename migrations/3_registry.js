const Account = artifacts.require('Account');
const Registry = artifacts.require('Registry');

module.exports = async (deployer, network, [guardianDevice]) => {
  if (network === 'production') {
    const guardian = await Account.new();
    await guardian.initialize([guardianDevice]);

    await deployer.deploy(Registry, guardian.address, Account.binary);
  }
};
