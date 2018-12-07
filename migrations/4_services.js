const BytesSignatureLibrary = artifacts.require('BytesSignatureLibrary');
const AccountLibrary = artifacts.require('AccountLibrary');
const AccountBasicService = artifacts.require('AccountBasicService');

module.exports = async (deployer) => {
  deployer.link(BytesSignatureLibrary, AccountBasicService);
  deployer.link(AccountLibrary, AccountBasicService);
};
