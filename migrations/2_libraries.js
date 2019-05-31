const Address = artifacts.require('Address');
const ECDSA = artifacts.require('ECDSA');
const SafeMath = artifacts.require('SafeMath');
const BytesLib = artifacts.require('BytesLib');

const AccountLibrary = artifacts.require('AccountLibrary');
const AccountProvider = artifacts.require('AccountProvider');
const AccountProxy = artifacts.require('AccountProxy');
const AccountFriendRecovery = artifacts.require('AccountFriendRecovery');
const AddressLibrary = artifacts.require('AddressLibrary');
const AddressLibraryWrapper = artifacts.require('AddressLibraryWrapper');
const VirtualPaymentManager = artifacts.require('VirtualPaymentManager');

module.exports = async (deployer) => {
  await deployer.deploy(Address);
  await deployer.deploy(ECDSA);
  await deployer.deploy(SafeMath);
  await deployer.deploy(BytesLib);

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
  deployer.link(SafeMath, AccountProvider);

  deployer.link(AddressLibrary, AccountProxy);
  deployer.link(ECDSA, AccountProxy);
  deployer.link(SafeMath, AccountProxy);

  deployer.link(AccountLibrary, AccountFriendRecovery);
  deployer.link(ECDSA, AccountFriendRecovery);
  deployer.link(SafeMath, AccountFriendRecovery);
  deployer.link(BytesLib, AccountFriendRecovery);

  deployer.link(AddressLibrary, VirtualPaymentManager);
  deployer.link(ECDSA, VirtualPaymentManager);
  deployer.link(SafeMath, VirtualPaymentManager);

};
