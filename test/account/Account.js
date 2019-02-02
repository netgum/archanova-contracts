/* eslint-env mocha */

const expect = require('expect');
const BN = require('bn.js');
const { ZERO_ADDRESS } = require('@netgum/utils');
const { AccountAccessTypes } = require('../constants');
const { getBalance } = require('../utils');

const Account = artifacts.require('Account');

contract('Account', (addresses) => {
  describe('views', () => {
    let account;

    const DEVICES = {
      owner: addresses[1],
      delegate: addresses[2],
      removed: addresses[3],
      invalid: addresses[4],
    };

    before(async () => {
      account = await Account.new(DEVICES.owner);

      await account.addDevice(DEVICES.removed, AccountAccessTypes.DELEGATE, {
        from: DEVICES.owner,
      });
      await account.addDevice(DEVICES.delegate, AccountAccessTypes.DELEGATE, {
        from: DEVICES.owner,
      });
      await account.removeDevice(DEVICES.removed, {
        from: DEVICES.owner,
      });
    });

    describe('deviceExists()', () => {
      it('expect to return true when device exists', async () => {
        expect(await account.deviceExists(DEVICES.owner))
          .toBeTruthy();
      });

      it('expect to return false when device doesn\'t exists', async () => {
        expect(await account.deviceExists(DEVICES.invalid))
          .toBeFalsy();
      });

      it('expect to return false when device was removed', async () => {
        expect(await account.deviceExists(DEVICES.removed))
          .toBeFalsy();
      });
    });

    describe('deviceExisted()', () => {
      it('expect to return true when device exists', async () => {
        expect(await account.deviceExisted(DEVICES.owner))
          .toBeTruthy();
      });

      it('expect to return false when device doesn\'t exists and wasn\'t removed', async () => {
        expect(await account.deviceExisted(DEVICES.invalid))
          .toBeFalsy();
      });

      it('expect to  return true when device was removed', async () => {
        expect(await account.deviceExisted(DEVICES.removed))
          .toBeTruthy();
      });
    });

    describe('getDeviceAccessType()', () => {
      it('expect to return correct type when device exists', async () => {
        expect(await account.getDeviceAccessType(DEVICES.owner))
          .toEqualBN(AccountAccessTypes.OWNER);
      });

      it('expect to return NONE type when device doesn\'t exists', async () => {
        expect(await account.getDeviceAccessType(DEVICES.invalid))
          .toEqualBN(AccountAccessTypes.NONE);
      });

      it('expect to return NONE type when device was removed', async () => {
        expect(await account.getDeviceAccessType(DEVICES.removed))
          .toEqualBN(AccountAccessTypes.NONE);
      });
    });
  });

  describe('methods', () => {
    let account;

    const DEVICES = {
      creator: addresses[0],
      owner: addresses[1],
      delegate: addresses[3],
      invalid: addresses[4],
    };

    before(async () => {
      account = await Account.new(DEVICES.creator);
    });


    describe('addDevice()', () => {
      it('should add OWNER device by OWNER device', async () => {
        const { logs: [log] } = await account.addDevice(DEVICES.owner, AccountAccessTypes.OWNER, {
          from: DEVICES.creator,
        });

        expect(await account.getDeviceAccessType(DEVICES.owner))
          .toEqualBN(AccountAccessTypes.OWNER);

        expect(log.event)
          .toBe('DeviceAdded');
        expect(log.args.deviceAddress)
          .toBe(DEVICES.owner);
        expect(log.args.deviceAccessType)
          .toEqualBN(AccountAccessTypes.OWNER);
      });

      it('should add DELEGATE device by OWNER device', async () => {
        const { logs: [log] } = await account.addDevice(DEVICES.delegate, AccountAccessTypes.DELEGATE, {
          from: DEVICES.owner,
        });

        expect(await account.getDeviceAccessType(DEVICES.delegate))
          .toEqualBN(AccountAccessTypes.DELEGATE);

        expect(log.event)
          .toBe('DeviceAdded');
        expect(log.args.deviceAddress)
          .toBe(DEVICES.delegate);
        expect(log.args.deviceAccessType)
          .toEqualBN(AccountAccessTypes.DELEGATE);
      });

      it('expect to reject when msg.sender is DELEGATE device', async () => {
        const newDevice = addresses[4];
        await expect(account.addDevice(newDevice, AccountAccessTypes.DELEGATE, {
          from: DEVICES.delegate,
        }))
          .rejects
          .toThrow();
      });

      it('expect to reject when msg.sender is not account device', async () => {
        const newDevice = addresses[4];
        await expect(account.addDevice(newDevice, AccountAccessTypes.DELEGATE, {
          from: DEVICES.invalid,
        }))
          .rejects
          .toThrow();
      });

      it('expect to reject when device exists', async () => {
        await expect(account.addDevice(DEVICES.delegate, AccountAccessTypes.OWNER, {
          from: DEVICES.creator,
        }))
          .rejects
          .toThrow();
      });

      it('expect to reject on device zero address', async () => {
        await expect(account.addDevice(ZERO_ADDRESS, AccountAccessTypes.OWNER, {
          from: DEVICES.creator,
        }))
          .rejects
          .toThrow();
      });

      it('expect to reject on INVALID access type', async () => {
        const newDevice = addresses[4];
        await expect(account.addDevice(newDevice, AccountAccessTypes.INVALID, {
          from: DEVICES.creator,
        }))
          .rejects
          .toThrow();
      });
    });

    describe('removeDevice()', () => {
      it('should remove device by OWNER device', async () => {
        const { logs: [log] } = await account.removeDevice(DEVICES.creator, {
          from: DEVICES.owner,
        });

        expect(await account.getDeviceAccessType(DEVICES.creator))
          .toEqualBN(AccountAccessTypes.NONE);

        expect(log.event)
          .toBe('DeviceRemoved');
        expect(log.args.deviceAddress)
          .toBe(DEVICES.creator);
      });

      it('expect to reject when msg.sender is DELEGATE device', async () => {
        await expect(account.removeDevice(DEVICES.owner, {
          from: DEVICES.delegate,
        }))
          .rejects
          .toThrow();
      });

      it('expect to reject when msg.sender is not account device', async () => {
        await expect(account.removeDevice(DEVICES.owner, {
          from: DEVICES.invalid,
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

        const { logs: [log] } = await account.executeTransaction(to, value, data, {
          from: DEVICES.owner,
        });

        expect(log.event)
          .toBe('TransactionExecuted');
        expect(log.args.value)
          .toEqualBN(value);
        expect(log.args.data)
          .toBeNull();

        expect(await getBalance(to))
          .toEqualBN(toBalance.add(value));
      });

      it('expect to reject when msg.sender is DELEGATE device', async () => {
        const to = addresses[5];
        const value = new BN(100);
        const data = '0x';

        await expect(account.executeTransaction(to, value, data, {
          from: DEVICES.delegate,
        }))
          .rejects
          .toThrow();
      });

      it('expect to reject when msg.sender is not account device', async () => {
        const to = addresses[5];
        const value = new BN(100);
        const data = '0x';

        await expect(account.executeTransaction(to, value, data, {
          from: DEVICES.invalid,
        }))
          .rejects
          .toThrow();
      });
    });
  });
});
