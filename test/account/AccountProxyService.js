/* eslint-env mocha */

const expect = require('expect');
const BN = require('bn.js');
const { ZERO_ADDRESS } = require('@netgum/utils');
const { createAccount } = require('../../shared/helpers');

const AccountProxyService = artifacts.require('AccountProxyService');

contract('AccountProxyService', (addresses) => {
  describe('views', () => {
    let account;
    let accountProxyService;

    const accountDevice = addresses[1];
    const virtualDevice = addresses[2];
    const virtualDevicePurpose = addresses[4];
    const virtualDeviceLimit = new BN(10);

    const from = addresses[3];

    before(async () => {
      accountProxyService = await AccountProxyService.new();
      account = await createAccount(from, accountDevice, accountProxyService.address);

      await accountProxyService.connectAccount(account.address);
      await accountProxyService.addAccountVirtualDevice(
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
        const response = await accountProxyService.getAccount(account.address);

        expect(response[0])
          .toBeTruthy();
        expect(response[1])
          .toEqualBN(new BN(1));
      });

      it('expect to return empty struct when account is disconnected', async () => {
        const unknownAccount = addresses[5];
        const response = await accountProxyService.getAccount(unknownAccount);

        expect(response[0])
          .toBeFalsy();
        expect(response[1])
          .toEqualBN(new BN(0));
      });
    });

    describe('getAccountVirtualDevice()', () => {
      it('expect to return account virtual device', async () => {
        const response = await accountProxyService.getAccountVirtualDevice(account.address, virtualDevice);

        expect(response[0])
          .toBe(virtualDevicePurpose);
        expect(response[1])
          .toEqualBN(virtualDeviceLimit);
        expect(response[2])
          .toBeFalsy();
      });

      it('expect to return empty struct when account virtual device doesn\'t exists', async () => {
        const unknownDevice = addresses[5];
        const response = await accountProxyService.getAccountVirtualDevice(account.address, unknownDevice);

        expect(response[0])
          .toBe(ZERO_ADDRESS);
        expect(response[1])
          .toEqualBN(new BN(0));
        expect(response[2])
          .toBeFalsy();
      });
    });
  });
});
