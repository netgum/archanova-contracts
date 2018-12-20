/* eslint-env mocha */

const expect = require('expect');
const { sha3 } = require('@netgum/utils');
const { createAccount } = require('../helpers');

const Account = artifacts.require('Account');
const Registry = artifacts.require('Registry');
const RegistryServiceMock = artifacts.require('RegistryServiceMock');

contract('Registry', (addresses) => {
  let registry;
  let registryGuardian;

  const registryGuardianDevice = addresses[2];

  before(async () => {
    registryGuardian = await createAccount(addresses[0], registryGuardianDevice);
    registry = await Registry.new(
      registryGuardian.address,
      Account.bytecode,
    );
  });

  describe('views', () => {
    const services = {
      account: null,
      other: null,
      disabled: null,
      invalid: addresses[3],
    };

    let account;

    before(async () => {
      // account service
      {
        const { logs } = await registry.deployService(
          sha3('account'),
          RegistryServiceMock.bytecode,
          true, {
            from: registryGuardianDevice,
          },
        );

        const address = logs[0].args[1];
        services.account = address;
      }

      // account mock
      {
        const { logs } = await registry.deployAccount(sha3('account'), [], {
          from: registryGuardianDevice,
        });

        const address = logs[0].args[1];
        account = address;
      }

      // other service
      {
        const { logs } = await registry.deployService(
          sha3('other'),
          RegistryServiceMock.bytecode,
          false, {
            from: registryGuardianDevice,
          },
        );

        const address = logs[0].args[1];
        services.other = address;
      }

      // other service
      {
        const { logs } = await registry.deployService(
          sha3('disabled'),
          RegistryServiceMock.bytecode,
          false, {
            from: registryGuardianDevice,
          },
        );

        const address = logs[0].args[1];

        await registry.disableService(address, {
          from: registryGuardianDevice,
        });

        services.disabled = address;
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

  describe('methods', () => {
    // TODO
  });
});
