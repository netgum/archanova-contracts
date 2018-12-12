/* eslint-env mocha */

const expect = require('expect');
const { createAccount } = require('../../shared/helpers');

const Registry = artifacts.require('Registry');
const ExampleService = artifacts.require('ExampleService');

contract('Registry', (addresses) => {
  let registry;
  let registryGuardian;

  const registryGuardianDevice = addresses[2];

  before(async () => {
    // registry
    registryGuardian = await createAccount(addresses[0], registryGuardianDevice);
    registry = await Registry.new(registryGuardian.address);
  });

  describe('views', () => {
    const services = {
      account: null,
      other: null,
      disabled: null,
      invalid: addresses[3],
    };

    const account = addresses[4];

    before(async () => {
      // account service
      {
        const service = await ExampleService.new(registry.address);

        await registry.registerService(service.address, true, {
          from: registryGuardianDevice,
        });

        await service.registerAccount(account);

        services.account = service.address;
      }

      // other service
      {
        const service = await ExampleService.new(registry.address);

        await registry.registerService(service.address, false, {
          from: registryGuardianDevice,
        });

        services.other = service.address;
      }

      // other service
      {
        const service = await ExampleService.new(registry.address);

        await registry.registerService(service.address, false, {
          from: registryGuardianDevice,
        });

        await registry.disableService(service.address, {
          from: registryGuardianDevice,
        });

        services.disabled = service.address;
      }
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

    describe('serviceDisabled()', () => {
      it('expect to return true when service is disabled', async () => {
        expect(await registry.serviceDisabled(services.disabled))
          .toBeTruthy();
      });

      it('expect to return false when service is enabled', async () => {
        expect(await registry.serviceDisabled(services.account))
          .toBeFalsy();
      });

      it('expect to return false when service doesn\'t exist', async () => {
        expect(await registry.serviceDisabled(services.invalid))
          .toBeFalsy();
      });
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
  });
});
