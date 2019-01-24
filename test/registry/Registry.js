/* eslint-env mocha */

const expect = require('expect');
const { sha3 } = require('@netgum/utils');
const { createAccount } = require('../helpers');

const Account = artifacts.require('Account');
const Registry = artifacts.require('Registry');
const RegistryServiceExample = artifacts.require('RegistryServiceExample');

contract('Registry', (addresses) => {
  describe('views', () => {
    const registryGuardianDevice = addresses[2];

    const services = {
      account: null,
      other: null,
      disabled: null,
      invalid: addresses[3],
    };

    let registry;
    let registryGuardian;
    let account;

    before(async () => {
      registryGuardian = await createAccount(addresses[0], registryGuardianDevice);
      registry = await Registry.new(
        registryGuardian.address,
        Account.bytecode,
      );

      // account mock
      ({ logs: [{ args: { account } }] } = await registry.deployAccount(sha3('account'), [], {
        from: registryGuardianDevice,
      }));

      // account service
      {
        const service = await RegistryServiceExample.new();
        await service.initialize(registry.address);

        services.account = service.address;

        await registry.registerService(service.address, true);
      }

      // other service
      {
        const service = await RegistryServiceExample.new();
        await service.initialize(registry.address);

        services.other = service.address;

        await registry.registerService(service.address, false);
      }

      // disabled service
      {
        const service = await RegistryServiceExample.new();
        await service.initialize(registry.address);

        await registry.registerService(service.address, false);

        await registry.disableService(service.address, {
          from: registryGuardianDevice,
        });

        services.disabled = service.address;
      }
    });

    describe('accountExists()', () => {
      it('expect to return true when account exists', async () => {
        expect(await registry.accountExists(account))
          .toBeTruthy();
      });

      it('expect to return false when account doesn\'t exist', async () => {
        expect(await registry.accountExists(services.invalid)) // some random address
          .toBeFalsy();
      });
    });

    describe('serviceExists()', () => {
      it('expect to return true when service exists', async () => {
        expect(await registry.serviceExists(services.account))
          .toBeTruthy();
      });

      it('expect to return true when service is disabled', async () => {
        expect(await registry.serviceExists(services.disabled))
          .toBeTruthy();
      });

      it('expect to return false when service doesn\'t exist', async () => {
        expect(await registry.serviceExists(services.invalid))
          .toBeFalsy();
      });
    });

    describe('serviceEnabled()', () => {
      it('expect to return true when service is enabled', async () => {
        expect(await registry.serviceEnabled(services.account))
          .toBeTruthy();
      });

      it('expect to return false when service is disabled', async () => {
        expect(await registry.serviceEnabled(services.disabled))
          .toBeFalsy();
      });

      it('expect to return false when service doesn\'t exist', async () => {
        expect(await registry.serviceEnabled(services.invalid))
          .toBeFalsy();
      });
    });
  });

  describe('methods', () => {
    // TODO
  });
});
