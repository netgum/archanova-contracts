/* eslint-env mocha */

const expect = require('expect');
const BN = require('bn.js');
const { ZERO_ADDRESS } = require('@netgum/utils');
const { AccountAccessTypes } = require('../../shared/constants');
const { getBalance } = require('../../shared/utils');

const Account = artifacts.require('Account');

contract('Account', (addresses) => {
  describe('views', () => {
    let account;

    const devices = {
      owner: addresses[0],
      delegate: addresses[2],
      removed: addresses[3],
      invalid: addresses[4],
    };

    before(async () => {
      account = await Account.new();

      await account.initialize([
        devices.owner,
        devices.removed,
      ]);

      await account.addDevice(devices.delegate, AccountAccessTypes.DELEGATE);
      await account.removeDevice(devices.removed);
    });

    describe('deviceExists()', () => {
      it('expect to return true when device exists', async () => {
        expect(await account.deviceExists(devices.owner))
          .toBeTruthy();
      });

      it('expect to return false when device doesn\'t exists', async () => {
        expect(await account.deviceExists(devices.invalid))
          .toBeFalsy();
      });

      it('expect to return false when device was removed', async () => {
        expect(await account.deviceExists(devices.removed))
          .toBeFalsy();
      });
    });

    describe('deviceExisted()', () => {
      it('expect to return true when device exists', async () => {
        expect(await account.deviceExisted(devices.owner))
          .toBeTruthy();
      });

      it('expect to return false when device doesn\'t exists and wasn\'t removed', async () => {
        expect(await account.deviceExisted(devices.invalid))
          .toBeFalsy();
      });

      it('expect to  return true when device was removed', async () => {
        expect(await account.deviceExisted(devices.removed))
          .toBeTruthy();
      });
    });

    describe('getDeviceAccessType()', () => {
      it('expect to return correct type when device exists', async () => {
        expect(await account.getDeviceAccessType(devices.owner))
          .toEqualBN(AccountAccessTypes.OWNER);
      });

      it('expect to return NONE type when device doesn\'t exists', async () => {
        expect(await account.getDeviceAccessType(devices.invalid))
          .toEqualBN(AccountAccessTypes.NONE);
      });

      it('expect to return NONE type when device was removed', async () => {
        expect(await account.getDeviceAccessType(devices.removed))
          .toEqualBN(AccountAccessTypes.NONE);
      });
    });
  });

  describe('methods', () => {
    let account;

    const devices = {
      owners: [addresses[0], addresses[1]],
      delegate: addresses[3],
      invalid: addresses[4],
    };

    before(async () => {
      account = await Account.new();
    });

    describe('initialize()', () => {
      it('should initialized account with OWNER devices', async () => {
        await account.initialize(devices.owners);

        expect(await account.deviceExists(devices.owners[0]))
          .toBeTruthy();
        expect(await account.getDeviceAccessType(devices.owners[0]))
          .toEqualBN(AccountAccessTypes.OWNER);

        expect(await account.deviceExists(devices.owners[1]))
          .toBeTruthy();
        expect(await account.getDeviceAccessType(devices.owners[1]))
          .toEqualBN(AccountAccessTypes.OWNER);

        expect(await account.initialized())
          .toBeTruthy();
      });
    });

    describe('addDevice()', () => {
      it('should add OWNER device by OWNER device', async () => {
        const newOwnerDevice = addresses[2];
        const { logs: [log] } = await account.addDevice(newOwnerDevice, AccountAccessTypes.OWNER, {
          from: devices.owners[1],
        });

        expect(await account.getDeviceAccessType(newOwnerDevice))
          .toEqualBN(AccountAccessTypes.OWNER);

        expect(log.event)
          .toBe('DeviceAdded');
        expect(log.args.device)
          .toBe(newOwnerDevice);
        expect(log.args.accessType)
          .toEqualBN(AccountAccessTypes.OWNER);
      });

      it('should add DELEGATE device by OWNER device', async () => {
        const { logs: [log] } = await account.addDevice(devices.delegate, AccountAccessTypes.DELEGATE, {
          from: devices.owners[1],
        });

        expect(await account.getDeviceAccessType(devices.delegate))
          .toEqualBN(AccountAccessTypes.DELEGATE);

        expect(log.event)
          .toBe('DeviceAdded');
        expect(log.args.device)
          .toBe(devices.delegate);
        expect(log.args.accessType)
          .toEqualBN(AccountAccessTypes.DELEGATE);
      });

      it('expect to reject when msg.sender is DELEGATE device', async () => {
        const newDevice = addresses[4];
        await expect(account.addDevice(newDevice, AccountAccessTypes.DELEGATE, {
          from: devices.delegate,
        }))
          .rejects
          .toThrow();
      });

      it('expect to reject when msg.sender is not account device', async () => {
        const newDevice = addresses[4];
        await expect(account.addDevice(newDevice, AccountAccessTypes.DELEGATE, {
          from: devices.invalid,
        }))
          .rejects
          .toThrow();
      });

      it('expect to reject when device exists', async () => {
        await expect(account.addDevice(devices.delegate, AccountAccessTypes.OWNER))
          .rejects
          .toThrow();
      });

      it('expect to reject on device zero address', async () => {
        await expect(account.addDevice(ZERO_ADDRESS, AccountAccessTypes.OWNER))
          .rejects
          .toThrow();
      });

      it('expect to reject on INVALID access type', async () => {
        const newDevice = addresses[4];
        await expect(account.addDevice(newDevice, AccountAccessTypes.INVALID))
          .rejects
          .toThrow();
      });
    });

    describe('removeDevice()', () => {
      it('should remove device by OWNER device', async () => {
        const removedDevice = devices.owners[1];
        const { logs: [log] } = await account.removeDevice(removedDevice);

        expect(await account.getDeviceAccessType(removedDevice))
          .toEqualBN(AccountAccessTypes.NONE);

        expect(log.event)
          .toBe('DeviceRemoved');
        expect(log.args.device)
          .toBe(removedDevice);
      });

      it('expect to reject when msg.sender is DELEGATE device', async () => {
        const removedDevice = devices.owners[0];
        await expect(account.removeDevice(removedDevice, {
          from: devices.delegate,
        }))
          .rejects
          .toThrow();
      });

      it('expect to reject when msg.sender is not account device', async () => {
        const removedDevice = devices.owners[0];
        await expect(account.removeDevice(removedDevice, {
          from: devices.invalid,
        }))
          .rejects
          .toThrow();
      });
    });

    describe('executeTransaction()', () => {
      it('should accept payable call', async () => {
        await account.send(1000);
      });

      it('should send funds to address', async () => {
        const to = addresses[5];
        const toBalance = await getBalance(to);
        const value = new BN(100);
        const data = '0x';

        const { logs: [log] } = await account.executeTransaction(to, value, data);

        expect(log.event)
          .toBe('TransactionExecuted');
        expect(log.args.value)
          .toEqualBN(value);
        expect(log.args.data)
          .toBeNull();
        expect(log.args.succeeded)
          .toBeTruthy();

        expect(await getBalance(to))
          .toEqualBN(toBalance.add(value));
      });

      it('expect to reject when msg.sender is DELEGATE device', async () => {
        const to = addresses[5];
        const value = new BN(100);
        const data = '0x';

        await expect(account.executeTransaction(to, value, data, {
          from: devices.delegate,
        }))
          .rejects
          .toThrow();
      });

      it('expect to reject when msg.sender is not account device', async () => {
        const to = addresses[5];
        const value = new BN(100);
        const data = '0x';

        await expect(account.executeTransaction(to, value, data, {
          from: devices.invalid,
        }))
          .rejects
          .toThrow();
      });
    });
  });
});
