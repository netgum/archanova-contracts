const BytesSignatureLibrary = artifacts.require('BytesSignatureLibrary');
const SharedAccountLibrary = artifacts.require('SharedAccountLibrary');
const AccountCreatorBasicService = artifacts.require('AccountCreatorBasicService');
const StateTokenBasicService = artifacts.require('StateTokenBasicService');

module.exports = async (deployer) => {
  deployer.link(BytesSignatureLibrary, AccountCreatorBasicService);
  deployer.link(SharedAccountLibrary, AccountCreatorBasicService);

  deployer.link(BytesSignatureLibrary, StateTokenBasicService);
  deployer.link(SharedAccountLibrary, StateTokenBasicService);
};
