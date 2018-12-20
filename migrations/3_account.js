const BytesSignatureLibrary = artifacts.require('BytesSignatureLibrary');
const AccountLibrary = artifacts.require('AccountLibrary');
const AccountProvider = artifacts.require('AccountProvider');
const AccountProxy = artifacts.require('AccountProxy');

module.exports = async (deployer) => {
  deployer.link(BytesSignatureLibrary, AccountProvider);
  deployer.link(AccountLibrary, AccountProvider);

  deployer.link(BytesSignatureLibrary, AccountProxy);
  deployer.link(AccountLibrary, AccountProxy);
};
