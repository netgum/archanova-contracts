const { getEnsNameHash, getEnsLabelHash } = require('@netgum/utils');

const ENSMock = artifacts.require('ENSMock');
const ENSRegistrarMock = artifacts.require('ENSRegistrarMock');
const ENSResolverMock = artifacts.require('ENSResolverMock');
const Account = artifacts.require('Account');


async function createAccount(device, from) {
  const account = await Account.new({
    from,
  });
  await account.initialize([device], {
    from,
  });
  return account;
}

async function createEnsContracts(from) {
  const ens = await ENSMock.new({
    from,
  });
  const ensRegistrar = await ENSRegistrarMock.new(ens.address, getEnsNameHash('test'), {
    from,
  });
  const ensResolver = await ENSResolverMock.new(ens.address, {
    from,
  });

  await ens.setSubnodeOwner('0x00', getEnsLabelHash('test'), ensRegistrar.address, {
    from,
  });

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
