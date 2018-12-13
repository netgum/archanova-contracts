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
const { AccountAccessTypes } = require('../../shared/constants');
const { createAccount, createEnsContracts } = require('../../shared/helpers');
const { signMessage } = require('../../shared/utils');

const Account = artifacts.require('Account');
const AccountCreatorService = artifacts.require('AccountCreatorService');
const AccountProxyService = artifacts.require('AccountProxyService');
const Registry = artifacts.require('Registry');

contract('AccountCreatorService', (addresses) => {
  let ens;
  let ensRegistrar;
  let ensResolver;

  let registry;
  let registryGuardian;

  let accountCreatorService;
  let accountCreatorServiceGuardian;
  let accountProxyService;
  let counter = 1;

  const registryGuardianDevice = addresses[2];
  const accountCreatorServiceGuardianDevice = addresses[1];
  const accountCreatorServiceEnsRootNameInfo = getEnsNameInfo('account.test');

  before(async () => {
    ({
      ens,
      ensResolver,
      ensRegistrar,
    } = await createEnsContracts(addresses[0]));

    accountProxyService = await AccountProxyService.new();

    registryGuardian = await createAccount(addresses[0], registryGuardianDevice);
    registry = await Registry.new(registryGuardian.address);

    accountCreatorServiceGuardian = await createAccount(addresses[0], accountCreatorServiceGuardianDevice);

    accountCreatorService = await AccountCreatorService.new(
      registry.address,
      accountCreatorServiceGuardian.address,
      ens.address,
      ensResolver.address,
      accountCreatorServiceEnsRootNameInfo.nameHash,
      accountProxyService.address,
      Account.bytecode,
    );

    await ensRegistrar.register(
      accountCreatorServiceEnsRootNameInfo.labelHash,
      accountCreatorService.address,
    );

    await registry.registerService(accountCreatorService.address, true, {
      from: registryGuardianDevice,
    });
  });

  describe('methods', () => {
    describe('createAccount()', () => {
      it('should create account', async () => {
        const ownerDevice = addresses[2];
        const salt = sha3(counter += 1);
        const accountAddress = computeCreate2Address(
          accountCreatorService.address,
          salt,
          Account.bytecode,
        );

        const message = abiEncodePacked(
          'address',
          'bytes',
          'bytes32',
        )(
          accountCreatorService.address,
          getMethodSignature('createAccount', 'bytes32', 'bytes', 'bytes'),
          salt,
        );

        const deviceSignature = signMessage(message, ownerDevice);
        const guardianSignature = signMessage(deviceSignature, accountCreatorServiceGuardianDevice);

        const { logs: [log] } = await accountCreatorService.createAccount(
          salt,
          deviceSignature,
          guardianSignature,
        );

        const account = await Account.at(log.args.account);

        expect(log.event)
          .toBe('AccountCreated');
        expect(log.args.account.toLowerCase())
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
          accountCreatorService.address,
          salt,
          Account.bytecode,
        );

        const message = abiEncodePacked(
          'address',
          'bytes',
          'bytes32',
          'bytes32',
        )(
          accountCreatorService.address,
          getMethodSignature('createAccountWithEnsLabel', 'bytes32', 'bytes32', 'bytes', 'bytes'),
          salt,
          ensLabelHash,
        );

        const deviceSignature = signMessage(message, ownerDevice);
        const guardianSignature = signMessage(deviceSignature, accountCreatorServiceGuardianDevice);

        const { logs: [log] } = await accountCreatorService.createAccountWithEnsLabel(
          salt,
          ensLabelHash,
          deviceSignature,
          guardianSignature,
        );

        const account = await Account.at(log.args.account);

        expect(log.event)
          .toBe('AccountCreated');
        expect(log.args.account.toLowerCase())
          .toBe(accountAddress);

        expect(await account.getDeviceAccessType(ownerDevice))
          .toEqualBN(AccountAccessTypes.OWNER);

        expect(await registry.accountExists(accountAddress))
          .toBeTruthy();
      });
    });
  });
});
