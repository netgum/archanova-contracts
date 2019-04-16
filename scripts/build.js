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
    addAbi: true,
    addByteCodeHash: true,
  },
  AccountProvider: {
    addAbi: true,
    addAddresses: true,
  },
  AccountProxy: {
    addAbi: true,
    addAddresses: true,
  },
  ENSRegistry: {
    addAbi: true,
    addAddresses: true,
  },
  ENSResolver: {
    addAbi: true,
    contract: 'AbstractENSAddrResolver',
  },
  Guardian: {
    contract: 'Account',
    addAddresses: true,
  },
  VirtualPaymentManager: {
    addAbi: true,
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
    .filter(({ key, address }) => !!address && supportedNetworks.includes(key))
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
      .map(async ([name, schema]) => {
        const {
          addAbi,
          addByteCodeHash,
          addAddresses,
        } = schema;

        let {
          contract,
        } = schema;

        if (!contract) {
          contract = name;
        }

        const { abi, bytecode, networks } = await readJSON(join(buildPath, `${contract}.json`));

        return {
          name,
          abi: !addAbi ? null : abi,
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
