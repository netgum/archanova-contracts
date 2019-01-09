const { getEnsLabelHash } = require('@netgum/utils');
const config = require('../config');

const Account = artifacts.require('Account');
const AccountProvider = artifacts.require('AccountProvider');
const AccountProxy = artifacts.require('AccountProxy');
const Registry = artifacts.require('Registry');
const ENSMock = artifacts.require('ENSMock');
const ENSRegistrarMock = artifacts.require('ENSRegistrarMock');

module.exports = async (deployer, network, [guardianDevice]) => {
  if (network === 'production') {
    const registry = await Registry.at(Registry.address);

    await deployer.deploy(AccountProvider);
    await deployer.deploy(AccountProxy);

    const accountProvider = await AccountProvider.at(AccountProvider.address);
    const accountProxy = await AccountProxy.at(AccountProxy.address);

    await registry.registerService(accountProvider.address, true);
    await registry.registerService(accountProxy.address, false);

    if (!config.ens.address) {
      await deployer.deploy(ENSMock);

      const ens = await ENSMock.at(ENSMock.address);

      await deployer.deploy(ENSRegistrarMock, ens.address, config.ens.nameInfo.rootNode.nameHash);

      const ensRegistrar = await ENSRegistrarMock.at(ENSRegistrarMock.address);

      await ens.setSubnodeOwner('0x00', getEnsLabelHash(config.ens.nameInfo.rootNode.name), ensRegistrar.address);

      await ensRegistrar.register(
        config.ens.nameInfo.labelHash,
        accountProvider.address,
      );

      const guardian = await Account.new();
      await guardian.initialize([guardianDevice]);

      await accountProvider.initialize(
        guardian.address,
        ens.address,
        config.ens.nameInfo.nameHash,
        accountProxy.address,
      );
    }
  }
};
