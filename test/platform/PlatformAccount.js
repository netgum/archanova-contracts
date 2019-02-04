/* eslint-env mocha */

const expect = require('expect');
const BN = require('bn.js');
const { AccountAccessTypes } = require('../constants');
const { getBalance, getGasPrice } = require('../utils');

const PlatformAccount = artifacts.require('PlatformAccount');

contract('PlatformAccount', (addresses) => {
  describe('methods', () => {
    const DEVICES = [
      addresses[0],
      addresses[1],
    ];

    describe('initialize()', () => {
      it('expect to initialize with OWNER devices', async () => {
        const platformAccount = await PlatformAccount.new();
        await platformAccount.initialize(DEVICES, 0);

        expect(await platformAccount.getDeviceAccessType(DEVICES[0]))
          .toEqualBN(AccountAccessTypes.OWNER);

        expect(await platformAccount.getDeviceAccessType(DEVICES[1]))
          .toEqualBN(AccountAccessTypes.OWNER);
      });

      it('expect to initialize with OWNER devices and refund to msg.sender', async () => {
        const gasPrice = await getGasPrice();
        const refundAmount = new BN(1000);
        const initializer = addresses[1];

        const platformAccount = await PlatformAccount.new({
          from: initializer,
        });
        await platformAccount.send(refundAmount);

        expect(await getBalance(platformAccount))
          .toEqualBN(refundAmount);

        const initializerBalance = await getBalance(initializer);

        const { receipt: { gasUsed } } = await platformAccount.initialize(DEVICES, refundAmount, {
          from: initializer,
          gasPrice,
        });

        expect(await getBalance(initializer))
          .toEqualBN(
            initializerBalance
              .add(refundAmount)
              .sub(gasPrice.mul(new BN(gasUsed))),
          );

        expect(await getBalance(platformAccount))
          .toEqualBN(new BN(0));

        expect(await platformAccount.getDeviceAccessType(DEVICES[0]))
          .toEqualBN(AccountAccessTypes.OWNER);

        expect(await platformAccount.getDeviceAccessType(DEVICES[1]))
          .toEqualBN(AccountAccessTypes.OWNER);
      });
    });
  });
});
