const {
  currentProvider,
  eth: {
    sign,
    getGasPrice: web3GetGasPrice,
    getBalance: web3GetBalance,
  },
  utils: {
    BN,
    sha3,
    soliditySha3,
    toHex,
    toWei,
    padLeft,
    toChecksumAddress,
  },
} = web3;

function getMethodSign(name, ...params) {
  return sha3(`${name}(${params.join(',')})`)
    .substr(0, 10);
}

function increaseTime(seconds) {
  return new Promise((resolve, reject) => {
    currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [
        BN.isBN(seconds) ? seconds.toNumber() : seconds,
      ],
      id: Date.now(),
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(new BN(data.result));
      }
    });
  });
}

function getGasPrice() {
  return web3GetGasPrice()
    .then(value => new BN(value, 10));
}

function getBalance(address) {
  return web3GetBalance(address)
    .then(value => new BN(value, 10));
}

function logGasUsed({ receipt: { gasUsed } }) {
  // eslint-disable-next-line no-console
  console.log(
    `${' '.repeat(7)}⛽`,
    `gas used: ${gasUsed} ⤵︎`,
  );
}

function getCost({ receipt: { gasUsed } }, gasPrice) {
  return gasPrice.mul(new BN(gasUsed));
}

function now() {
  return new BN(Math.floor(Date.now() / 1000));
}

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

function computeContractAddress(deployer, salt, byteCode) {
  const hash = soliditySha3(
    '0xff',
    deployer,
    salt,
    sha3(byteCode),
  );

  return toChecksumAddress(
    `0x${hash.substr(-40)}`,
  );
}

module.exports = {
  BN,
  soliditySha3,
  sign,
  toHex,
  toWei,
  getMethodSign,
  increaseTime,
  logGasUsed,
  getGasPrice,
  getBalance,
  getCost,
  now,
  getEnsLabelHash,
  getEnsNameHash,
  computeContractAddress,
};
