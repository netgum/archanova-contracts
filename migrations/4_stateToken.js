const AccountLibrary = artifacts.require('AccountLibrary');
const StateTokenService = artifacts.require('StateTokenService');

module.exports = async (deployer) => {
  deployer.link(AccountLibrary, StateTokenService);
};
