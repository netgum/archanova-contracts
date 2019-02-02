/* eslint-env mocha */

const expect = require('expect');
const { randomBytes } = require('crypto');
const { AccountAccessTypes } = require('../constants');
const { signMessage } = require('../utils');

const Guardian = artifacts.require('Guardian');

contract('Guardian', (addresses) => {
  describe('views', () => {
    const DEVICES = {
      owner: addresses[1],
      delegate: addresses[2],
      removed: addresses[3],
      invalid: addresses[4],
    };

    const MESSAGE = randomBytes(32);

    let guardian;

    before(async () => {
      guardian = await Guardian.new(DEVICES.owner);

      await guardian.addDevice(DEVICES.delegate, AccountAccessTypes.DELEGATE, {
        from: DEVICES.owner,
      });

      await guardian.addDevice(DEVICES.removed, AccountAccessTypes.DELEGATE, {
        from: DEVICES.owner,
      });

      await guardian.removeDevice(DEVICES.removed, {
        from: DEVICES.owner,
      });
    });

    describe('verifyDeviceSignature()', () => {
      describe('strict mode ON', () => {
        it('expect to return signer when signature was signed by OWNER device', async () => {
          const signature = signMessage(MESSAGE, DEVICES.owner);
          expect(await guardian.verifyDeviceSignature(signature, MESSAGE, true))
            .toBe(DEVICES.owner);
        });

        it('expect to return signer when signature was signed by DELEGATE device', async () => {
          const signature = signMessage(MESSAGE, DEVICES.delegate);
          expect(await guardian.verifyDeviceSignature(signature, MESSAGE, true))
            .toBe(DEVICES.delegate);
        });

        it('expect to reject when signer was guardian device', async () => {
          const signature = signMessage(MESSAGE, DEVICES.removed);
          await expect(guardian.verifyDeviceSignature(signature, MESSAGE, true))
            .rejects
            .toThrow();
        });

        it('expect to reject when signer wasn\'t guardian device', async () => {
          const signature = signMessage(MESSAGE, DEVICES.invalid);
          await expect(guardian.verifyDeviceSignature(signature, MESSAGE, true))
            .rejects
            .toThrow();
        });
      });

      describe('strict mode OFF', () => {
        it('expect to return signer when signature was signed by OWNER device', async () => {
          const signature = signMessage(MESSAGE, DEVICES.owner);
          expect(await guardian.verifyDeviceSignature(signature, MESSAGE, false))
            .toBe(DEVICES.owner);
        });

        it('expect to return signer when signature was signed by DELEGATE device', async () => {
          const signature = signMessage(MESSAGE, DEVICES.delegate);
          expect(await guardian.verifyDeviceSignature(signature, MESSAGE, false))
            .toBe(DEVICES.delegate);
        });

        it('expect to return signer when signer was guardian device', async () => {
          const signature = signMessage(MESSAGE, DEVICES.removed);
          expect(await guardian.verifyDeviceSignature(signature, MESSAGE, false))
            .toBe(DEVICES.removed);
        });

        it('expect to reject when signer wasn\'t guardian device', async () => {
          const signature = signMessage(MESSAGE, DEVICES.invalid);
          await expect(guardian.verifyDeviceSignature(signature, MESSAGE, false))
            .rejects
            .toThrow();
        });
      });
    });
  });
});
