const { getEnsNameHash, getEnsLabelHash } = require('@netgum/utils');

const ENSMock = artifacts.require('ENSMock');
const ENSRegistrarMock = artifacts.require('ENSRegistrarMock');
const ENSResolverMock = artifacts.require('ENSResolverMock');
const Account = artifacts.require('Account');


async function createAccount(device) {
  const account = await Account.new();
  await account.initialize([device]);
  return account;
}

async function createEnsContracts() {
  const ens = await ENSMock.new();
  const ensRegistrar = await ENSRegistrarMock.new(ens.address, getEnsNameHash('test'));
  const ensResolver = await ENSResolverMock.new(ens.address);

  await ens.setSubnodeOwner('0x00', getEnsLabelHash('test'), ensRegistrar.address);

  return {
    ens,
    ensRegistrar,
    ensResolver,
  };
}

module.exports = {
  createAccount,
  createEnsContracts,
};
