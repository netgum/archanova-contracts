/* eslint-env mocha */

const expect = require('expect');
const { randomBytes } = require('crypto');
const { AccountAccessTypes } = require('../constants');
const { signMessage } = require('../utils');

const Account = artifacts.require('Account');
const AccountLibraryExample = artifacts.require('AccountLibraryExample');

contract.only('AccountLibraryExample', (addresses) => {
  describe('views', () => {
    const DEVICES = {
      owner: addresses[1],
      delegate: addresses[2],
      removed: addresses[3],
      invalid: addresses[4],
    };

    const MESSAGE = randomBytes(32);

    let account;
    let accountLibraryExample;

    before(async () => {
      account = await Account.new(DEVICES.owner);
      accountLibraryExample = await AccountLibraryExample.new(account.address);

      await account.addDevice(DEVICES.delegate, AccountAccessTypes.DELEGATE, {
        from: DEVICES.owner,
      });

      await account.addDevice(DEVICES.removed, AccountAccessTypes.DELEGATE, {
        from: DEVICES.owner,
      });

      await account.removeDevice(DEVICES.removed, {
        from: DEVICES.owner,
      });
    });

    describe('verifyDeviceSignature()', () => {
      describe('strict mode ON', () => {
        it('expect to return signer when signature was signed by OWNER device', async () => {
          const signature = signMessage(MESSAGE, DEVICES.owner);
          expect(await accountLibraryExample.verifyDeviceSignature(signature, MESSAGE, true))
            .toBe(DEVICES.owner);
        });

        it('expect to return signer when signature was signed by DELEGATE device', async () => {
          const signature = signMessage(MESSAGE, DEVICES.delegate);
          expect(await accountLibraryExample.verifyDeviceSignature(signature, MESSAGE, true))
            .toBe(DEVICES.delegate);
        });

        it('expect to reject when signer was guardian device', async () => {
          const signature = signMessage(MESSAGE, DEVICES.removed);
          await expect(accountLibraryExample.verifyDeviceSignature(signature, MESSAGE, true))
            .rejects
            .toThrow();
        });

        it('expect to reject when signer wasn\'t guardian device', async () => {
          const signature = signMessage(MESSAGE, DEVICES.invalid);
          await expect(accountLibraryExample.verifyDeviceSignature(signature, MESSAGE, true))
            .rejects
            .toThrow();
        });
      });

      describe('strict mode OFF', () => {
        it('expect to return signer when signature was signed by OWNER device', async () => {
          const signature = signMessage(MESSAGE, DEVICES.owner);
          expect(await accountLibraryExample.verifyDeviceSignature(signature, MESSAGE, false))
            .toBe(DEVICES.owner);
        });

        it('expect to return signer when signature was signed by DELEGATE device', async () => {
          const signature = signMessage(MESSAGE, DEVICES.delegate);
          expect(await accountLibraryExample.verifyDeviceSignature(signature, MESSAGE, false))
            .toBe(DEVICES.delegate);
        });

        it('expect to return signer when signer was guardian device', async () => {
          const signature = signMessage(MESSAGE, DEVICES.removed);
          expect(await accountLibraryExample.verifyDeviceSignature(signature, MESSAGE, false))
            .toBe(DEVICES.removed);
        });

        it('expect to reject when signer wasn\'t guardian device', async () => {
          const signature = signMessage(MESSAGE, DEVICES.invalid);
          await expect(accountLibraryExample.verifyDeviceSignature(signature, MESSAGE, false))
            .rejects
            .toThrow();
        });
      });
    });
  });
});
