const BytesSignatureLibrary = artifacts.require('BytesSignatureLibrary');
const SharedAccountLibrary = artifacts.require('SharedAccountLibrary');
const Registry = artifacts.require('Registry');

module.exports = async (deployer) => {
  deployer.link(BytesSignatureLibrary, Registry);
  deployer.link(SharedAccountLibrary, Registry);
};
