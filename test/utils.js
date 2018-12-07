const {
  anyToBuffer,
  anyToHex,
  signPersonalMessage,
  abiEncodePacked,
  sha3,
} = require('@netgum/utils');
const BN = require('bn.js');
const bip39 = require('bip39');
const hdKey = require('ethereumjs-wallet/hdkey');
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

  computeCreate2Address: (deployer, salt, byteCode) => {
    const payload = abiEncodePacked(
      'bytes',
      'address',
      'bytes32',
      'bytes',
    )(
      '0xFF',
      deployer,
      salt,
      sha3(byteCode),
    );

    return anyToHex(sha3(payload)
      .slice(-20), {
      add0x: true,
    });
  },

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
