const {
  sha3,
  padLeft,
} = require('web3-utils');

function getEnsLabelHash(name) {
  const [label] = name.split('.');
  return sha3(label);
}

function getEnsNameHash(name) {
  let result = padLeft('0x0', 64);
  const labels = name.split('.');

  for (let i = labels.length - 1; i >= 0; i -= 1) {
    const labelHash = sha3(labels[i])
      .substr(2);
    result = sha3(`${result}${labelHash}`);
  }

  return result;
}

module.exports = {
  getEnsLabelHash,
  getEnsNameHash,
};
