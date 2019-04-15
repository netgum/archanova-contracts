/* eslint-env mocha */

const expect = require('expect');
const { ZERO_ADDRESS } = require('../../shared/constants');
const { ACCOUNT_ACCESS_TYPES } = require('../constants');
const {
  BN,
  getGasPrice,
  getMethodSign,
  soliditySha3,
  sign,
  logGasUsed,
  getCost,
  getBalance,
  toWei,
} = require('../utils');

const Account = artifacts.require('Account');
const AccountProxy = artifacts.require('AccountProxy');

contract('AccountProxy', (addresses) => {
  const sender = addresses[0];
  const accountDevices = {
    owner: addresses[1],
    delegate: addresses[2],
    removed: addresses[3],
    invalid: addresses[4],
  };
  const methodSigns = {
    forwardAccountOwnerCall: getMethodSign(
      'forwardAccountOwnerCall', 'address', 'uint256', 'bytes', 'uint256', 'bytes',
    ),
  };

  let account;
  let accountProxy;
  let gasPrice;
  let data;
  let nonce = new BN(0);

  before(async () => {
    gasPrice = await getGasPrice();

    accountProxy = await AccountProxy.new();

    account = await Account.new();

    await account.initialize([
      accountDevices.owner,
      accountDevices.removed,
      accountProxy.address,
    ], 0, ZERO_ADDRESS);
    await account.addDevice(accountDevices.delegate, ACCOUNT_ACCESS_TYPES.delegate, {
      from: accountDevices.owner,
    });
    await account.removeDevice(accountDevices.removed, {
      from: accountDevices.owner,
    });

    await account.send(toWei('1', 'ether'));

    data = account
      .contract
      .methods
      .executeTransaction(
        addresses[5],
        '0x1',
        '0x',
      )
      .encodeABI();

    const messageHash = soliditySha3(
      accountProxy.address,
      methodSigns.forwardAccountOwnerCall,
      account.address,
      nonce,
      data,
      0,
      gasPrice,
    );

    await accountProxy.forwardAccountOwnerCall(
      account.address,
      nonce,
      data,
      0,
      await sign(messageHash, accountDevices.owner), {
        gasPrice,
      },
    );

    nonce = nonce.add(new BN(1));
  });

  describe('views', () => {
    describe('accounts()', () => {
      it('expect to returns current nonce', async () => {
        const output = await accountProxy.accounts(account.address);

        expect(output)
          .toBeBN(nonce);
      });
    });
  });

  describe('methods', () => {
    describe('forwardAccountOwnerCall()', () => {
      it('expect to forward call if is signed by OWNER device', async () => {
        const messageHash = soliditySha3(
          accountProxy.address,
          methodSigns.forwardAccountOwnerCall,
          account.address,
          nonce,
          data,
          0,
          gasPrice,
        );
        const senderBalance = await getBalance(sender);

        const output = await accountProxy.forwardAccountOwnerCall(
          account.address,
          nonce,
          data,
          0,
          await sign(messageHash, accountDevices.owner), {
            gasPrice,
            from: sender,
          },
        );

        logGasUsed(output);

        const { logs: [log] } = output;
        const cost = getCost(output, gasPrice);
        const refund = (await getBalance(sender)).add(cost)
          .sub(senderBalance);

        expect(refund)
          .toBeBN(new BN(0));
        expect(log.event)
          .toBe('NewAccountOwnerCall');
        expect(log.args.account)
          .toBe(account.address);
        expect(log.args.nonce)
          .toBeBN(nonce);

        nonce = nonce.add(new BN(1));
      });

      it('expect to forward call and refund to sender', async () => {
        const messageHash = soliditySha3(
          accountProxy.address,
          methodSigns.forwardAccountOwnerCall,
          account.address,
          nonce,
          data,
          1,
          gasPrice,
        );
        const senderBalance = await getBalance(sender);

        const output = await accountProxy.forwardAccountOwnerCall(
          account.address,
          nonce,
          data,
          1,
          await sign(messageHash, accountDevices.owner), {
            gasPrice,
            from: sender,
          },
        );

        logGasUsed(output);

        const { logs: [log] } = output;
        const cost = getCost(output, gasPrice);
        const refund = (await getBalance(sender)).add(cost)
          .sub(senderBalance);

        expect(refund)
          .not
          .toBeBN(new BN(0));
        expect(log.event)
          .toBe('NewAccountOwnerCall');
        expect(log.args.account)
          .toBe(account.address);
        expect(log.args.nonce)
          .toBeBN(nonce);
      });

      it('expect to reject on invalid nonce', async () => {
        const messageHash = soliditySha3(
          accountProxy.address,
          methodSigns.forwardAccountOwnerCall,
          account.address,
          nonce,
          data,
          0,
          gasPrice,
        );

        await expect(accountProxy.forwardAccountOwnerCall(
          account.address,
          nonce,
          data,
          0,
          await sign(messageHash, accountDevices.owner), {
            gasPrice,
          },
        ))
          .rejects
          .toThrow();

        nonce = nonce.add(new BN(1));
      });

      it('expect to reject if call is signed by DELEGATE device', async () => {
        const messageHash = soliditySha3(
          accountProxy.address,
          methodSigns.forwardAccountOwnerCall,
          account.address,
          nonce,
          data,
          0,
          gasPrice,
        );

        await expect(accountProxy.forwardAccountOwnerCall(
          account.address,
          nonce,
          data,
          0,
          await sign(messageHash, accountDevices.delegate), {
            gasPrice,
          },
        ))
          .rejects
          .toThrow();
      });

      it('expect to reject if call is signed by removed device', async () => {
        const messageHash = soliditySha3(
          accountProxy.address,
          methodSigns.forwardAccountOwnerCall,
          account.address,
          nonce,
          data,
          0,
          gasPrice,
        );

        await expect(accountProxy.forwardAccountOwnerCall(
          account.address,
          nonce,
          data,
          0,
          await sign(messageHash, accountDevices.removed), {
            gasPrice,
          },
        ))
          .rejects
          .toThrow();
      });

      it('expect to reject if call is signed by invalid device', async () => {
        const messageHash = soliditySha3(
          accountProxy.address,
          methodSigns.forwardAccountOwnerCall,
          account.address,
          nonce,
          data,
          0,
          gasPrice,
        );

        await expect(accountProxy.forwardAccountOwnerCall(
          account.address,
          nonce,
          data,
          0,
          await sign(messageHash, accountDevices.invalid), {
            gasPrice,
          },
        ))
          .rejects
          .toThrow();
      });
    });
  });
});
