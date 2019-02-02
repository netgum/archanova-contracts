/* eslint-env mocha */

const expect = require('expect');
const { randomBytes } = require('crypto');
const { anyToHex } = require('@netgum/utils');
const { AccountAccessTypes } = require('../constants');
const { signMessage } = require('../utils');

const Account = artifacts.require('Account');
const GuardedExample = artifacts.require('GuardedExample');

contract('GuardedExample', (addresses) => {
  const DEVICES = {
    owner: addresses[1],
    delegate: addresses[2],
    removed: addresses[3],
    invalid: addresses[4],
  };

  const MESSAGE = anyToHex(randomBytes(32), { add0x: true });

  let guardian;
  let guardedExample;

  before(async () => {
    guardian = await Account.new(DEVICES.owner);
    guardedExample = await GuardedExample.new(guardian.address);

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

  describe('views', () => {
    describe('verifyGuardianSignature()', () => {
      it('expect to return signer when signature was signed by guardian OWNER device', async () => {
        const signature = signMessage(MESSAGE, DEVICES.owner);
        expect(await guardedExample.verifyGuardianSignature(signature, MESSAGE))
          .toBe(DEVICES.owner);
      });

      it('expect to return signer when signature was signed by guardian DELEGATE device', async () => {
        const signature = signMessage(MESSAGE, DEVICES.delegate);
        expect(await guardedExample.verifyGuardianSignature(signature, MESSAGE))
          .toBe(DEVICES.delegate);
      });

      it('expect to reject when signer was guardian device', async () => {
        const signature = signMessage(MESSAGE, DEVICES.removed);
        await expect(guardedExample.verifyGuardianSignature(signature, MESSAGE))
          .rejects
          .toThrow();
      });

      it('expect to reject when signer wasn\'t guardian device', async () => {
        const signature = signMessage(MESSAGE, DEVICES.invalid);
        await expect(guardedExample.verifyGuardianSignature(signature, MESSAGE))
          .rejects
          .toThrow();
      });
    });
  });

  describe('methods', () => {
    describe('foo()', () => {
      it('expect to resolve when sender is guardian OWNER device', async () => {
        expect(await guardedExample.foo({
          from: DEVICES.owner,
        }))
          .toBeTruthy();
      });

      it('expect to resolve when sender is guardian DELEGATE device', async () => {
        expect(await guardedExample.foo({
          from: DEVICES.delegate,
        }))
          .toBeTruthy();
      });

      it('expect to reject when sender was guardian device', async () => {
        await expect(guardedExample.foo({
          from: DEVICES.removed,
        }))
          .rejects
          .toThrow();
      });

      it('expect to reject when sender wasn\'t guardian device', async () => {
        await expect(guardedExample.foo({
          from: DEVICES.invalid,
        }))
          .rejects
          .toThrow();
      });
    });
  });
});
