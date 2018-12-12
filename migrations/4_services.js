const BytesSignatureLibrary = artifacts.require('BytesSignatureLibrary');
const AccountLibrary = artifacts.require('AccountLibrary');
const AccountService = artifacts.require('AccountService');
const AccountProxyService = artifacts.require('AccountProxyService');

module.exports = async (deployer) => {
  deployer.link(BytesSignatureLibrary, AccountService);
  deployer.link(AccountLibrary, AccountService);

  deployer.link(BytesSignatureLibrary, AccountProxyService);
  deployer.link(AccountLibrary, AccountProxyService);
};
