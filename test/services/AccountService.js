/* eslint-env mocha */

require('../setup');

const expect = require('expect');
const { ZERO_ADDRESS, sha3, abiEncodePacked } = require('@netgum/utils');
const { AccountAccessTypes } = require('../constants');
const { signPersonalMessage } = require('../utils');

const Account = artifacts.require('Account');
const AccountService = artifacts.require('AccountService');

contract('AccountService', (accounts) => {
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
    it('should create account', async () => {
      const device = accounts[1];
      const salt = sha3(Date.now());
      const message = abiEncodePacked(
        'address',
        'bytes32',
      )(
        service.address,
        salt,
      );

      const deviceSignature = signPersonalMessage(message, device);
      const guardianSignature = signPersonalMessage(deviceSignature, guardianDevice);

      const { logs: [log] } = await service.createAccount(
        salt,
        deviceSignature,
        guardianSignature,
      );

      const account = await Account.at(log.args.account);

      expect(log.event).toBe('AccountCreated');
      expect(log.args.devices[0]).toBe(device);
      expect(await account.getDeviceAccessType(device))
        .toEqualBN(AccountAccessTypes.OWNER);
    });
  });
});
