const BytesSignatureLibrary = artifacts.require('BytesSignatureLibrary');
const AccountLibrary = artifacts.require('AccountLibrary');
const AccountCreatorService = artifacts.require('AccountCreatorService');
const AccountProxyService = artifacts.require('AccountProxyService');

module.exports = async (deployer) => {
  deployer.link(BytesSignatureLibrary, AccountCreatorService);
  deployer.link(AccountLibrary, AccountCreatorService);

  deployer.link(BytesSignatureLibrary, AccountProxyService);
  deployer.link(AccountLibrary, AccountProxyService);
};
