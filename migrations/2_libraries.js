const BytesSignatureLibrary = artifacts.require('BytesSignatureLibrary');
const AccountLibrary = artifacts.require('AccountLibrary');
const AccountProvider = artifacts.require('AccountProvider');
const AccountProxy = artifacts.require('AccountProxy');
const StateTokenService = artifacts.require('StateTokenService');

module.exports = async (deployer) => {
  await deployer.deploy(BytesSignatureLibrary);

  deployer.link(BytesSignatureLibrary, AccountLibrary);

  await deployer.deploy(AccountLibrary);

  // account
  deployer.link(BytesSignatureLibrary, AccountProvider);
  deployer.link(AccountLibrary, AccountProvider);

  deployer.link(BytesSignatureLibrary, AccountProxy);
  deployer.link(AccountLibrary, AccountProxy);

  // state token
  deployer.link(AccountLibrary, StateTokenService);
};
