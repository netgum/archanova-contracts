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
const AccountService = artifacts.require('AccountService');
const AccountProxyService = artifacts.require('AccountProxyService');
const Registry = artifacts.require('Registry');

contract('AccountService', (addresses) => {
  let ens;
  let ensRegistrar;
  let ensResolver;
  let registry;
  let registryGuardian;
  let service;
  let proxyService;
  let serviceGuardian;
  let counter = 1;

  const registryGuardianDevice = addresses[2];
  const serviceGuardianDevice = addresses[1];
  const serviceEnsRootNameInfo = getEnsNameInfo('account.test');

  before(async () => {
    ({
      ens,
      ensResolver,
      ensRegistrar,
    } = await createEnsContracts(addresses[0]));

    proxyService = await AccountProxyService.new();

    // registry
    registryGuardian = await createAccount(addresses[0], registryGuardianDevice);
    registry = await Registry.new(registryGuardian.address);

    // service
    serviceGuardian = await createAccount(addresses[0], serviceGuardianDevice);

    service = await AccountService.new(
      registry.address,
      serviceGuardian.address,
      ens.address,
      ensResolver.address,
      serviceEnsRootNameInfo.nameHash,
      proxyService.address,
      Account.bytecode,
    );

    await ensRegistrar.register(
      serviceEnsRootNameInfo.labelHash,
      service.address,
    );

    await registry.registerService(service.address, true, {
      from: registryGuardianDevice,
    });
  });

  describe('methods', () => {
    describe('createAccount()', () => {
      it('should create account', async () => {
        const ownerDevice = addresses[2];
        const salt = sha3(counter += 1);
        const accountAddress = computeCreate2Address(
          service.address,
          salt,
          Account.bytecode,
        );

        const message = abiEncodePacked(
          'address',
          'bytes',
          'bytes32',
        )(
          service.address,
          getMethodSignature('createAccount', 'bytes32', 'bytes', 'bytes'),
          salt,
        );

        const deviceSignature = signMessage(message, ownerDevice);
        const guardianSignature = signMessage(deviceSignature, serviceGuardianDevice);

        const { logs: [log] } = await service.createAccount(
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
          service.address,
          salt,
          Account.bytecode,
        );

        const message = abiEncodePacked(
          'address',
          'bytes',
          'bytes32',
          'bytes32',
        )(
          service.address,
          getMethodSignature('createAccountWithEnsLabel', 'bytes32', 'bytes32', 'bytes', 'bytes'),
          salt,
          ensLabelHash,
        );

        const deviceSignature = signMessage(message, ownerDevice);
        const guardianSignature = signMessage(deviceSignature, serviceGuardianDevice);

        const { logs: [log] } = await service.createAccountWithEnsLabel(
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
