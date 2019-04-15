const Account = artifacts.require('Account');
const AccountProvider = artifacts.require('AccountProvider');
const AccountProxy = artifacts.require('AccountProxy');
const ENSRegistry = artifacts.require('ENSRegistry');

module.exports = async (deployer, network, addresses) => {
  switch (network) {
    case 'local':
    case 'kovan': {
      const devices = {
        guardian: addresses[1],
      };
      await deployer.deploy(Account);
      await deployer.deploy(AccountProxy);
      await deployer.deploy(ENSRegistry);

      const guardian = await Account.at(Account.address);
      const accountProxy = await AccountProxy.at(AccountProxy.address);
      const ens = await ENSRegistry.at(ENSRegistry.address);

      deployer.deploy(
        AccountProvider,
        guardian.address,
        Account.binary,
        accountProxy.address,
        ens.address,
      );

      await guardian.initialize([
        devices.guardian,
      ], 0, `0x${'0'.repeat(40)}`);
      break;
    }

    default:
  }
};
