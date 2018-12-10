/* eslint-env mocha */

require('../setup');

const expect = require('expect');
const { sha3, abiEncodePacked, getEnsNameInfo } = require('@netgum/utils');
const { AccountAccessTypes } = require('../constants');
const { createAccount, createEnsContracts } = require('../helpers');
const { signPersonalMessage } = require('../utils');

const Account = artifacts.require('Account');
const AccountService = artifacts.require('AccountService');
const Registry = artifacts.require('Registry');

contract.skip('AccountService', (accounts) => {
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
    } = await createEnsContracts());

    // registry
    registryGuardian = await createAccount(registryGuardianDevice);
    registry = await Registry.new(registryGuardian.address);

    // service
    serviceGuardian = await createAccount(serviceGuardianDevice);

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

    const registryGuardianMessage = abiEncodePacked(
      'address',
      'bytes',
      'address',
      'bool',
    )(
      registry.address,
      '0x5b95342c', // msg.sig
      service.address,
      true,
    );

    const registryGuardianSignature = signPersonalMessage(registryGuardianMessage, registryGuardianDevice);

    await registry.registerService(
      service.address,
      true,
      registryGuardianSignature,
    );
  });

  describe('methods', () => {
    describe('createAccount()', () => {
      it('should create account', async () => {
        const ownerDevice = accounts[2];
        const salt = sha3(counter += 1);
        const message = abiEncodePacked(
          'address',
          'bytes32',
        )(
          service.address,
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
        expect(log.args.devices[0])
          .toBe(ownerDevice);
        expect(await account.getDeviceAccessType(ownerDevice))
          .toEqualBN(AccountAccessTypes.OWNER);
      });
    });
  });
});
