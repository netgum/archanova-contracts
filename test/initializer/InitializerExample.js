/* eslint-env mocha */

const expect = require('expect');

const InitializerExample = artifacts.require('InitializerExample');

contract('InitializerExample', () => {
  describe('view', () => {
    let initializedContract;
    let notInitializedContract;

    before(async () => {
      initializedContract = await InitializerExample.new();
      notInitializedContract = await InitializerExample.new();

      await initializedContract.initialize();
    });

    describe('initialized()', () => {
      it('expect to return true when contract was initialized', async () => {
        expect(await initializedContract.initialized())
          .toBeTruthy();
      });

      it('expect to return false when contract wasn\'t initialized', async () => {
        expect(await notInitializedContract.initialized())
          .toBeFalsy();
      });
    });
  });

  describe('methods', () => {
    let initializerExample;

    before(async () => {
      initializerExample = await InitializerExample.new();
    });

    describe('initialize()', () => {
      it('expect to initialize contract', async () => {
        expect(await initializerExample.initialized())
          .toBeFalsy();

        await initializerExample.initialize();

        expect(await initializerExample.initialized())
          .toBeTruthy();
      });

      it('expect to reject when contract was initialized', async () => {
        await expect(initializerExample.initialize())
          .rejects
          .toThrow();
      });
    });
  });
});
