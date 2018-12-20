/* eslint-env mocha */

const BN = require('bn.js');
const expect = require('expect');
const {
  getMethodSignature,
  sha3,
  abiEncodePacked,
  anyToHex,
  computeCreate2Address,
} = require('@netgum/utils');
const {
  createAccount,
} = require('../helpers');
const {
  signMessage,
  getBalance,
} = require('../utils');

const StateToken = artifacts.require('StateToken');
const StateTokenService = artifacts.require('StateTokenService');

contract('StateTokenService', (addresses) => {
  describe('methods', () => {
    let stateTokenService;

    const stateTokenGuardianDevice = addresses[0];
    const from = addresses[5];

    before(async () => {
      const stateTokenGuardian = await createAccount(stateTokenGuardianDevice);

      stateTokenService = await StateTokenService.new();

      await stateTokenService.initialize(
        stateTokenGuardian.address,
        0,
        StateToken.bytecode,
      );
    });

    describe('useToken()', () => {
      it('should use existing token', async () => {
        const beneficiary = addresses[2];

        const founderDevice = addresses[1];
        const founder = await await createAccount(
          from,
          founderDevice,
        );

        const tokenId = 10;
        const tokenHash = sha3(abiEncodePacked('address', 'uint256')(founder.address, tokenId));
        const tokenValue = 5000;
        const tokenAddress = computeCreate2Address(
          stateTokenService.address,
          tokenHash,
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
          'bytes',
          'address',
          'uint256',
          'bytes',
          'address',
        )(
          stateTokenService.address,
          getMethodSignature('useToken', 'address', 'uint256', 'bytes32', 'bytes', 'bytes'),
          founder.address,
          tokenId,
          stateHash,
          beneficiary,
        );

        const stateSignature = signMessage(message, founderDevice);
        const guardianSignature = signMessage(stateSignature, stateTokenGuardianDevice);

        expect((await getBalance(tokenAddress)).eq(new BN(tokenValue)))
          .toBeTruthy();

        const { logs: [log] } = await stateTokenService.useToken(
          founder.address,
          tokenId,
          stateHash,
          stateSignature,
          guardianSignature, {
            from: beneficiary,
          },
        );

        expect(log.event)
          .toBe('TokenUsed');
        expect(anyToHex(log.args[0]))
          .toBe(anyToHex(tokenHash));
        expect(log.args[1])
          .toBe(beneficiary);

        expect(await getBalance(stateTokenService.address))
          .toEqualBN(new BN(0));
        expect(await getBalance(tokenAddress))
          .toEqualBN(new BN(0));
      });
    });
  });
});
