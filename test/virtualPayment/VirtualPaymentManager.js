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
} = require('../shared/utils');
const { ZERO_ADDRESS } = require('../shared/constants');

const VirtualPaymentManager = artifacts.require('VirtualPaymentManager');
const ExampleToken = artifacts.require('ExampleToken');

contract.only('VirtualPaymentManager', ([guardian, sender, recipient]) => {
  const lockPeriod = new BN(24 * 60 * 60); // 1 day

  let manager;
  let token;
  let gasPrice;

  before(async () => {
    gasPrice = await getGasPrice();
    token = await ExampleToken.new();
  });

  describe('views', () => {
    const paymentId = new BN(1);
    const weiDeposit = new BN(500);
    const weiPaymentValue = new BN(200);
    const tokenDeposit = new BN(1000);
    const tokenPaymentValue = new BN(200);

    before(async () => {
      manager = await VirtualPaymentManager.new(
        guardian,
        lockPeriod,
      );

      // wei
      {
        await manager.send(weiDeposit, {
          from: sender,
        });
        const messageHash = soliditySha3(
          manager.address,
          sender,
          recipient,
          ZERO_ADDRESS,
          paymentId,
          weiPaymentValue,
        );
        const senderSignature = await sign(messageHash, sender);
        const guardianSignature = await sign(messageHash, guardian);

        await manager.depositPayment(
          sender,
          recipient,
          ZERO_ADDRESS,
          paymentId,
          weiPaymentValue,
          senderSignature,
          guardianSignature,
        );
      }

      // token
      {
        await token.mint(tokenDeposit, {
          from: sender,
        });

        await token.approve(manager.address, tokenDeposit, {
          from: sender,
        });

        await manager.depositToken(token.address, tokenDeposit, {
          from: sender,
        });

        const messageHash = soliditySha3(
          manager.address,
          sender,
          recipient,
          token.address,
          paymentId,
          tokenPaymentValue,
        );
        const senderSignature = await sign(messageHash, sender);
        const guardianSignature = await sign(messageHash, guardian);

        await manager.depositPayment(
          sender,
          recipient,
          token.address,
          paymentId,
          tokenPaymentValue,
          senderSignature,
          guardianSignature,
        );
      }
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

    describe('getDepositValue()', () => {
      it('expect to return sender wei deposit', async () => {
        const output = await manager.getDepositValue(sender, ZERO_ADDRESS);

        expect(output)
          .toBeBN(weiDeposit.sub(weiPaymentValue));
      });

      it('expect to return sender token deposit', async () => {
        const output = await manager.getDepositValue(sender, token.address);

        expect(output)
          .toBeBN(tokenDeposit.sub(tokenPaymentValue));
      });
    });

    describe('getDepositWithdrawalUnlockedAt()', () => {
      it('expect to return sender wei withdrawal unlocked time', async () => {
        const output = await manager.getDepositWithdrawalUnlockedAt(sender, ZERO_ADDRESS);

        expect(output)
          .toBeBN(new BN(0));
      });

      it('expect to return sender token deposit', async () => {
        const output = await manager.getDepositWithdrawalUnlockedAt(sender, token.address);

        expect(output)
          .toBeBN(new BN(0));
      });
    });

    describe('payments()', () => {
      it('expect to return sender wei payment', async () => {
        const paymentHash = soliditySha3(
          sender,
          recipient,
          ZERO_ADDRESS,
          paymentId,
        );

        const output = await manager.payments(paymentHash);

        expect(output)
          .toBeBN(weiPaymentValue);
      });

      it('expect to return sender token payment', async () => {
        const paymentHash = soliditySha3(
          sender,
          recipient,
          token.address,
          paymentId,
        );

        const output = await manager.payments(paymentHash);

        expect(output)
          .toBeBN(weiPaymentValue);
      });
    });
  });

  describe('methods', () => {
    let senderWeiDeposit;
    let senderTokenDeposit;

    before(async () => {
      manager = await VirtualPaymentManager.new(
        guardian,
        lockPeriod,
      );
    });

    describe('payable()', () => {
      it('expect to create new wei deposit', async () => {
        const depositValue = new BN(500);

        const output = await manager.send(depositValue, {
          from: sender,
        });

        logGasUsed(output);

        const { event, args } = output.logs[0];
        expect(event)
          .toBe('NewDeposit');
        expect(args.owner)
          .toBe(sender);
        expect(args.token)
          .toBe(ZERO_ADDRESS);
        expect(args.value)
          .toBeBN(depositValue);

        senderWeiDeposit = depositValue;
      });
    });

    describe('depositToken()', () => {
      it('expect to create new token deposit', async () => {
        const depositValue = new BN(200);

        await token.mint(depositValue, {
          from: sender,
        });

        await token.approve(manager.address, depositValue, {
          from: sender,
        });

        const output = await manager.depositToken(token.address, depositValue, {
          from: sender,
        });

        logGasUsed(output);

        const { event, args } = output.logs[0];
        expect(event)
          .toBe('NewDeposit');
        expect(args.owner)
          .toBe(sender);
        expect(args.token)
          .toBe(token.address);
        expect(args.value)
          .toBeBN(depositValue);

        senderTokenDeposit = depositValue;
      });
    });

    describe('depositPayment()', () => {
      const paymentId = new BN(1);

      it('expect to deposit wei payment', async () => {
        const paymentValue = new BN(100);
        const messageHash = soliditySha3(
          manager.address,
          sender,
          recipient,
          ZERO_ADDRESS,
          paymentId,
          paymentValue,
        );
        const senderSignature = await sign(messageHash, sender);
        const guardianSignature = await sign(messageHash, guardian);

        const output = await manager.depositPayment(
          sender,
          recipient,
          ZERO_ADDRESS,
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
          expect(args.recipient)
            .toBe(recipient);
          expect(args.token)
            .toBe(ZERO_ADDRESS);
          expect(args.id)
            .toBeBN(paymentId);
          expect(args.value)
            .toBeBN(paymentValue);
        }

        {
          const { event, args } = output.logs[1];
          expect(event)
            .toBe('NewDeposit');
          expect(args.owner)
            .toBe(recipient);
          expect(args.token)
            .toBe(ZERO_ADDRESS);
          expect(args.value)
            .toBeBN(paymentValue);
        }

        senderWeiDeposit = senderWeiDeposit.sub(paymentValue);
      });

      it('expect to deposit token payment', async () => {
        const paymentValue = new BN(50);
        const messageHash = soliditySha3(
          manager.address,
          sender,
          recipient,
          token.address,
          paymentId,
          paymentValue,
        );
        const senderSignature = await sign(messageHash, sender);
        const guardianSignature = await sign(messageHash, guardian);

        const output = await manager.depositPayment(
          sender,
          recipient,
          token.address,
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
          expect(args.recipient)
            .toBe(recipient);
          expect(args.token)
            .toBe(token.address);
          expect(args.id)
            .toBeBN(paymentId);
          expect(args.value)
            .toBeBN(paymentValue);
        }

        {
          const { event, args } = output.logs[1];
          expect(event)
            .toBe('NewDeposit');
          expect(args.owner)
            .toBe(recipient);
          expect(args.token)
            .toBe(token.address);
          expect(args.value)
            .toBeBN(paymentValue);
        }

        senderTokenDeposit = senderTokenDeposit.sub(paymentValue);
      });
    });

    describe('withdrawPayment()', () => {
      const paymentId = new BN(2);

      it('expect to withdraw wei payment', async () => {
        const paymentValue = new BN(200);
        const messageHash = soliditySha3(
          manager.address,
          sender,
          recipient,
          ZERO_ADDRESS,
          paymentId,
          paymentValue,
        );
        const senderSignature = await sign(messageHash, sender);
        const guardianSignature = await sign(messageHash, guardian);
        const recipientBalance = await getBalance(recipient);

        const output = await manager.withdrawPayment(
          sender,
          recipient,
          ZERO_ADDRESS,
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
          expect(args.recipient)
            .toBe(recipient);
          expect(args.token)
            .toBe(ZERO_ADDRESS);
          expect(args.id)
            .toBeBN(paymentId);
          expect(args.value)
            .toBeBN(paymentValue);
        }

        {
          const { event, args } = output.logs[1];
          expect(event)
            .toBe('NewWithdrawal');
          expect(args.recipient)
            .toBe(recipient);
          expect(args.token)
            .toBe(ZERO_ADDRESS);
          expect(args.value)
            .toBeBN(paymentValue);
        }

        expect(await getBalance(recipient))
          .toBeBN(recipientBalance.add(paymentValue));

        senderWeiDeposit = senderWeiDeposit.sub(paymentValue);
      });

      it('expect to withdraw token payment', async () => {
        const paymentValue = new BN(10);
        const messageHash = soliditySha3(
          manager.address,
          sender,
          recipient,
          token.address,
          paymentId,
          paymentValue,
        );
        const senderSignature = await sign(messageHash, sender);
        const guardianSignature = await sign(messageHash, guardian);
        const recipientBalance = await token.balanceOf(recipient);

        const output = await manager.withdrawPayment(
          sender,
          recipient,
          token.address,
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
          expect(args.recipient)
            .toBe(recipient);
          expect(args.token)
            .toBe(token.address);
          expect(args.id)
            .toBeBN(paymentId);
          expect(args.value)
            .toBeBN(paymentValue);
        }

        {
          const { event, args } = output.logs[1];
          expect(event)
            .toBe('NewWithdrawal');
          expect(args.recipient)
            .toBe(recipient);
          expect(args.token)
            .toBe(token.address);
          expect(args.value)
            .toBeBN(paymentValue);
        }

        expect(await token.balanceOf(recipient))
          .toBeBN(recipientBalance.add(paymentValue));

        senderTokenDeposit = senderTokenDeposit.sub(paymentValue);
      });
    });

    describe('withdrawDeposit()', () => {
      it('expect to create wei withdrawal request', async () => {
        const output = await manager.withdrawDeposit(ZERO_ADDRESS, {
          from: sender,
        });

        logGasUsed(output);

        const { event, args } = output.logs[0];
        expect(event)
          .toBe('NewWithdrawalRequest');
        expect(args.owner)
          .toBe(sender);
        expect(args.token)
          .toBe(ZERO_ADDRESS);
      });

      it('expect to process wei withdraw', async () => {
        const senderBalance = await getBalance(sender);

        await increaseTime(lockPeriod.add(new BN(1)));

        const output = await manager.withdrawDeposit(ZERO_ADDRESS, {
          from: sender,
          gasPrice,
        });

        logGasUsed(output);

        const { event, args } = output.logs[0];
        expect(event)
          .toBe('NewWithdrawal');
        expect(args.recipient)
          .toBe(sender);
        expect(args.token)
          .toBe(ZERO_ADDRESS);
        expect(args.value)
          .toBeBN(senderWeiDeposit);

        expect(await getBalance(sender))
          .toBeBN(senderBalance.sub(getCost(output, gasPrice))
            .add(senderWeiDeposit));
      });

      it('expect to create token withdrawal request', async () => {
        const output = await manager.withdrawDeposit(token.address, {
          from: sender,
        });

        logGasUsed(output);

        const { event, args } = output.logs[0];
        expect(event)
          .toBe('NewWithdrawalRequest');
        expect(args.owner)
          .toBe(sender);
        expect(args.token)
          .toBe(token.address);
      });

      it('expect to process wei withdraw', async () => {
        const senderBalance = await token.balanceOf(sender);

        await increaseTime(lockPeriod.add(new BN(1)));

        const output = await manager.withdrawDeposit(token.address, {
          from: sender,
        });

        logGasUsed(output);

        const { event, args } = output.logs[0];
        expect(event)
          .toBe('NewWithdrawal');
        expect(args.recipient)
          .toBe(sender);
        expect(args.token)
          .toBe(token.address);
        expect(args.value)
          .toBeBN(senderTokenDeposit);

        expect(await token.balanceOf(sender))
          .toBeBN(senderBalance.add(senderTokenDeposit));
      });
    });
  });
});
