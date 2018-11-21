const { anyToBuffer, anyToHex, signPersonalMessage } = require('@netgum/utils');
const bip39 = require('bip39');
const hdKey = require('ethereumjs-wallet/hdkey');
const config = require('../config');

const privateKeys = new Map();
const hdWallet = hdKey.fromMasterSeed(bip39.mnemonicToSeed(config.mnemonic));

for (let i = 0; i < 10; i++) {
  const wallet = hdWallet.derivePath(`m/44'/60'/0'/0/${i}`).getWallet();
  const privateKey = anyToBuffer(wallet.getPrivateKey(), {
    autoStringDetect: true,
  });

  const address = anyToHex(wallet.getAddress(), {
    add0x: true,
  });

  privateKeys.set(address, privateKey);
}

module.exports = {
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
