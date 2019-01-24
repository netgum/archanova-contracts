/* eslint-disable no-console */
const { getEnsLabelHash } = require('@netgum/utils');
const config = require('../config');

const Guardian = artifacts.require('Account');
const AccountProvider = artifacts.require('AccountProvider');
const AccountProxy = artifacts.require('AccountProxy');
const Registry = artifacts.require('Registry');
const ENSMock = artifacts.require('ENSMock');
const ENSRegistrarMock = artifacts.require('ENSRegistrarMock');

module.exports = async (deployer, network) => {
  switch (network) {
    case 'development': {
      const registry = await Registry.at(Registry.address);
      const guardian = await Guardian.at(Guardian.address);

      await deployer.deploy(AccountProvider);
      await deployer.deploy(AccountProxy);

      const accountProvider = await AccountProvider.at(AccountProvider.address);
      const accountProxy = await AccountProxy.at(AccountProxy.address);

      await registry.registerService(accountProvider.address, true);
      await registry.registerService(accountProxy.address, false);

      await deployer.deploy(ENSMock);

      const ens = await ENSMock.at(ENSMock.address);

      await deployer.deploy(ENSRegistrarMock, ens.address, config.ens.nameInfo.rootNode.nameHash);

      const ensRegistrar = await ENSRegistrarMock.at(ENSRegistrarMock.address);

      await ens.setSubnodeOwner('0x00', getEnsLabelHash(config.ens.nameInfo.rootNode.name), ensRegistrar.address);

      await ensRegistrar.register(
        config.ens.nameInfo.labelHash,
        accountProvider.address,
      );

      await accountProvider.initialize(
        registry.address,
        guardian.address,
        ens.address,
        accountProxy.address,
      );

      await accountProvider.addEnsRootNode(config.ens.nameInfo.nameHash);

      // info
      console.info('ENS_CONTRACT_ADDRESS', ENSMock.address);
      console.info('ACCOUNT_PROVIDER_CONTRACT_ADDRESS', AccountProvider.address);
      console.info('ACCOUNT_PROXY_CONTRACT_ADDRESS', AccountProxy.address);
      console.info();
      break;
    }

    default:
  }
};
