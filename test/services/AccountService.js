/* eslint-env mocha */

require('../setup');

const { ZERO_ADDRESS } = require('@netgum/utils');

const Account = artifacts.require('Account');
const AccountService = artifacts.require('AccountService');

contract.skip('AccountService', (accounts) => {
  let guardian;
  const guardianDevice = accounts[0];
  let service;

  before(async () => {
    guardian = await Account.new();
    await guardian.initialize([guardianDevice]);
    service = await AccountService.new(
      ZERO_ADDRESS,
      guardian.address,
      Account.bytecode,
    );
  });

  describe('methods', () => {
    it('test', async () => {
      console.log(guardian.address);
      console.log(service.address);
    });
  });
});
