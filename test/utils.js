const BN = require('bn.js');
const bip39 = require('bip39');
const hdKey = require('ethereumjs-wallet/hdkey');
const {
  anyToBuffer,
  anyToHex,
  targetToAddress,
  signPersonalMessage,
} = require('@netgum/utils');
const config = require('../config');

const privateKeys = (() => {
  const result = new Map();
  const hdWallet = hdKey.fromMasterSeed(bip39.mnemonicToSeed(config.accounts.mnemonic));

  for (let i = 0; i < config.accounts.count; i += 1) {
    const wallet = hdWallet.derivePath(`m/44'/60'/0'/0/${i}`)
      .getWallet();
    const privateKey = anyToBuffer(wallet.getPrivateKey(), {
      autoStringDetect: true,
    });

    const address = anyToHex(wallet.getAddress(), {
      add0x: true,
    });

    result.set(address, privateKey);
  }

  return result;
})();

async function getBalance(target) {
  const value = await web3.eth.getBalance(
    targetToAddress(target),
  );
  return new BN(value, 10);
}

async function getGasPrice() {
  const value = await web3.eth.getGasPrice();
  return new BN(value, 10);
}

function signMessage(message, address) {
  let result = null;
  const privateKey = privateKeys.get(
    anyToHex(
      address, {
        add0x: true,
      },
    ),
  );

  if (privateKey) {
    try {
      result = anyToHex(
        signPersonalMessage(message, privateKey), {
          add0x: true,
        },
      );
    } catch (err) {
      result = null;
    }
  }

  return result;
}

module.exports = {
  getBalance,
  getGasPrice,
  signMessage,
};
