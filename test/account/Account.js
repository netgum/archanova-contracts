/* eslint-env mocha */

const expect = require('expect');

const Account = artifacts.require('Account');

contract('Account', (devices) => {
  describe('methods', () => {
    describe('initialize()', () => {
      it('should initialized account', async () => {
        const account = await Account.new();

        account.initialize([devices[0], devices[1]]);

        expect(await account.deviceExists(devices[0])).toBeTruthy();
        expect(await account.deviceExists(devices[1])).toBeTruthy();
        expect(await account.initialized()).toBeTruthy();
      });
    });
  });
});
