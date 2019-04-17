const data = require('./data');

const ContractNames = Object.keys(data)
  .reduce((result, key) => ({
    [key]: key,
    ...result,
  }), {});

function getContractAddress(contractName, network) {
  let result;

  if (data[contractName]) {
    result = data[contractName].addresses[network];
  }

  return result || null;
}

function getContractAbi(contractName) {
  let result;

  if (data[contractName]) {
    result = data[contractName].abi;
  }

  return result || null;
}

function getContractByteCodeHash(contractName) {
  let result;

  if (data[contractName]) {
    result = data[contractName].byteCodeHash;
  }

  return result || null;
}

module.exports = {
  ContractNames,
  getContractAddress,
  getContractAbi,
  getContractByteCodeHash,
};
