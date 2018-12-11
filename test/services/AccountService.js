/* eslint-env mocha */

require('../setup');

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
const { signPersonalMessage } = require('../utils');

const Account = artifacts.require('Account');
const AccountService = artifacts.require('AccountService');
const Registry = artifacts.require('Registry');

contract('AccountService', (accounts) => {
  let ens;
  let ensRegistrar;
  let ensResolver;
  let registry;
  let registryGuardian;
  let service;
  let serviceGuardian;
  let counter = 1;

  const registryGuardianDevice = accounts[2];
  const serviceGuardianDevice = accounts[1];
  const serviceEnsRootNameInfo = getEnsNameInfo('account.test');

  before(async () => {
    ({
      ens,
      ensResolver,
      ensRegistrar,
    } = await createEnsContracts(accounts[0]));

    // registry
    registryGuardian = await createAccount(registryGuardianDevice, accounts[0]);
    registry = await Registry.new(registryGuardian.address);

    // service
    serviceGuardian = await createAccount(serviceGuardianDevice, accounts[0]);

    service = await AccountService.new(
      registry.address,
      serviceGuardian.address,
      ens.address,
      ensResolver.address,
      serviceEnsRootNameInfo.nameHash,
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
        const ownerDevice = accounts[2];
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

        const deviceSignature = signPersonalMessage(message, ownerDevice);
        const guardianSignature = signPersonalMessage(deviceSignature, serviceGuardianDevice);

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
        const ownerDevice = accounts[2];
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

        const deviceSignature = signPersonalMessage(message, ownerDevice);
        const guardianSignature = signPersonalMessage(deviceSignature, serviceGuardianDevice);

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
