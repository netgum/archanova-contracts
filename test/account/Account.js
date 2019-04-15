/* eslint-env mocha */

const expect = require('expect');
const { ZERO_ADDRESS, ACCOUNT_ACCESS_TYPES } = require('../../shared/constants');
const {
  BN,
  getBalance,
  getGasPrice,
  getCost,
  logGasUsed,
} = require('../../shared/utils');

const Account = artifacts.require('Account');

contract('Account', (addresses) => {
  let account;
  let gasPrice;

  before(async () => {
    gasPrice = await getGasPrice();
  });

  describe('views', () => {
    const accountDevices = {
      owner: addresses[1],
      delegate: addresses[2],
      removed: addresses[3],
      invalid: addresses[4],
    };

    before(async () => {
      account = await Account.new();

      await account.initialize([accountDevices.owner, accountDevices.removed], 0, ZERO_ADDRESS);
      await account.addDevice(accountDevices.delegate, ACCOUNT_ACCESS_TYPES.delegate, {
        from: accountDevices.owner,
      });
      await account.removeDevice(accountDevices.removed, {
        from: accountDevices.owner,
      });
    });

    describe('devices()', () => {
      it('expect to return correct struct for OWNER device', async () => {
        const { accessType, existed } = await account.devices(accountDevices.owner);

        expect(accessType)
          .toBeBN(ACCOUNT_ACCESS_TYPES.owner);
        expect(existed)
          .toBeTruthy();
      });

      it('expect to return correct struct for DELEGATE device', async () => {
        const { accessType, existed } = await account.devices(accountDevices.delegate);

        expect(accessType)
          .toBeBN(ACCOUNT_ACCESS_TYPES.delegate);
        expect(existed)
          .toBeTruthy();
      });

      it('expect to return correct struct for removed device', async () => {
        const { accessType, existed } = await account.devices(accountDevices.removed);

        expect(accessType)
          .toBeBN(ACCOUNT_ACCESS_TYPES.none);
        expect(existed)
          .toBeTruthy();
      });

      it('expect to return correct struct for invalid device', async () => {
        const { accessType, existed } = await account.devices(accountDevices.invalid);

        expect(accessType)
          .toBeBN(ACCOUNT_ACCESS_TYPES.none);
        expect(existed)
          .toBeFalsy();
      });
    });
  });

  describe('methods', () => {
    const accountDevices = {
      creator: addresses[1],
      owner: addresses[2],
      delegate: addresses[3],
      invalid: addresses[4],
    };

    describe('initialize()', () => {
      it('expect to reject on invalid initializer', async () => {
        account = await Account.new();

        await expect(account.initialize([accountDevices.creator], 0, ZERO_ADDRESS, {
          from: accountDevices.creator,
        }))
          .rejects
          .toThrow();
      });

      it('expect to reject on invalid refund', async () => {
        account = await Account.new();

        await expect(account.initialize([accountDevices.creator], 100, accountDevices.creator))
          .rejects
          .toThrow();
      });

      it('expect to initialize and refund to creator', async () => {
        const refund = new BN(1000);

        account = await Account.new({
          from: accountDevices.creator,
        });

        await account.send(refund);

        const creatorBalance = await getBalance(accountDevices.creator);

        const output = await account.initialize([accountDevices.creator], refund, accountDevices.creator, {
          gasPrice,
          from: accountDevices.creator,
        });

        logGasUsed(output);

        const cost = getCost(output, gasPrice);

        expect(await getBalance(accountDevices.creator))
          .toBeBN(creatorBalance.sub(cost)
            .add(refund));
      });
    });

    describe('addDevice()', () => {
      it('expect to add OWNER device by OWNER device', async () => {
        const output = await account.addDevice(accountDevices.owner, ACCOUNT_ACCESS_TYPES.owner, {
          from: accountDevices.creator,
        });

        logGasUsed(output);

        const { logs: [log] } = output;
        const { accessType } = await account.devices(accountDevices.owner);

        expect(accessType)
          .toBeBN(ACCOUNT_ACCESS_TYPES.owner);
        expect(log.event)
          .toBe('DeviceAdded');
        expect(log.args.device)
          .toBe(accountDevices.owner);
        expect(log.args.accessType)
          .toBeBN(ACCOUNT_ACCESS_TYPES.owner);
      });

      it('expect to add DELEGATE device by OWNER device', async () => {
        const output = await account.addDevice(accountDevices.delegate, ACCOUNT_ACCESS_TYPES.delegate, {
          from: accountDevices.creator,
        });

        logGasUsed(output);

        const { logs: [log] } = output;
        const { accessType } = await account.devices(accountDevices.delegate);

        expect(accessType)
          .toBeBN(ACCOUNT_ACCESS_TYPES.delegate);
        expect(log.event)
          .toBe('DeviceAdded');
        expect(log.args.device)
          .toBe(accountDevices.delegate);
        expect(log.args.accessType)
          .toBeBN(ACCOUNT_ACCESS_TYPES.delegate);
      });

      it('expect to reject when msg.sender is DELEGATE device', async () => {
        await expect(account.addDevice(addresses[5], ACCOUNT_ACCESS_TYPES.delegate, {
          from: accountDevices.delegate,
        }))
          .rejects
          .toThrow();
      });

      it('expect to reject when msg.sender is not account device', async () => {
        await expect(account.addDevice(addresses[5], ACCOUNT_ACCESS_TYPES.delegate, {
          from: accountDevices.invalid,
        }))
          .rejects
          .toThrow();
      });

      it('expect to reject when device already exists', async () => {
        await expect(account.addDevice(accountDevices.delegate, ACCOUNT_ACCESS_TYPES.delegate, {
          from: accountDevices.creator,
        }))
          .rejects
          .toThrow();
      });

      it('expect to reject on device zero address', async () => {
        await expect(account.addDevice(ZERO_ADDRESS, ACCOUNT_ACCESS_TYPES.owner, {
          from: accountDevices.creator,
        }))
          .rejects
          .toThrow();
      });

      it('expect to reject on INVALID access type', async () => {
        await expect(account.addDevice(addresses[5], ACCOUNT_ACCESS_TYPES.invalid, {
          from: accountDevices.creator,
        }))
          .rejects
          .toThrow();
      });
    });

    describe('removeDevice()', () => {
      it('expect to remove device by OWNER device', async () => {
        const output = await account.removeDevice(accountDevices.creator, {
          from: accountDevices.owner,
        });

        logGasUsed(output);

        const { logs: [log] } = output;
        const { accessType } = await account.devices(accountDevices.creator);

        expect(accessType)
          .toBeBN(ACCOUNT_ACCESS_TYPES.none);
        expect(log.event)
          .toBe('DeviceRemoved');
        expect(log.args.device)
          .toBe(accountDevices.creator);
      });

      it('expect to reject when msg.sender is DELEGATE device', async () => {
        await expect(account.removeDevice(accountDevices.owner, {
          from: accountDevices.delegate,
        }))
          .rejects
          .toThrow();
      });

      it('expect to reject when msg.sender is not account device', async () => {
        await expect(account.removeDevice(accountDevices.owner, {
          from: accountDevices.invalid,
        }))
          .rejects
          .toThrow();
      });
    });

    describe('executeTransaction()', () => {
      it('should accept payable call', async () => {
        const output = await account.send(1000);

        logGasUsed(output);
      });

      it('should send funds to recipient', async () => {
        const recipient = addresses[5];
        const value = new BN(100);
        const data = '0x';
        const recipientBalance = await getBalance(recipient);

        const output = await account.executeTransaction(recipient, value, data, {
          from: accountDevices.owner,
        });

        logGasUsed(output);

        const { logs: [log] } = output;

        expect(log.event)
          .toBe('TransactionExecuted');
        expect(log.args.recipient)
          .toBe(recipient);
        expect(log.args.value)
          .toBeBN(value);
        expect(log.args.data)
          .toBeNull();
        expect(await getBalance(recipient))
          .toBeBN(recipientBalance.add(value));
      });

      it('expect to reject when msg.sender is DELEGATE device', async () => {
        const recipient = addresses[5];
        const value = new BN(100);
        const data = '0x';

        await expect(account.executeTransaction(recipient, value, data, {
          from: accountDevices.delegate,
        }))
          .rejects
          .toThrow();
      });

      it('expect to reject when msg.sender is not account device', async () => {
        const recipient = addresses[5];
        const value = new BN(100);
        const data = '0x';

        await expect(account.executeTransaction(recipient, value, data, {
          from: accountDevices.invalid,
        }))
          .rejects
          .toThrow();
      });
    });
  });
});
