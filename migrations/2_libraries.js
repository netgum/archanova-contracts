const Address = artifacts.require('Address');
const ECDSA = artifacts.require('ECDSA');
const SafeMath = artifacts.require('SafeMath');

const AccountLibrary = artifacts.require('AccountLibrary');
const AccountProvider = artifacts.require('AccountProvider');
const AccountProxy = artifacts.require('AccountProxy');
const AddressLibrary = artifacts.require('AddressLibrary');
const AddressLibraryWrapper = artifacts.require('AddressLibraryWrapper');

module.exports = async (deployer) => {
  await deployer.deploy(Address);
  await deployer.deploy(ECDSA);
  await deployer.deploy(SafeMath);

  deployer.link(ECDSA, AccountLibrary);
  await deployer.deploy(AccountLibrary);

  deployer.link(AccountLibrary, AddressLibrary);
  deployer.link(Address, AddressLibrary);
  deployer.link(ECDSA, AddressLibrary);

  await deployer.deploy(AddressLibrary);

  deployer.link(AddressLibrary, AddressLibraryWrapper);
  deployer.link(ECDSA, AddressLibraryWrapper);

  deployer.link(AddressLibrary, AccountProvider);
  deployer.link(ECDSA, AccountProvider);

  deployer.link(AddressLibrary, AccountProxy);
  deployer.link(ECDSA, AccountProxy);
  deployer.link(SafeMath, AccountProxy);
};
