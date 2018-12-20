/* eslint-env mocha */

const expect = require('expect');
const BN = require('bn.js');
const { ZERO_ADDRESS } = require('@netgum/utils');
const { createAccount } = require('../helpers');

const AccountProxy = artifacts.require('AccountProxy');

contract('AccountProxy', (addresses) => {
  describe('views', () => {
    let account;
    let accountProxy;

    const accountDevice = addresses[1];
    const virtualDevice = addresses[2];
    const virtualDevicePurpose = addresses[4];
    const virtualDeviceLimit = new BN(10);

    before(async () => {
      accountProxy = await AccountProxy.new();
      account = await createAccount(accountDevice, accountProxy.address);

      await accountProxy.connectAccount(account.address);
      await accountProxy.addAccountVirtualDevice(
        account.address,
        0,
        virtualDevice,
        virtualDevicePurpose,
        virtualDeviceLimit,
        false,
        0,
        '0x', {
          from: accountDevice,
        },
      );
    });

    describe('getAccount()', () => {
      it('expect to return connected account', async () => {
        const response = await accountProxy.getAccount(account.address);

        expect(response[0])
          .toBeTruthy();
        expect(response[1])
          .toEqualBN(new BN(1));
      });

      it('expect to return empty struct when account is disconnected', async () => {
        const unknownAccount = addresses[5];
        const response = await accountProxy.getAccount(unknownAccount);

        expect(response[0])
          .toBeFalsy();
        expect(response[1])
          .toEqualBN(new BN(0));
      });
    });

    describe('getAccountVirtualDevice()', () => {
      it('expect to return account virtual device', async () => {
        const response = await accountProxy.getAccountVirtualDevice(account.address, virtualDevice);

        expect(response[0])
          .toBe(virtualDevicePurpose);
        expect(response[1])
          .toEqualBN(virtualDeviceLimit);
        expect(response[2])
          .toBeFalsy();
      });

      it('expect to return empty struct when account virtual device doesn\'t exists', async () => {
        const unknownDevice = addresses[5];
        const response = await accountProxy.getAccountVirtualDevice(account.address, unknownDevice);

        expect(response[0])
          .toBe(ZERO_ADDRESS);
        expect(response[1])
          .toEqualBN(new BN(0));
        expect(response[2])
          .toBeFalsy();
      });
    });

    describe('accountConnected()', () => {
      it('expect to return true when account is connected', async () => {
        const response = await accountProxy.accountConnected(account.address);

        expect(response)
          .toBeTruthy();
      });

      it('expect to return true false account is not connected', async () => {
        const unknownAccount = addresses[5];
        const response = await accountProxy.accountConnected(unknownAccount);

        expect(response)
          .toBeFalsy();
      });
    });

    describe('accountVirtualDeviceExists()', () => {
      it('expect to return true when virtual device exists', async () => {
        expect(await accountProxy.accountVirtualDeviceExists(account.address, virtualDevice))
          .toBeTruthy();
      });

      it('expect to return false when virtual device doesn\'t exists', async () => {
        const unknownDevice = addresses[5];
        expect(await accountProxy.accountVirtualDeviceExists(account.address, unknownDevice))
          .toBeFalsy();
      });
    });
  });

  describe('methods', () => {
    // TODO
  });
});
