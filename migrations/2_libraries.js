const ECDSA = artifacts.require('ECDSA');

const Guardian = artifacts.require('Guardian');
const PlatformAccountProvider = artifacts.require('PlatformAccountProvider');
const PlatformAccountProxy = artifacts.require('PlatformAccountProxy');

module.exports = async (deployer) => {
  await deployer.deploy(ECDSA);

  deployer.link(ECDSA, Guardian);
  deployer.link(ECDSA, PlatformAccountProvider);
  deployer.link(ECDSA, PlatformAccountProxy);
};
