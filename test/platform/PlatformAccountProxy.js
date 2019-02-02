/* eslint-env mocha */
/* eslint-disable no-underscore-dangle */

const expect = require('expect');
const BN = require('bn.js');
const {
  ZERO_ADDRESS,
  anyToHex,
  abiEncodePacked,
  getMethodSignature,
  ethToWei,
} = require('@netgum/utils');
const { AccountAccessTypes } = require('../constants');
const { getGasPrice, signMessage, getBalance } = require('../utils');

const Account = artifacts.require('Account');
const PlatformAccountProxy = artifacts.require('PlatformAccountProxy');

contract('PlatformAccountProxy', (addresses) => {
  describe('views', () => {
    let account;
    let platformAccountProxy;
    let nonce = new BN(0);

    const DEVICES = {
      owner: addresses[1],
      virtualLimited: addresses[2],
      virtualUnlimited: addresses[3],
      invalid: addresses[4],
    };

    const PURPOSE = addresses[5];
    const LIMIT = new BN(1000);

    before(async () => {
      account = await Account.new(DEVICES.owner);

      platformAccountProxy = await PlatformAccountProxy.new();

      await account.addDevice(platformAccountProxy.address, AccountAccessTypes.OWNER, {
        from: DEVICES.owner,
      });

      await platformAccountProxy.addAccountVirtualDevice(
        account.address,
        nonce,
        DEVICES.virtualLimited,
        PURPOSE,
        LIMIT,
        false,
        0,
        '0x', {
          from: DEVICES.owner,
        },
      );

      nonce = nonce.add(new BN(1));

      await platformAccountProxy.addAccountVirtualDevice(
        account.address,
        nonce,
        DEVICES.virtualUnlimited,
        PURPOSE,
        0,
        true,
        0,
        '0x', {
          from: DEVICES.owner,
        },
      );

      nonce = nonce.add(new BN(1));
    });

    describe('getAccountNonce()', () => {
      it('expect to return account nonce', async () => {
        expect(await platformAccountProxy.getAccountNonce(account.address))
          .toEqualBN(nonce);
      });
    });

    describe('getAccountVirtualDevice()', () => {
      it('expect to return limited virtual device', async () => {
        const data = await platformAccountProxy.getAccountVirtualDevice(
          account.address,
          DEVICES.virtualLimited,
        );

        expect(data._purpose)
          .toBe(PURPOSE);
        expect(data._limit)
          .toEqualBN(LIMIT);
        expect(data._unlimited)
          .toBeFalsy();
      });

      it('expect to return unlimited virtual device', async () => {
        const data = await platformAccountProxy.getAccountVirtualDevice(
          account.address,
          DEVICES.virtualUnlimited,
        );

        expect(data._purpose)
          .toBe(PURPOSE);
        expect(data._limit)
          .toEqualBN(new BN(0));
        expect(data._unlimited)
          .toBeTruthy();
      });

      it('expect to return invalid virtual device', async () => {
        const data = await platformAccountProxy.getAccountVirtualDevice(
          account.address,
          DEVICES.invalid,
        );

        expect(data._purpose)
          .toBe(ZERO_ADDRESS);
        expect(data._limit)
          .toEqualBN(new BN(0));
        expect(data._unlimited)
          .toBeFalsy();
      });
    });

    describe('accountVirtualDeviceExists()', () => {
      it('expect to return true when virtual device exists', async () => {
        expect(await platformAccountProxy.accountVirtualDeviceExists(
          account.address,
          DEVICES.virtualLimited,
        ))
          .toBeTruthy();

        expect(await platformAccountProxy.accountVirtualDeviceExists(
          account.address,
          DEVICES.virtualUnlimited,
        ))
          .toBeTruthy();
      });

      it('expect to return false when virtual device doesn\'t exists', async () => {
        expect(await platformAccountProxy.accountVirtualDeviceExists(
          account.address,
          DEVICES.invalid,
        ))
          .toBeFalsy();
      });
    });
  });

  describe('methods', () => {
    let gasPrice;
    let account;
    let platformAccountProxy;
    let nonce = new BN(0);

    const DEVICES = {
      owner: addresses[1],
      delegate: addresses[2],
      virtualLimited: addresses[3],
      virtualUnlimited: addresses[4],
      invalid: addresses[5],
      sender: addresses[9],
    };

    const PURPOSE = addresses[6];
    const LIMIT = new BN(1000);

    before(async () => {
      gasPrice = await getGasPrice();
      account = await Account.new(DEVICES.owner);
      platformAccountProxy = await PlatformAccountProxy.new();

      await account.addDevice(platformAccountProxy.address, AccountAccessTypes.OWNER, {
        from: DEVICES.owner,
      });
    });

    describe('forwardAccountOwnerCall()', () => {
      it('expect to forward call to account', async () => {
        const data = account.contract.methods
          .addDevice(
            DEVICES.delegate,
            anyToHex(AccountAccessTypes.DELEGATE, { add0x: true }),
          )
          .encodeABI();

        const message = abiEncodePacked(
          'address',
          'bytes',
          'address',
          'uint256',
          'bytes',
          'uint256',
          'uint256',
        )(
          platformAccountProxy.address,
          getMethodSignature('forwardAccountOwnerCall', 'address', 'uint256', 'bytes', 'uint256', 'bytes'),
          account.address,
          nonce,
          data,
          0,
          gasPrice,
        );

        const signature = signMessage(message, DEVICES.owner);

        await platformAccountProxy.forwardAccountOwnerCall(
          account.address,
          nonce,
          data,
          0,
          signature, {
            gasPrice,
          },
        );

        expect(await account.getDeviceAccessType(DEVICES.delegate))
          .toEqualBN(AccountAccessTypes.DELEGATE);

        nonce = nonce.add(new BN(1));
      });

      it('expect to reject if signer is not OWNER device', async () => {
        const data = account.contract.methods
          .addDevice(
            DEVICES.invalid,
            anyToHex(AccountAccessTypes.DELEGATE, { add0x: true }),
          )
          .encodeABI();

        const message = abiEncodePacked(
          'address',
          'bytes',
          'address',
          'uint256',
          'bytes',
          'uint256',
          'uint256',
        )(
          platformAccountProxy.address,
          getMethodSignature('forwardAccountOwnerCall', 'address', 'uint256', 'bytes', 'uint256', 'bytes'),
          account.address,
          nonce,
          data,
          0,
          gasPrice,
        );

        const signature = signMessage(message, DEVICES.delegate);

        await expect(platformAccountProxy.forwardAccountOwnerCall(
          account.address,
          nonce,
          data,
          0,
          signature, {
            gasPrice,
          },
        ))
          .rejects
          .toThrow();
      });
    });

    describe('addAccountVirtualDevice()', () => {
      it('expect to add limited virtual device', async () => {
        const { logs: [log] } = await platformAccountProxy.addAccountVirtualDevice(
          account.address,
          nonce,
          DEVICES.virtualLimited,
          PURPOSE,
          LIMIT,
          false,
          0,
          '0x', {
            from: DEVICES.owner,
          },
        );

        expect(log.event)
          .toBe('AccountVirtualDeviceAdded');
        expect(log.args.accountAddress)
          .toBe(account.address);
        expect(log.args.deviceAddress)
          .toBe(DEVICES.virtualLimited);
        expect(log.args.purposeAddress)
          .toBe(PURPOSE);
        expect(log.args.limit)
          .toEqualBN(LIMIT);
        expect(log.args.unlimited)
          .toBeFalsy();

        nonce = nonce.add(new BN(1));
      });

      it('expect to add unlimited virtual device', async () => {
        const { logs: [log] } = await platformAccountProxy.addAccountVirtualDevice(
          account.address,
          nonce,
          DEVICES.virtualUnlimited,
          PURPOSE,
          0,
          true,
          0,
          '0x', {
            from: DEVICES.owner,
          },
        );

        expect(log.event)
          .toBe('AccountVirtualDeviceAdded');
        expect(log.args.accountAddress)
          .toBe(account.address);
        expect(log.args.deviceAddress)
          .toBe(DEVICES.virtualUnlimited);
        expect(log.args.purposeAddress)
          .toBe(PURPOSE);
        expect(log.args.limit)
          .toEqualBN(new BN(0));
        expect(log.args.unlimited)
          .toBeTruthy();

        nonce = nonce.add(new BN(1));
      });
    });

    describe('addAccountVirtualDevice()', () => {
      it('expect to update limit of limited virtual device', async () => {
        const { logs: [log] } = await platformAccountProxy.setAccountVirtualDeviceLimit(
          account.address,
          nonce,
          DEVICES.virtualLimited,
          LIMIT,
          0,
          '0x', {
            from: DEVICES.owner,
          },
        );

        expect(log.event)
          .toBe('AccountVirtualDeviceLimitUpdated');
        expect(log.args.accountAddress)
          .toBe(account.address);
        expect(log.args.deviceAddress)
          .toBe(DEVICES.virtualLimited);
        expect(log.args.limit)
          .toEqualBN(LIMIT);

        nonce = nonce.add(new BN(1));
      });
    });

    describe('removeAccountVirtualDevice()', () => {
      it('expect to remove virtual device', async () => {
        const { logs: [log] } = await platformAccountProxy.removeAccountVirtualDevice(
          account.address,
          nonce,
          DEVICES.virtualUnlimited,
          0,
          '0x', {
            from: DEVICES.owner,
          },
        );

        expect(log.event)
          .toBe('AccountVirtualDeviceRemoved');
        expect(log.args.accountAddress)
          .toBe(account.address);
        expect(log.args.deviceAddress)
          .toBe(DEVICES.virtualUnlimited);

        nonce = nonce.add(new BN(1));
      });
    });

    describe('executeTransaction()', () => {
      it('expect to send transaction from limited virtual device', async () => {
        const to = PURPOSE;
        const value = new BN(250);
        const data = '0x';
        await account.send(value);

        const message = abiEncodePacked(
          'address',
          'bytes',
          'address',
          'uint256',
          'address',
          'uint256',
          'bytes',
          'uint256',
          'uint256',
        )(
          platformAccountProxy.address,
          getMethodSignature('executeTransaction', 'address', 'uint256', 'address', 'uint256', 'bytes', 'uint256', 'bytes'),
          account.address,
          nonce,
          to,
          value,
          Buffer.alloc(0),
          0,
          gasPrice,
        );

        const signature = signMessage(message, DEVICES.virtualLimited);

        const { logs: [log] } = await platformAccountProxy.executeTransaction(
          account.address,
          nonce,
          to,
          value,
          data,
          0,
          signature, {
            from: DEVICES.sender,
            gasPrice,
          },
        );

        expect(log.event)
          .toBe('AccountVirtualDeviceLimitUpdated');
        expect(log.args.accountAddress)
          .toBe(account.address);
        expect(log.args.deviceAddress)
          .toBe(DEVICES.virtualLimited);
        expect(log.args.limit)
          .toEqualBN(LIMIT.sub(value));

        nonce = nonce.add(new BN(1));
      });

      it('expect to send refunded transaction from limited virtual device', async () => {
        const to = PURPOSE;
        const value = new BN(250);
        const data = '0x';
        const fixedGas = new BN(10);

        await account.send(ethToWei(0.1));
        const accountBalanceBefore = await getBalance(account);
        const senderBalanceBefore = await getBalance(DEVICES.sender);

        const message = abiEncodePacked(
          'address',
          'bytes',
          'address',
          'uint256',
          'address',
          'uint256',
          'bytes',
          'uint256',
          'uint256',
        )(
          platformAccountProxy.address,
          getMethodSignature('executeTransaction', 'address', 'uint256', 'address', 'uint256', 'bytes', 'uint256', 'bytes'),
          account.address,
          nonce,
          to,
          value,
          Buffer.alloc(0),
          fixedGas,
          gasPrice,
        );

        const signature = signMessage(message, DEVICES.virtualLimited);

        const { receipt: { gasUsed } } = await platformAccountProxy.executeTransaction(
          account.address,
          nonce,
          to,
          value,
          data,
          fixedGas,
          signature, {
            from: DEVICES.sender,
            gasPrice,
          },
        );

        const totalCost = gasPrice.mul(new BN(gasUsed));
        const accountBalanceDiff = accountBalanceBefore.sub(await getBalance(account));
        const senderBalanceDiff = senderBalanceBefore.sub(await getBalance(DEVICES.sender));
        const totalRefund = accountBalanceDiff.sub(value);

        expect(totalRefund.gt(new BN(0)))
          .toBeTruthy();
        expect(totalCost)
          .toEqualBN(totalRefund.add(senderBalanceDiff));

        nonce = nonce.add(new BN(1));
      });
    });
  });
});
