const BytesSignatureLibrary = artifacts.require('BytesSignatureLibrary');

const Guardian = artifacts.require('Guardian');
const PlatformAccountProvider = artifacts.require('PlatformAccountProvider');
const PlatformAccountProxy = artifacts.require('PlatformAccountProxy');

module.exports = async (deployer) => {
  await deployer.deploy(BytesSignatureLibrary);

  deployer.link(BytesSignatureLibrary, Guardian);
  deployer.link(BytesSignatureLibrary, PlatformAccountProvider);
  deployer.link(BytesSignatureLibrary, PlatformAccountProxy);
};
