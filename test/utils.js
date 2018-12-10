const BN = require('bn.js');
const bip39 = require('bip39');
const hdKey = require('ethereumjs-wallet/hdkey');
const {
  anyToBuffer,
  anyToHex,
  signPersonalMessage,
} = require('@netgum/utils');
const { accounts } = require('../config');

const privateKeys = new Map();
const hdWallet = hdKey.fromMasterSeed(bip39.mnemonicToSeed(accounts.mnemonic));

for (let i = 0; i < accounts.count; i += 1) {
  const wallet = hdWallet.derivePath(`m/44'/60'/0'/0/${i}`)
    .getWallet();
  const privateKey = anyToBuffer(wallet.getPrivateKey(), {
    autoStringDetect: true,
  });

  const address = anyToHex(wallet.getAddress(), {
    add0x: true,
  });

  privateKeys.set(address, privateKey);
}

module.exports = {
  getBalance: async (address) => {
    const value = await web3.eth.getBalance(address);
    return new BN(value, 10);
  },

  getGasPrice: async () => {
    const value = await web3.eth.getGasPrice();
    return new BN(value, 10);
  },

  signPersonalMessage: (message, address) => {
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
  },
};
