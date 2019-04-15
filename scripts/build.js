const { resolve, join } = require('path');
const { readJSON, writeFile } = require('fs-extra');
const { sha3 } = require('web3-utils');

const buildPath = resolve(__dirname, '../build/contracts');
const distFile = resolve(__dirname, '../dist/index.js');

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
  VirtualPaymentManager: {
    addAddresses: true,
  },
};

async function main() {
  const contracts = await Promise.all(
    Object
      .entries(schemas)
      .map(async ([contractName, { addByteCodeHash, addAddresses }]) => {
        const { abi, bytecode, networks } = await readJSON(join(buildPath, `${contractName}.json`));

        return {
          contractName,
          abi,
          byteCodeHash: !addByteCodeHash ? null : sha3(bytecode),
          addresses: !addAddresses ? {} : Object
            .entries(networks)
            .map(([key, { address }]) => ({
              key,
              address,
            }))
            .reduce((result, { key, address }) => ({
              ...result,
              [key]: address,
            }), {}),
        };
      }),
  );

  const output = contracts.reduce((result, { contractName, ...data }) => ({
    ...result,
    [contractName]: data,
  }), {});

  const content = `/* eslint-disable */

module.exports = ${JSON.stringify(output, null, 2)};
`;

  await writeFile(distFile, content, 'utf8');
}

main()
  .catch(console.error);
