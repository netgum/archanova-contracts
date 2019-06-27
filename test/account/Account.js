/* eslint-env mocha */

const expect = require('expect');
const {
  BN,
  getBalance,
  logGasUsed,
} = require('../shared/utils');

const Account = artifacts.require('Account');

contract('Account', (addresses) => {
  let account;

  describe('views', () => {
    const accountDevices = {
      owner: addresses[1],
      delegate: addresses[2],
      removed: addresses[3],
      invalid: addresses[4],
    };

    before(async () => {
      account = await Account.new({
        from: accountDevices.owner,
      });

      await account.addDevice(accountDevices.delegate, false, {
        from: accountDevices.owner,
      });
      await account.addDevice(accountDevices.removed, false, {
        from: accountDevices.owner,
      });
      await account.removeDevice(accountDevices.removed, {
        from: accountDevices.owner,
      });
    });

    describe('devices()', () => {
      it('expect to return correct struct for OWNER device', async () => {
        const { isOwner, exists, existed } = await account.devices(accountDevices.owner);

        expect(isOwner)
          .toBeTruthy();
        expect(exists)
          .toBeTruthy();
        expect(existed)
          .toBeTruthy();
      });

      it('expect to return correct struct for DELEGATE device', async () => {
        const { isOwner, exists, existed } = await account.devices(accountDevices.delegate);

        expect(isOwner)
          .toBeFalsy();
        expect(exists)
          .toBeTruthy();
        expect(existed)
          .toBeTruthy();
      });

      it('expect to return correct struct for removed device', async () => {
        const { isOwner, exists, existed } = await account.devices(accountDevices.removed);

        expect(isOwner)
          .toBeFalsy();
        expect(exists)
          .toBeFalsy();
        expect(existed)
          .toBeTruthy();
      });

      it('expect to return correct struct for invalid device', async () => {
        const { isOwner, exists, existed } = await account.devices(accountDevices.invalid);

        expect(isOwner)
          .toBeFalsy();
        expect(exists)
          .toBeFalsy();
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

    before(async () => {
      account = await Account.new({
        from: accountDevices.creator,
      });
    });

    describe('addDevice()', () => {
      it('expect to add OWNER device by OWNER device', async () => {
        const output = await account.addDevice(accountDevices.owner, true, {
          from: accountDevices.creator,
        });

        logGasUsed(output);

        const { logs: [log] } = output;
        const { isOwner, exists, existed } = await account.devices(accountDevices.owner);

        expect(isOwner)
          .toBeTruthy();
        expect(exists)
          .toBeTruthy();
        expect(existed)
          .toBeTruthy();
        expect(log.event)
          .toBe('DeviceAdded');
        expect(log.args.device)
          .toBe(accountDevices.owner);
        expect(log.args.isOwner)
          .toBeTruthy();
      });

      it('expect to add DELEGATE device by OWNER device', async () => {
        const output = await account.addDevice(accountDevices.delegate, false, {
          from: accountDevices.creator,
        });

        logGasUsed(output);

        const { logs: [log] } = output;
        const { isOwner, exists, existed } = await account.devices(accountDevices.delegate);

        expect(isOwner)
          .toBeFalsy();
        expect(exists)
          .toBeTruthy();
        expect(existed)
          .toBeTruthy();
        expect(log.event)
          .toBe('DeviceAdded');
        expect(log.args.device)
          .toBe(accountDevices.delegate);
        expect(log.args.isOwner)
          .toBeFalsy();
      });

      it('expect to reject when msg.sender is DELEGATE device', async () => {
        await expect(account.addDevice(addresses[5], false, {
          from: accountDevices.delegate,
        }))
          .rejects
          .toThrow();
      });

      it('expect to reject when msg.sender is not account device', async () => {
        await expect(account.addDevice(addresses[5], false, {
          from: accountDevices.invalid,
        }))
          .rejects
          .toThrow();
      });

      it('expect to reject when device already exists', async () => {
        await expect(account.addDevice(accountDevices.delegate, false, {
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
        const { isOwner, exists, existed } = await account.devices(accountDevices.creator);

        expect(isOwner)
          .toBeFalsy();
        expect(exists)
          .toBeFalsy();
        expect(existed)
          .toBeTruthy();
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

    describe('executeTransactions()', () => {

      it('should send funds to recipient', async () => {
        const recipients = [addresses[5], addresses[8]];
        const values = [new BN(30), new BN(30)];
        const datas = ['0x', '0x'];
        const recepientBalances = [];
        recepientBalances.push(await getBalance(recipients[0]))
        recepientBalances.push(await getBalance(recipients[1]))

        const output = await account.executeTransactions(recipients, values, datas, {
          from: accountDevices.owner,
        });

        logGasUsed(output);

        const { logs: [log] } = output;

        expect(await getBalance(recipients[0]))
          .toBeBN(recepientBalances[0].add(values[0]));
        expect(await getBalance(recipients[1]))
          .toBeBN(recepientBalances[1].add(values[1]));
      });

      it('should revert everything on failed transaction', async () => {
        const recipients = [addresses[5], addresses[8]];
        const values = [new BN(30), new BN(5455533330)];
        const datas = ['0x', '0x333'];
        const recepientBalances = [];
        recepientBalances.push(await getBalance(recipients[0]))
        recepientBalances.push(await getBalance(recipients[1]))

        await expect(account.executeTransactions(recipients, values, datas, {
          from: accountDevices.owner,
        })).rejects.toThrow();

      });
    });
  });
});
