/* eslint-env mocha */

const expect = require('expect');
const { getEnsNameHash, getEnsLabelHash } = require('../../shared/utils');
const {
  BN,
  logGasUsed,
  computeContractAddress,
  soliditySha3,
  sign,
  getMethodSign,
  getGasPrice,
  toWei,
  sendTransaction,
} = require('../shared/utils');

const Account = artifacts.require('Account');
const AccountProvider = artifacts.require('AccountProvider');
const ENSRegistry = artifacts.require('ENSRegistry');

contract('AccountProvider', (addresses) => {
  const accountSaltPrefix = '0x01';
  const accountSaltPrefixUnsafe = '0x02';
  const accountDevices = {
    guardian: addresses[1],
    owners: [addresses[2], addresses[3]],
    invalid: addresses[4],
    accountProxy: addresses[8],
  };
  const ensNameHash = getEnsNameHash('test');

  let gasPrice;
  let ens;
  let guardian;
  let accountProvider;

  before(async () => {
    gasPrice = await getGasPrice();
    ens = await ENSRegistry.new();
    guardian = await Account.new({
      from: accountDevices.guardian,
    });

    accountProvider = await AccountProvider.new(
      guardian.address,
      Account.binary,
      accountDevices.accountProxy,
      ens.address,
    );

    await ens.setSubnodeOwner('0x00', getEnsLabelHash('test'), addresses[0]);

    await accountProvider.addEnsRootNode(ensNameHash);

    await ens.setOwner(ensNameHash, accountProvider.address);

    await accountProvider.verifyEnsRootNode(ensNameHash);
  });

  describe('methods', () => {
    const methodSigns = {
      createAccount: getMethodSign(
        'createAccount', 'bytes32', 'bytes32', 'uint256', 'bytes',
      ),
      updateAccountEnsName: getMethodSign(
        'updateAccountEnsName', 'bytes32', 'bytes32', 'bytes',
      ),
    };

    describe('createAccount()', () => {
      it('expect to create new account and refund', async () => {
        const labelHash = getEnsLabelHash('test1');
        const refundGas = new BN(1);
        const salt = soliditySha3(
          accountSaltPrefix,
          soliditySha3(accountDevices.owners[0]),
        );
        const accountAddress = computeContractAddress(
          accountProvider.address,
          salt,
          Account.bytecode,
        );
        const messageHash = soliditySha3(
          accountProvider.address,
          methodSigns.createAccount,
          labelHash,
          ensNameHash,
          refundGas,
          gasPrice,
        );

        await sendTransaction({
          from: addresses[0],
          to: accountAddress,
          value: toWei('1', 'ether'),
        });

        const output = await accountProvider.createAccount(
          labelHash,
          ensNameHash,
          refundGas,
          await sign(messageHash, accountDevices.owners[0]), {
            from: accountDevices.guardian,
            gasPrice,
          },
        );

        logGasUsed(output);

        const { logs: [log] } = output;

        expect(log.event)
          .toBe('AccountCreated');
        expect(log.args.account)
          .toBe(accountAddress);
      });

      it('expect to create new account without ens name', async () => {
        const salt = soliditySha3(
          accountSaltPrefix,
          soliditySha3(accountDevices.owners[1]),
        );
        const accountAddress = computeContractAddress(
          accountProvider.address,
          salt,
          Account.bytecode,
        );
        const messageHash = soliditySha3(
          accountProvider.address,
          methodSigns.createAccount,
          0,
          0,
          0,
          gasPrice,
        );

        await sendTransaction({
          from: addresses[0],
          to: accountAddress,
          value: toWei('1', 'ether'),
        });

        const output = await accountProvider.createAccount(
          '0x',
          '0x',
          0,
          await sign(messageHash, accountDevices.owners[1]), {
            from: accountDevices.guardian,
            gasPrice,
          },
        );

        logGasUsed(output);

        const { logs: [log] } = output;

        expect(log.event)
          .toBe('AccountCreated');
        expect(log.args.account)
          .toBe(accountAddress);
      });
    });

    describe('unsafeCreateAccount()', () => {
      it('expect to create new account', async () => {
        const accountId = new BN(1);
        const labelHash = getEnsLabelHash('test2');
        const refundGas = new BN(0);
        const salt = soliditySha3(
          accountSaltPrefixUnsafe,
          accountId,
        );
        const accountAddress = computeContractAddress(
          accountProvider.address,
          salt,
          Account.bytecode,
        );

        const output = await accountProvider.unsafeCreateAccount(
          accountId,
          accountDevices.owners[0],
          labelHash,
          ensNameHash,
          refundGas, {
            from: accountDevices.guardian,
          },
        );

        logGasUsed(output);

        const { logs: [log] } = output;

        expect(log.event)
          .toBe('AccountCreated');
        expect(log.args.account)
          .toBe(accountAddress);
      });

      it('expect to create new account without ens name', async () => {
        const accountId = new BN(2);
        const salt = soliditySha3(
          accountSaltPrefixUnsafe,
          accountId,
        );
        const accountAddress = computeContractAddress(
          accountProvider.address,
          salt,
          Account.bytecode,
        );

        const output = await accountProvider.unsafeCreateAccount(
          accountId,
          accountDevices.owners[0],
          '0x',
          '0x',
          0, {
            from: accountDevices.guardian,
          },
        );

        logGasUsed(output);

        const { logs: [log] } = output;

        expect(log.event)
          .toBe('AccountCreated');
        expect(log.args.account)
          .toBe(accountAddress);
      });

      it('expect to create new account and refund', async () => {
        const accountId = new BN(3);
        const labelHash = getEnsLabelHash('test3');
        const refundGas = new BN(1);
        const salt = soliditySha3(
          accountSaltPrefixUnsafe,
          accountId,
        );
        const accountAddress = computeContractAddress(
          accountProvider.address,
          salt,
          Account.bytecode,
        );

        await sendTransaction({
          from: addresses[0],
          to: accountAddress,
          value: toWei('1', 'ether'),
        });

        const output = await accountProvider.unsafeCreateAccount(
          accountId,
          accountDevices.owners[0],
          labelHash,
          ensNameHash,
          refundGas, {
            from: accountDevices.guardian,
          },
        );

        logGasUsed(output);

        const { logs: [log] } = output;

        expect(log.event)
          .toBe('AccountCreated');
        expect(log.args.account)
          .toBe(accountAddress);
      });
    });

    describe.only('updateAccountEnsName()', () => {
      let account;
      const owner = accountDevices.owners[1];

      before(async () => {
        const accountId = new BN(4);
        const output = await accountProvider.unsafeCreateAccount(
          accountId,
          owner,
          '0x',
          '0x',
          0, {
            from: accountDevices.guardian,
          },
        );

        const { logs: [log] } = output;

        account = await Account.at(log.args.account);
      });

      it('expect to update account ens name', async () => {
        const labelHash = getEnsLabelHash('test4');
        const messageHash = soliditySha3(
          accountProvider.address,
          methodSigns.updateAccountEnsName,
          labelHash,
          ensNameHash,
          account.address,
        );

        const data = accountProvider.contract.methods.updateAccountEnsName(
          labelHash,
          ensNameHash,
          await sign(messageHash, accountDevices.guardian),
        ).encodeABI();

        const output = await account.executeTransaction(
          accountProvider.address,
          0,
          data, {
            from: owner,
          },
        );

        logGasUsed(output);
      });
    });
  });
});
