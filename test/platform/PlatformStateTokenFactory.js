/* eslint-env mocha */

const expect = require('expect');
const BN = require('bn.js');
const {
  sha3,
  anyToHex,
  abiEncodePacked,
  computeCreate2Address,
} = require('@netgum/utils');
const { getBalance } = require('../utils');

const StateToken = artifacts.require('StateToken');
const PlatformStateTokenFactory = artifacts.require('PlatformStateTokenFactory');

contract('PlatformStateTokenFactory', (addresses) => {
  describe('methods', () => {
    let stateTokenFactory;

    before(async () => {
      stateTokenFactory = await PlatformStateTokenFactory.new(
        0,
        StateToken.binary,
      );
    });

    describe('fundToken()', () => {
      const TOKEN_ID = 1;
      const TOKEN_FOUNDER = addresses[1];
      const TOKEN_HASH = anyToHex(
        sha3(abiEncodePacked(
          'address',
          'uint256',
        )(
          TOKEN_FOUNDER,
          TOKEN_ID,
        )), {
          add0x: true,
        },
      );
      const TOKEN_BALANCE = new BN(1000);

      it('expect to fund token', async () => {
        const tokenAddress = computeCreate2Address(
          stateTokenFactory.address,
          TOKEN_HASH,
          StateToken.binary,
        );

        const { logs: [log] } = await stateTokenFactory.fundToken(TOKEN_ID, {
          from: TOKEN_FOUNDER,
          value: TOKEN_BALANCE,
        });

        expect(await getBalance(tokenAddress))
          .toEqualBN(TOKEN_BALANCE);

        expect(log.event)
          .toBe('TokenFunded');
        expect(log.args.tokenHash)
          .toBe(TOKEN_HASH);
        expect(log.args.amount)
          .toEqualBN(TOKEN_BALANCE);
      });
    });
  });
});
