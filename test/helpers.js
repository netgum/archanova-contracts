const { getEnsNameHash, getEnsLabelHash } = require('@netgum/utils');

const ENSMock = artifacts.require('ENSMock');
const ENSRegistrarMock = artifacts.require('ENSRegistrarMock');
const Account = artifacts.require('Account');

async function createAccount(...devices) {
  const account = await Account.new();
  await account.initialize(devices);

  return account;
}

async function createEnsContracts() {
  const ens = await ENSMock.new();

  const ensRegistrar = await ENSRegistrarMock.new(ens.address, getEnsNameHash('test'));

  await ens.setSubnodeOwner('0x00', getEnsLabelHash('test'), ensRegistrar.address);

  return {
    ens,
    ensRegistrar,
  };
}

module.exports = {
  createAccount,
  createEnsContracts,
};
