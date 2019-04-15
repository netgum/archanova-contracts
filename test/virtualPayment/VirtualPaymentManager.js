/* eslint-env mocha */

const expect = require('expect');
const {
  sign,
  soliditySha3,
  BN,
  increaseTime,
  logGasUsed,
  getGasPrice,
  getBalance,
  getCost,
  now,
} = require('../shared/utils');

const VirtualPaymentManager = artifacts.require('VirtualPaymentManager');

contract('VirtualPaymentManager', ([guardian, sender, receiver]) => {
  const lockPeriod = new BN(24 * 60 * 60); // 1 day

  let manager;
  let gasPrice;

  before(async () => {
    gasPrice = await getGasPrice();
  });

  describe('views', () => {
    const depositValue = new BN(500);
    const paymentId = new BN(1);
    const paymentValue = new BN(200);

    before(async () => {
      manager = await VirtualPaymentManager.new(
        guardian,
        lockPeriod,
      );
      const messageHash = soliditySha3(
        manager.address,
        sender,
        receiver,
        paymentId,
        paymentValue,
      );
      const senderSignature = await sign(messageHash, sender);
      const guardianSignature = await sign(messageHash, guardian);

      await manager.send(depositValue, {
        from: sender,
      });

      await manager.depositPayment(
        sender,
        receiver,
        paymentId,
        paymentValue,
        senderSignature,
        guardianSignature,
      );
    });

    describe('guardian()', () => {
      it('expect to return guardian address', async () => {
        const output = await manager.guardian();

        expect(output)
          .toBe(guardian);
      });
    });

    describe('depositWithdrawalLockPeriod()', () => {
      it('expect to return lock period', async () => {
        const output = await manager.depositWithdrawalLockPeriod();

        expect(output)
          .toBeBN(lockPeriod);
      });
    });

    describe('deposits()', () => {
      it('expect to return sender deposit', async () => {
        const { value, withdrawalUnlockedAt } = await manager.deposits(sender);

        expect(value)
          .toBeBN(depositValue.sub(paymentValue));
        expect(withdrawalUnlockedAt)
          .toBeBN(new BN(0));
      });
    });

    describe('payments()', () => {
      it('expect to return sender payment', async () => {
        const paymentHash = soliditySha3(
          sender,
          receiver,
          paymentId,
        );

        const output = await manager.payments(paymentHash);

        expect(output)
          .toBeBN(paymentValue);
      });
    });
  });

  describe('methods', () => {
    let senderDeposit;

    before(async () => {
      manager = await VirtualPaymentManager.new(
        guardian,
        lockPeriod,
      );
    });

    describe('payable()', () => {
      it('expect to create new deposit', async () => {
        const depositValue = new BN(500);

        const output = await manager.send(depositValue, {
          from: sender,
        });

        logGasUsed(output);

        const { event, args } = output.logs[0];
        expect(event)
          .toBe('NewDeposit');
        expect(args.sender)
          .toBe(sender);
        expect(args.value)
          .toBeBN(depositValue);

        senderDeposit = depositValue;
      });
    });

    describe('depositPayment()', () => {
      it('expect to deposit payment', async () => {
        const paymentId = new BN(1);
        const paymentValue = new BN(100);
        const messageHash = soliditySha3(
          manager.address,
          sender,
          receiver,
          paymentId,
          paymentValue,
        );
        const senderSignature = await sign(messageHash, sender);
        const guardianSignature = await sign(messageHash, guardian);

        const output = await manager.depositPayment(
          sender,
          receiver,
          paymentId,
          paymentValue,
          senderSignature,
          guardianSignature,
        );

        logGasUsed(output);

        {
          const { event, args } = output.logs[0];
          expect(event)
            .toBe('NewPayment');
          expect(args.sender)
            .toBe(sender);
          expect(args.receiver)
            .toBe(receiver);
          expect(args.id)
            .toBeBN(paymentId);
          expect(args.value)
            .toBeBN(paymentValue);
        }

        {
          const { event, args } = output.logs[1];
          expect(event)
            .toBe('NewDeposit');
          expect(args.sender)
            .toBe(receiver);
          expect(args.value)
            .toBeBN(paymentValue);
        }

        senderDeposit = senderDeposit.sub(paymentValue);
      });
    });

    describe('withdrawPayment()', () => {
      it('expect to withdraw payment', async () => {
        const paymentId = new BN(2);
        const paymentValue = new BN(200);
        const messageHash = soliditySha3(
          manager.address,
          sender,
          receiver,
          paymentId,
          paymentValue,
        );
        const senderSignature = await sign(messageHash, sender);
        const guardianSignature = await sign(messageHash, guardian);
        const receiverBalance = await getBalance(receiver);

        const output = await manager.withdrawPayment(
          sender,
          receiver,
          paymentId,
          paymentValue,
          senderSignature,
          guardianSignature, {
            gasPrice,
          },
        );

        logGasUsed(output);

        {
          const { event, args } = output.logs[0];
          expect(event)
            .toBe('NewPayment');
          expect(args.sender)
            .toBe(sender);
          expect(args.receiver)
            .toBe(receiver);
          expect(args.id)
            .toBeBN(paymentId);
          expect(args.value)
            .toBeBN(paymentValue);
        }

        {
          const { event, args } = output.logs[1];
          expect(event)
            .toBe('NewWithdrawal');
          expect(args.receiver)
            .toBe(receiver);
          expect(args.value)
            .toBeBN(paymentValue);
        }

        expect(await getBalance(receiver))
          .toBeBN(receiverBalance.add(paymentValue));

        senderDeposit = senderDeposit.sub(paymentValue);
      });
    });

    describe('withdrawDeposit()', () => {
      it('expect to create withdrawal request', async () => {
        const output = await manager.withdrawDeposit({
          from: sender,
          gasPrice,
        });

        logGasUsed(output);

        const { event, args } = output.logs[0];
        expect(event)
          .toBe('NewWithdrawalRequest');
        expect(args.receiver)
          .toBe(sender);
        expect(args.unlockedAt)
          .toBeBN(now()
            .add(lockPeriod));
      });

      it('expect to process withdraw', async () => {
        const senderBalance = await getBalance(sender);

        await increaseTime(lockPeriod);

        const output = await manager.withdrawDeposit({
          from: sender,
          gasPrice,
        });

        logGasUsed(output);

        const { event, args } = output.logs[0];
        expect(event)
          .toBe('NewWithdrawal');
        expect(args.receiver)
          .toBe(sender);
        expect(args.value)
          .toBeBN(senderDeposit);

        expect(await getBalance(sender))
          .toBeBN(senderBalance.sub(getCost(output, gasPrice))
            .add(senderDeposit));
      });
    });
  });
});
