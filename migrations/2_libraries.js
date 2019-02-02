const ECDSA = artifacts.require('ECDSA');

const AccountLibrary = artifacts.require('AccountLibrary');
const AccountLibraryExample = artifacts.require('AccountLibraryExample');
const Guardian = artifacts.require('Guardian');
const PlatformAccountProvider = artifacts.require('PlatformAccountProvider');
const PlatformAccountProxy = artifacts.require('PlatformAccountProxy');

module.exports = async (deployer) => {
  await deployer.deploy(ECDSA);

  deployer.link(ECDSA, AccountLibrary);

  await deployer.deploy(AccountLibrary);

  deployer.link(AccountLibrary, AccountLibraryExample);

  deployer.link(ECDSA, Guardian);
  deployer.link(ECDSA, PlatformAccountProvider);
  deployer.link(ECDSA, PlatformAccountProxy);
};
