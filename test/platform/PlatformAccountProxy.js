/* eslint-env mocha */
/* eslint-disable no-underscore-dangle */

const expect = require('expect');
const BN = require('bn.js');
const { ZERO_ADDRESS } = require('@netgum/utils');
const { AccountAccessTypes } = require('../constants');
const { getGasPrice } = require('../utils');

const Account = artifacts.require('Account');
const PlatformAccountProxy = artifacts.require('PlatformAccountProxy');

contract.only('PlatformAccountProxy', (addresses) => {
  describe('views', () => {
    let account;
    let platformAccountProxy;
    let nonce = new BN(0);

    const DEVICES = {
      owner: addresses[1],
      virtualLimited: addresses[2],
      virtualUnlimited: addresses[3],
      invalid: addresses[4],
    };

    const PURPOSE = addresses[5];
    const LIMIT = new BN(1000);

    before(async () => {
      account = await Account.new(DEVICES.owner);

      platformAccountProxy = await PlatformAccountProxy.new();

      await account.addDevice(platformAccountProxy.address, AccountAccessTypes.OWNER, {
        from: DEVICES.owner,
      });

      await platformAccountProxy.addAccountVirtualDevice(
        account.address,
        nonce,
        DEVICES.virtualLimited,
        PURPOSE,
        LIMIT,
        false,
        0,
        '0x', {
          from: DEVICES.owner,
        },
      );

      nonce = nonce.add(new BN(1));

      await platformAccountProxy.addAccountVirtualDevice(
        account.address,
        nonce,
        DEVICES.virtualUnlimited,
        PURPOSE,
        0,
        true,
        0,
        '0x', {
          from: DEVICES.owner,
        },
      );

      nonce = nonce.add(new BN(1));
    });

    describe('getAccountNonce()', () => {
      it('expect to return account nonce', async () => {
        expect(await platformAccountProxy.getAccountNonce(account.address))
          .toEqualBN(nonce);
      });
    });

    describe('getAccountVirtualDevice()', () => {
      it('expect to return limited virtual device', async () => {
        const data = await platformAccountProxy.getAccountVirtualDevice(
          account.address,
          DEVICES.virtualLimited,
        );

        expect(data._purpose)
          .toBe(PURPOSE);
        expect(data._limit)
          .toEqualBN(LIMIT);
        expect(data._unlimited)
          .toBeFalsy();
      });

      it('expect to return unlimited virtual device', async () => {
        const data = await platformAccountProxy.getAccountVirtualDevice(
          account.address,
          DEVICES.virtualUnlimited,
        );

        expect(data._purpose)
          .toBe(PURPOSE);
        expect(data._limit)
          .toEqualBN(new BN(0));
        expect(data._unlimited)
          .toBeTruthy();
      });

      it('expect to return invalid virtual device', async () => {
        const data = await platformAccountProxy.getAccountVirtualDevice(
          account.address,
          DEVICES.invalid,
        );

        expect(data._purpose)
          .toBe(ZERO_ADDRESS);
        expect(data._limit)
          .toEqualBN(new BN(0));
        expect(data._unlimited)
          .toBeFalsy();
      });
    });

    describe('accountVirtualDeviceExists()', () => {
      it('expect to return true when virtual device exists', async () => {
        expect(await platformAccountProxy.accountVirtualDeviceExists(
          account.address,
          DEVICES.virtualLimited,
        ))
          .toBeTruthy();

        expect(await platformAccountProxy.accountVirtualDeviceExists(
          account.address,
          DEVICES.virtualUnlimited,
        ))
          .toBeTruthy();
      });

      it('expect to return false when virtual device doesn\'t exists', async () => {
        expect(await platformAccountProxy.accountVirtualDeviceExists(
          account.address,
          DEVICES.invalid,
        ))
          .toBeFalsy();
      });
    });
  });

  describe.only('methods', () => {
    let gasPrice;
    let account;
    let platformAccountProxy;
    let nonce = new BN(0);

    const DEVICES = {
      owner: addresses[1],
      delegate: addresses[2],
      invalid: addresses[3],
    };

    before(async () => {
      gasPrice = await getGasPrice();
      account = await Account.new(DEVICES.owner);
      platformAccountProxy = await PlatformAccountProxy.new();
    });

    describe('forwardAccountOwnerCall', () => {
      it('expect to forward call to account', async () => {

      });
    });
  });
});
