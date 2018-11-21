const expect = require('expect');

const Account = artifacts.require("Account");

contract('Account', (devices) => {

  describe('views', () => {

    let account;

    before(async () => {
      account = await Account.new();
    });

    describe('deviceExists()', () => {

      it('should return true when device exists', async () => {
        expect(await account.deviceExists(devices[0])).toBeTruthy();
      });
    });
  });
});