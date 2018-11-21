const BytesSignatureLibrary = artifacts.require('BytesSignatureLibrary');
const Account = artifacts.require('Account');

module.exports = async (deployer) => {
  await deployer.deploy(BytesSignatureLibrary);

  deployer.link(BytesSignatureLibrary, Account);

  await deployer.deploy(Account);
};
