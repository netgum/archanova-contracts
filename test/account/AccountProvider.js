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
    owner: addresses[2],
    invalid: addresses[3],
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
    };

    describe('createAccount()', () => {
      it('expect to create new account and refund', async () => {
        const labelHash = getEnsLabelHash('test1');
        const fixedGas = new BN(1);
        const salt = soliditySha3(
          accountSaltPrefix,
          soliditySha3(accountDevices.owner),
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
          fixedGas,
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
          fixedGas,
          await sign(messageHash, accountDevices.owner), {
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
        const fixedGas = new BN(0);
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
          accountDevices.owner,
          labelHash,
          ensNameHash,
          fixedGas, {
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
        const accountId = new BN(2);
        const labelHash = getEnsLabelHash('test3');
        const fixedGas = new BN(1);
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
          accountDevices.owner,
          labelHash,
          ensNameHash,
          fixedGas, {
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
  });
});
