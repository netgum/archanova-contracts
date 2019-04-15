const { ZERO_ADDRESS } = require('../shared/constants');

const Account = artifacts.require('Account');
const AccountProvider = artifacts.require('AccountProvider');
const AccountProxy = artifacts.require('AccountProxy');
const ENSRegistry = artifacts.require('ENSRegistry');

module.exports = async (deployer, network, addresses) => {
  if (network === 'test') {
    return;
  }

  let ens;

  if (network === 'main') {
    ens = null;
  } else {
    await deployer.deploy(ENSRegistry);
    ens = await ENSRegistry.at(ENSRegistry.address);
  }

  if (!ens) {
    return;
  }

  await deployer.deploy(Account);
  await deployer.deploy(AccountProxy);

  const guardianDevice = addresses[1];
  const guardian = await Account.at(Account.address);
  const accountProxy = await AccountProxy.at(AccountProxy.address);

  deployer.deploy(
    AccountProvider,
    guardian.address,
    Account.binary,
    accountProxy.address,
    ens.address,
  );

  await guardian.initialize([
    guardianDevice,
  ], 0, ZERO_ADDRESS);
};
