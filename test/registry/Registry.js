/* eslint-env mocha */

const expect = require('expect');
const { sha3 } = require('@netgum/utils');
const { createAccount } = require('../helpers');

const Account = artifacts.require('Account');
const Registry = artifacts.require('Registry');
const RegistryServiceExample = artifacts.require('RegistryServiceExample');

contract('Registry', (addresses) => {
  const codeAliases = {
    account: sha3('io.archanova.Account'),
    example: sha3('io.archanova.Example'),
  };

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

      await registry.registerContractCode(
        codeAliases.example,
        RegistryServiceExample.bytecode,
      );

      // account mock
      ({ logs: [{ args: { account } }] } = await registry.deployAccount(sha3('account'), [], {
        from: registryGuardianDevice,
      }));

      // account service
      {
        const { logs: [{ args: { service } }] } = await registry.deployService(
          codeAliases.example,
          sha3('account'),
          true, {
            from: registryGuardianDevice,
          },
        );

        services.account = service;
      }

      // other service
      {
        const { logs: [{ args: { service } }] } = await registry.deployService(
          codeAliases.example,
          sha3('other'),
          false, {
            from: registryGuardianDevice,
          },
        );

        services.other = service;
      }

      // disabled service
      {
        const { logs: [{ args: { service } }] } = await registry.deployService(
          codeAliases.example,
          sha3('disabled'),
          false, {
            from: registryGuardianDevice,
          },
        );

        await registry.disableService(service, {
          from: registryGuardianDevice,
        });

        services.disabled = service;
      }
    });

    describe('accountDeployed()', () => {
      it('expect to return true when account exists', async () => {
        expect(await registry.accountDeployed(account))
          .toBeTruthy();
      });

      it('expect to return false when account doesn\'t exist', async () => {
        expect(await registry.accountDeployed(services.invalid)) // some random address
          .toBeFalsy();
      });
    });

    describe('serviceDeployed()', () => {
      it('expect to return true when service exists', async () => {
        expect(await registry.serviceDeployed(services.account))
          .toBeTruthy();
      });

      it('expect to return true when service is disabled', async () => {
        expect(await registry.serviceDeployed(services.disabled))
          .toBeTruthy();
      });

      it('expect to return false when service doesn\'t exist', async () => {
        expect(await registry.serviceDeployed(services.invalid))
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
