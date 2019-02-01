/* eslint-disable no-console */
const { getEnsLabelHash } = require('@netgum/utils');
const config = require('../config');

const ENSMock = artifacts.require('ENSMock');
const ENSRegistrarMock = artifacts.require('ENSRegistrarMock');
const Guardian = artifacts.require('Guardian');
const PlatformAccount = artifacts.require('PlatformAccount');
const PlatformAccountProvider = artifacts.require('PlatformAccountProvider');
const PlatformAccountProxy = artifacts.require('PlatformAccountProxy');

module.exports = async (deployer, network) => {
  switch (network) {
    case 'development': {
      const { ensNode } = config.platform.accountProvider;

      await deployer.deploy(ENSMock);

      await deployer.deploy(PlatformAccountProxy);

      await deployer.deploy(
        PlatformAccountProvider,
        ENSMock.address,
        ensNode.nameHash,
        Guardian.address,
        PlatformAccountProxy.address,
        PlatformAccount.binary,
      );

      await deployer.deploy(ENSRegistrarMock,
        ENSMock.address,
        ensNode.rootNode.nameHash,
      );

      const ens = await ENSMock.at(ENSMock.address);
      const ensRegistrar = await ENSRegistrarMock.at(ENSRegistrarMock.address);

      await ens.setSubnodeOwner('0x00', getEnsLabelHash(ensNode.rootNode.name), ensRegistrar.address);

      await ensRegistrar.register(
        ensNode.labelHash,
        PlatformAccountProvider.address,
      );

      // info
      console.info('   PLATFORM_ACCOUNT_PROVIDER_CONTRACT', PlatformAccountProvider.address);
      console.info('   PLATFORM_ACCOUNT_PROXY_CONTRACT', PlatformAccountProxy.address);
      console.info();
      break;
    }

    default:
  }
};
