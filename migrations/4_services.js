const BytesSignatureLibrary = artifacts.require('BytesSignatureLibrary');
const AccountLibrary = artifacts.require('AccountLibrary');
const AccountService = artifacts.require('AccountService');

module.exports = async (deployer) => {
  deployer.link(BytesSignatureLibrary, AccountService);
  deployer.link(AccountLibrary, AccountService);
};
