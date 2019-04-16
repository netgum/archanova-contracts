const { resolve, join } = require('path');
const { readJSON, writeFile } = require('fs-extra');
const { sha3 } = require('web3-utils');
const config = require('../truffle');

const buildPath = resolve(__dirname, '../build/contracts');
const distFile = resolve(__dirname, '../dist/index.js');

const supportedNetworks = Object.values(config.networks)
  .map(({ network_id: id }) => id)
  .filter(id => id !== '*');

const schemas = {
  Account: {
    addByteCodeHash: true,
  },
  AccountProvider: {
    addAddresses: true,
  },
  AccountProxy: {
    addAddresses: true,
  },
  ENSRegistry: {
    addAddresses: true,
  },
  AbstractENSAddrResolver: {
    name: 'ENSResolver',
  },
  VirtualPaymentManager: {
    addAddresses: true,
  },
};

function networksToAddresses(networks) {
  return Object
    .entries(networks)
    .map(([key, { address }]) => ({
      key,
      address,
    }))
    .filter(key => supportedNetworks.includes(key))
    .reduce((result, { key, address }) => ({
      ...result,
      [key]: address,
    }), {});
}

function contractsToExport(contracts) {
  return JSON.stringify(
    contracts.reduce((result, { name, ...data }) => ({
      ...result,
      [name]: data,
    }), {}),
    null,
    2,
  );
}

async function main() {
  const contracts = await Promise.all(
    Object
      .entries(schemas)
      .map(async ([key, { name, addByteCodeHash, addAddresses }]) => {
        const { abi, bytecode, networks } = await readJSON(join(buildPath, `${key}.json`));

        return {
          abi,
          name: name || key,
          byteCodeHash: !addByteCodeHash ? null : sha3(bytecode),
          addresses: !addAddresses ? {} : networksToAddresses(networks),
        };
      }),
  );

  const content = `/* eslint-disable */

module.exports = ${contractsToExport(contracts)};
`;

  await writeFile(distFile, content, 'utf8');
}

main()
  .catch(console.error);
