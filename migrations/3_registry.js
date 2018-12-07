const AccountLibrary = artifacts.require('AccountLibrary');
const Registry = artifacts.require('Registry');

module.exports = async (deployer) => {
  deployer.link(AccountLibrary, Registry);
};
