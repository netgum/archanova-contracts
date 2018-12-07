/* eslint-env mocha */

const expect = require('expect');
const BN = require('bn.js');

const Account = artifacts.require('Account');

const AccessType = {
  NONE: new BN(0),
  OWNER: new BN(1),
  DELEGATE: new BN(2),
};

contract('Account', (accounts) => {
  describe('views', () => {
    let account;

    const devices = {
      owner: accounts[0],
      delegate: accounts[2],
      removed: accounts[3],
      invalid: accounts[4],
    };

    before(async () => {
      account = await Account.new();
      await account.initialize([
        devices.owner,
        devices.removed,
      ]);
      await account.addDevice(devices.delegate, AccessType.DELEGATE);
      await account.removeDevice(devices.removed);
    });

    describe('deviceExists()', () => {
      it('should return true when device exists', async () => {
        expect(await account.deviceExists(devices.owner))
          .toBeTruthy();
      });

      it('should return false when device doesn\'t exists', async () => {
        expect(await account.deviceExists(devices.invalid))
          .toBeFalsy();
      });

      it('should return false when device was removed', async () => {
        expect(await account.deviceExists(devices.removed))
          .toBeFalsy();
      });
    });

    describe('deviceExisted()', () => {
      it('should return true when device exists', async () => {
        expect(await account.deviceExisted(devices.owner))
          .toBeTruthy();
      });

      it('should return false when device doesn\'t exists and wasn\'t removed', async () => {
        expect(await account.deviceExisted(devices.invalid))
          .toBeFalsy();
      });

      it('should return true when device was removed', async () => {
        expect(await account.deviceExisted(devices.removed))
          .toBeTruthy();
      });
    });

    describe('getDeviceAccessType()', () => {
      it('should return correct type when device exists', async () => {
        const accessType = await account.getDeviceAccessType(devices.owner);
        expect(accessType.eq(AccessType.OWNER))
          .toBeTruthy();
      });

      it('should return NONE type when device doesn\'t exists', async () => {
        const accessType = await account.getDeviceAccessType(devices.invalid);
        expect(accessType.eq(AccessType.NONE))
          .toBeTruthy();
      });

      it('should return NONE type when device was removed', async () => {
        const accessType = await account.getDeviceAccessType(devices.removed);
        expect(accessType.eq(AccessType.NONE))
          .toBeTruthy();
      });
    });
  });

  describe('methods', () => {
    let account;

    before(async () => {
      account = await Account.new();
    });

    describe('initialize()', () => {
      it('should initialized account', async () => {
        const devices = [accounts[0], accounts[1]];

        await account.initialize(devices);

        expect(await account.deviceExists(devices[0]))
          .toBeTruthy();
        expect(await account.deviceExists(devices[1]))
          .toBeTruthy();
        expect(await account.initialized())
          .toBeTruthy();
      });
    });
  });
});
