const { getEnsNameHash, getEnsLabelHash } = require('@netgum/utils');

const ENSRegistry = artifacts.require('ENSRegistry');
const FIFSRegistrar = artifacts.require('FIFSRegistrar');

async function createEnsContracts() {
  const ens = await ENSRegistry.new();

  const ensRegistrar = await FIFSRegistrar.new(ens.address, getEnsNameHash('test'));

  await ens.setSubnodeOwner('0x00', getEnsLabelHash('test'), ensRegistrar.address);

  return {
    ens,
    ensRegistrar,
  };
}

module.exports = {
  createEnsContracts,
};
