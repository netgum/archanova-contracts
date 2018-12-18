const BytesSignatureLibrary = artifacts.require('BytesSignatureLibrary');
const AccountLibrary = artifacts.require('AccountLibrary');

module.exports = async (deployer) => {
  await deployer.deploy(BytesSignatureLibrary);

  deployer.link(BytesSignatureLibrary, AccountLibrary);

  await deployer.deploy(AccountLibrary);
};
