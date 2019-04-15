/* eslint-env mocha */

const expect = require('expect');
const { ZERO_ADDRESS, ACCOUNT_ACCESS_TYPES } = require('../../shared/constants');
const {
  sign,
  soliditySha3,
} = require('../../shared/utils');

const Account = artifacts.require('Account');
const AddressLibraryWrapper = artifacts.require('AddressLibraryWrapper');

contract('AddressLibrary', (addresses) => {
  const accountDevices = {
    owner: addresses[1],
    delegate: addresses[2],
    removed: addresses[3],
    invalid: addresses[4],
  };
  const regularDevices = {
    valid: addresses[5],
    invalid: addresses[6],
  };
  const messageHash = soliditySha3(1, 2, 3);

  let addressLibrary;
  let account;

  before(async () => {
    addressLibrary = await AddressLibraryWrapper.new();
    account = await Account.new();

    await account.initialize([accountDevices.owner, accountDevices.removed], 0, ZERO_ADDRESS);
    await account.addDevice(accountDevices.delegate, ACCOUNT_ACCESS_TYPES.delegate, {
      from: accountDevices.owner,
    });
    await account.removeDevice(accountDevices.removed, {
      from: accountDevices.owner,
    });
  });

  describe('views', () => {
    describe('verifySignature()', () => {
      it('expect to return true on valid device signature', async () => {
        const output = await addressLibrary.verifySignature(
          regularDevices.valid,
          messageHash,
          await sign(messageHash, regularDevices.valid),
          true,
        );

        expect(output)
          .toBeTruthy();
      });

      it('expect to return false on invalid device signature', async () => {
        const output = await addressLibrary.verifySignature(
          regularDevices.valid,
          messageHash,
          await sign(messageHash, regularDevices.invalid),
          true,
        );

        expect(output)
          .toBeFalsy();
      });

      it('expect to return true on account OWNER device signature', async () => {
        const output = await addressLibrary.verifySignature(
          account.address,
          messageHash,
          await sign(messageHash, accountDevices.owner),
          true,
        );

        expect(output)
          .toBeTruthy();
      });

      it('expect to return true on account DELEGATE device signature', async () => {
        const output = await addressLibrary.verifySignature(
          account.address,
          messageHash,
          await sign(messageHash, accountDevices.delegate),
          true,
        );

        expect(output)
          .toBeTruthy();
      });

      it('expect to return false on account removed device signature when strict is on', async () => {
        const output = await addressLibrary.verifySignature(
          account.address,
          messageHash,
          await sign(messageHash, accountDevices.removed),
          true,
        );

        expect(output)
          .toBeFalsy();
      });

      it('expect to return true on account removed device signature when strict is off', async () => {
        const output = await addressLibrary.verifySignature(
          account.address,
          messageHash,
          await sign(messageHash, accountDevices.removed),
          false,
        );

        expect(output)
          .toBeTruthy();
      });

      it('expect to return false on account invalid device signature', async () => {
        const output = await addressLibrary.verifySignature(
          account.address,
          messageHash,
          await sign(messageHash, accountDevices.invalid),
          true,
        );

        expect(output)
          .toBeFalsy();
      });
    });
  });
});
