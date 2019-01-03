/* eslint-env mocha */

const expect = require('expect');
const {
  sha3,
  abiEncodePacked,
  getEnsNameInfo,
  getEnsLabelHash,
  computeCreate2Address,
  getMethodSignature,
} = require('@netgum/utils');
const { AccountAccessTypes } = require('../constants');
const { createAccount, createEnsContracts } = require('../helpers');
const { signMessage } = require('../utils');

const Account = artifacts.require('Account');
const AccountProvider = artifacts.require('AccountProvider');
const AccountProxy = artifacts.require('AccountProxy');
const Registry = artifacts.require('Registry');

contract('AccountProvider', (addresses) => {
  let ens;
  let ensRegistrar;

  let registry;
  let registryGuardian;

  let accountProvider;
  let accountProviderGuardian;
  let accountProxy;
  let counter = 1;

  const registryGuardianDevice = addresses[2];
  const accountProviderGuardianDevice = addresses[1];
  const accountProviderEnsRootNameInfo = getEnsNameInfo('account.test');

  before(async () => {
    ({
      ens,
      ensRegistrar,
    } = await createEnsContracts());

    registryGuardian = await createAccount(registryGuardianDevice);
    registry = await Registry.new(
      registryGuardian.address,
      Account.bytecode,
    );

    accountProxy = await AccountProxy.new();
    accountProviderGuardian = await createAccount(accountProviderGuardianDevice);

    {
      const seed = sha3('AccountProvider');

      const { logs: [{ args: { service } }] } = await registry.deployService(seed, AccountProvider.binary, true, {
        from: registryGuardianDevice,
      });
      accountProvider = await AccountProvider.at(service);

      await accountProvider.initialize(
        accountProviderGuardian.address,
        ens.address,
        accountProviderEnsRootNameInfo.nameHash,
        accountProxy.address, {
          from: registryGuardianDevice,
        },
      );
    }

    await ensRegistrar.register(
      accountProviderEnsRootNameInfo.labelHash,
      accountProvider.address,
    );
  });

  describe('methods', () => {
    describe('createAccount()', () => {
      it('should create account', async () => {
        const ownerDevice = addresses[2];
        const salt = sha3(counter += 1);
        const accountAddress = computeCreate2Address(
          registry.address,
          salt,
          Account.bytecode,
        );

        const message = abiEncodePacked(
          'address',
          'bytes',
          'bytes32',
        )(
          accountProvider.address,
          getMethodSignature('createAccount', 'bytes32', 'bytes', 'bytes'),
          salt,
        );

        const deviceSignature = signMessage(message, ownerDevice);
        const guardianSignature = signMessage(deviceSignature, accountProviderGuardianDevice);

        const { logs: [log] } = await accountProvider.createAccount(
          salt,
          deviceSignature,
          guardianSignature,
        );

        const account = await Account.at(log.args.account);

        expect(log.event)
          .toBe('AccountCreated');
        expect(log.args.account)
          .toBe(accountAddress);

        expect(await account.getDeviceAccessType(ownerDevice))
          .toEqualBN(AccountAccessTypes.OWNER);

        expect(await registry.accountExists(accountAddress))
          .toBeTruthy();
      });
    });

    describe('createAccountWithEnsLabel()', () => {
      it('should create account with ens label', async () => {
        const ownerDevice = addresses[2];
        const salt = sha3(counter += 1);
        const ensLabelHash = getEnsLabelHash('test1');
        const accountAddress = computeCreate2Address(
          registry.address,
          salt,
          Account.bytecode,
        );

        const message = abiEncodePacked(
          'address',
          'bytes',
          'bytes32',
          'bytes32',
        )(
          accountProvider.address,
          getMethodSignature('createAccountWithEnsLabel', 'bytes32', 'bytes32', 'bytes', 'bytes'),
          salt,
          ensLabelHash,
        );

        const deviceSignature = signMessage(message, ownerDevice);
        const guardianSignature = signMessage(deviceSignature, accountProviderGuardianDevice);

        const { logs: [log] } = await accountProvider.createAccountWithEnsLabel(
          salt,
          ensLabelHash,
          deviceSignature,
          guardianSignature,
        );

        const account = await Account.at(log.args.account);

        expect(log.event)
          .toBe('AccountCreated');
        expect(log.args.account)
          .toBe(accountAddress);

        expect(await account.getDeviceAccessType(ownerDevice))
          .toEqualBN(AccountAccessTypes.OWNER);

        expect(await registry.accountExists(accountAddress))
          .toBeTruthy();
      });
    });
  });
});
