const { resolve, join } = require('path');
const { readJSON, writeFile } = require('fs-extra');
const { sha3 } = require('web3-utils');
const config = require('../truffle');

const buildPath = resolve(__dirname, '../build/contracts');
const distFile = resolve(__dirname, '../dist/data.js');

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
  AccountFriendRecovery: {
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
  ExampleToken: {
    addAddresses: true,
  },
  ERC20Token: {
    contract: 'ExampleToken',
    addAbi: true,
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
  let data;

  try {
    data = require(distFile); // eslint-disable-line global-require,import/no-dynamic-require
  } catch (err) {
    data = {};
  }

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

        const previous = data[name] || {
          abi: null,
          byteCodeHash: null,
          addresses: {},
        };

        const next = await readJSON(join(buildPath, `${contract}.json`));

        const abi = !addAbi
          ? null
          : previous.abi || next.abi;

        const addresses = !addAddresses
          ? {}
          : {
            ...previous.addresses,
            ...networksToAddresses(next.networks),
          };

        const byteCodeHash = !addByteCodeHash
          ? null
          : previous.byteCodeHash || sha3(next.bytecode);

        return {
          name,
          addresses,
          abi,
          byteCodeHash,
        };
      }),
  );

  const content = `/* eslint-disable */
module.exports = ${contractsToExport(contracts)};
`;

  await writeFile(distFile, content, 'utf8');
}

main()
  .catch(console.error); // eslint-disable-line no-console
