/* eslint-env mocha */

const expect = require('expect');
const { ZERO_ADDRESS } = require('../../shared/constants');
const { getEnsNameHash, getEnsLabelHash } = require('../../shared/utils');
const { ACCOUNT_SALT_MSG_PREFIX, ACCOUNT_SALT_MSG_PREFIX_UNSAFE } = require('../constants');
const {
  BN,
  logGasUsed,
  computeContractAddress,
  soliditySha3,
  sign,
  getMethodSign,
} = require('../utils');

const Account = artifacts.require('Account');
const AccountProvider = artifacts.require('AccountProvider');
const ENSRegistry = artifacts.require('ENSRegistry');

contract('AccountProvider', (addresses) => {
  const accountDevices = {
    guardian: addresses[1],
    owner: addresses[2],
    invalid: addresses[3],
    accountProxy: addresses[8],
  };
  const ensNameHash = getEnsNameHash('test');

  let ens;
  let guardian;
  let accountProvider;

  before(async () => {
    ens = await ENSRegistry.new();
    guardian = await Account.new();

    await guardian.initialize([
      accountDevices.guardian,
    ], 0, ZERO_ADDRESS);

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
      it('expect to create new account', async () => {
        const labelHash = getEnsLabelHash('test1');
        const refundAmount = new BN(0);
        const salt = soliditySha3(
          ACCOUNT_SALT_MSG_PREFIX,
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
          refundAmount,
        );

        const output = await accountProvider.createAccount(
          labelHash,
          ensNameHash,
          refundAmount,
          await sign(messageHash, accountDevices.owner), {
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

    describe('unsafeCreateAccount()', () => {
      it('expect to create new account', async () => {
        const accountId = new BN(1);
        const labelHash = getEnsLabelHash('test2');
        const refundAmount = new BN(0);
        const salt = soliditySha3(
          ACCOUNT_SALT_MSG_PREFIX_UNSAFE,
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
          refundAmount, {
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
