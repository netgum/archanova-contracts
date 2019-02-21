/* eslint-disable no-console */

const { getEnsLabelHash, getEnsNameHash } = require('@netgum/utils');
const config = require('../config');

const ENSRegistry = artifacts.require('ENSRegistry');
const FIFSRegistrar = artifacts.require('FIFSRegistrar');
const Account = artifacts.require('Account');
const PlatformAccount = artifacts.require('PlatformAccount');
const PlatformAccountProvider = artifacts.require('PlatformAccountProvider');
const PlatformAccountProxy = artifacts.require('PlatformAccountProxy');
const PlatformStateTokenFactory = artifacts.require('PlatformStateTokenFactory');
const StateToken = artifacts.require('StateToken');

module.exports = async (deployer, network) => {
  switch (network) {
    case 'development': {
      const { ensNode } = config.platform.accountProvider;

      await deployer.deploy(ENSRegistry);

      await deployer.deploy(PlatformAccountProxy);

      await deployer.deploy(
        PlatformAccountProvider,
        ENSRegistry.address,
        ensNode.nameHash,
        Account.address,
        PlatformAccountProxy.address,
        PlatformAccount.binary,
      );

      await deployer.deploy(
        PlatformStateTokenFactory,
        30 * 24 * 60 * 60, // 30 days
        StateToken.binary,
      );

      await deployer.deploy(
        FIFSRegistrar,
        ENSRegistry.address,
        ensNode.rootNode.nameHash,
      );

      const ens = await ENSRegistry.at(ENSRegistry.address);
      const ensRegistrar = await FIFSRegistrar.at(FIFSRegistrar.address);

      await ens.setSubnodeOwner('0x00', getEnsLabelHash(ensNode.rootNode.name), ensRegistrar.address);

      await ensRegistrar.register(
        ensNode.labelHash,
        PlatformAccountProvider.address,
      );

      // ethparis account provider
      const customAccountProvider = await PlatformAccountProvider.new(
        ENSRegistry.address,
        getEnsNameHash('ethparis.test'),
        Account.address,
        PlatformAccountProxy.address,
        PlatformAccount.binary,
      );

      await ensRegistrar.register(
        getEnsLabelHash('ethparis.test'),
        customAccountProvider.address,
      );

      // info
      console.info('   ENS_REGISTRY_CONTRACT', ENSRegistry.address);
      console.info('   PLATFORM_ACCOUNT_PROVIDER_CONTRACT_ROOT', PlatformAccountProvider.address);
      console.info('   PLATFORM_ACCOUNT_PROVIDER_CONTRACT_CUSTOM', customAccountProvider.address);
      console.info('   PLATFORM_ACCOUNT_PROXY_CONTRACT', PlatformAccountProxy.address);
      console.info('   PLATFORM_STATE_TOKEN_FACTORY', PlatformStateTokenFactory.address);
      console.info();
      break;
    }

    default:
  }
};
