/* eslint-env mocha */

const BN = require('bn.js');
const expect = require('expect');
const {
  ZERO_ADDRESS,
  sha3,
  abiEncodePacked,
  anyToHex,
} = require('@netgum/utils');
const {
  signPersonalMessage,
  computeCreate2Address,
  getBalance
} = require('../utils');

const Account = artifacts.require('Account');
const StateToken = artifacts.require('StateToken');
const StateTokenBasicService = artifacts.require('StateTokenBasicService');

contract('StateTokenBasicService', (devices) => {
  let service;
  let guardian;
  const guardianDevice = devices[0];

  before(async () => {
    guardian = await Account.new();
    await guardian.initialize([guardianDevice]);

    service = await StateTokenBasicService.new(
      ZERO_ADDRESS,
      guardian.address,
      StateToken.bytecode,
    );
  });

  describe('burnToken()', () => {
    it('should fund and burn token', async () => {
      const claimer = devices[2];

      const founder = await Account.new();
      const founderDevice = devices[1];
      await founder.initialize([founderDevice]);

      const tokenId = 10;
      const tokenValue = 5000;
      const tokenAddress = computeCreate2Address(
        service.address,
        sha3(abiEncodePacked('uint256', 'address')(tokenId, founder.address)),
        StateToken.bytecode,
      );

      // top-up
      await web3.eth.sendTransaction({
        from: founderDevice,
        to: tokenAddress,
        value: tokenValue,
      });

      const state = '0x01020304';
      const stateHash = anyToHex(sha3(state), { add0x: true });
      const message = abiEncodePacked(
        'address',
        'uint256',
        'address',
        'bytes',
        'address',
      )(
        service.address,
        tokenId,
        founder.address,
        stateHash,
        claimer,
      );

      const founderSignature = signPersonalMessage(message, founderDevice);
      const guardianSignature = signPersonalMessage(founderSignature, guardianDevice);

      expect((await getBalance(tokenAddress)).eq(new BN(tokenValue))).toBeTruthy();

      await service.burnToken(
        tokenId,
        founder.address,
        stateHash,
        founderSignature,
        guardianSignature, {
          from: claimer,
        },
      );

      expect((await getBalance(service.address)).eq(new BN(0))).toBeTruthy();
      expect((await getBalance(tokenAddress)).eq(new BN(0))).toBeTruthy();
    });
  });
});
