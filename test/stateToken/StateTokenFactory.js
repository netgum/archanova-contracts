/* eslint-env mocha */

const expect = require('expect');
const BN = require('bn.js');
const {
  sha3,
  abiEncodePacked,
  computeCreate2Address,
  anyToHex,
  getMethodSignature,
} = require('@netgum/utils');
const {
  sendWei,
  getGasPrice,
  getBalance,
  now,
  sleep,
  signMessage,
} = require('../utils');

const Account = artifacts.require('Account');
const StateToken = artifacts.require('StateToken');
const StateTokenFactory = artifacts.require('StateTokenFactory');

contract.only('StateTokenFactory', (addresses) => {
  describe('methods', () => {
    const TOKEN_RELEASE_IN = new BN(1); // 1 second
    let stateTokenFactory;
    let gasPrice;

    before(async () => {
      stateTokenFactory = await StateTokenFactory.new(
        TOKEN_RELEASE_IN,
        StateToken.binary,
      );

      gasPrice = await getGasPrice();
    });

    describe('fundToken()', () => {
      it('expect to fund token', async () => {
        const TOKEN_BALANCE = new BN(1000);
        const TOKEN_ADDRESS = addresses[1];

        const initialBalance = await getBalance(TOKEN_ADDRESS);

        await stateTokenFactory.fundToken(TOKEN_ADDRESS, {
          value: TOKEN_BALANCE,
        });

        expect(await getBalance(TOKEN_ADDRESS))
          .toEqualBN(initialBalance.add(TOKEN_BALANCE));
      });
    });

    describe('releaseToken()', () => {
      const TOKEN_FOUNDER = addresses[1];
      const TOKEN_ID = 1;
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

      let tokenAddress;

      before(async () => {
        tokenAddress = computeCreate2Address(
          stateTokenFactory.address,
          TOKEN_HASH,
          StateToken.binary,
        );

        await sendWei(addresses[0], tokenAddress, TOKEN_BALANCE);
      });

      it('expect to request token release', async () => {
        const { logs: [log] } = await stateTokenFactory.releaseToken(TOKEN_ID, {
          from: TOKEN_FOUNDER,
        });

        expect(log.event)
          .toBe('TokenReleaseRequested');

        expect(log.args.tokenHash)
          .toBe(TOKEN_HASH);

        expect(log.args.tokenReleaseDueTime)
          .toEqualBN(
            now()
              .add(TOKEN_RELEASE_IN),
          );
      });

      it('expect to reject when it\'s to early to release token', async () => {
        await expect(stateTokenFactory.releaseToken(TOKEN_ID, {
          from: TOKEN_FOUNDER,
        }))
          .rejects
          .toThrow();
      });

      it('expect to release token', async () => {
        await sleep(TOKEN_RELEASE_IN);
        const tokenFounderBalance = await getBalance(TOKEN_FOUNDER);

        const { logs: [log], receipt: { gasUsed } } = await stateTokenFactory.releaseToken(TOKEN_ID, {
          from: TOKEN_FOUNDER,
          gasPrice,
        });

        const costs = gasPrice.mul(new BN(gasUsed));

        expect(log.event)
          .toBe('TokenReleased');

        expect(log.args.tokenHash)
          .toBe(TOKEN_HASH);

        expect(await getBalance(TOKEN_FOUNDER))
          .toEqualBN(
            tokenFounderBalance.add(TOKEN_BALANCE)
              .sub(costs),
          );
      });
    });

    describe('burnToken()', () => {
      const TOKEN_ID = 2;
      const TOKEN_BALANCE = new BN(1000);
      const DEVICES = {
        founder: addresses[1],
        guardian: addresses[2],
        sender: addresses[3],
      };

      let founder;
      let guardian;
      let tokenHash;
      let tokenAddress;

      before(async () => {
        founder = await Account.new(DEVICES.founder);
        guardian = await Account.new(DEVICES.guardian);
        tokenHash = anyToHex(
          sha3(abiEncodePacked(
            'address',
            'uint256',
          )(
            founder.address,
            TOKEN_ID,
          )), {
            add0x: true,
          },
        );
        tokenAddress = computeCreate2Address(
          stateTokenFactory.address,
          tokenHash,
          StateToken.binary,
        );

        await sendWei(addresses[0], tokenAddress, TOKEN_BALANCE);
      });

      it('expect to burn token', async () => {
        const stateHash = sha3('some state data');
        const message = abiEncodePacked(
          'address',
          'bytes',
          'address',
          'uint256',
          'bytes32',
          'address',
          'address',
        )(
          stateTokenFactory.address,
          getMethodSignature('burnToken', 'address', 'uint256', 'bytes32', 'address', 'bytes', 'bytes'),
          founder.address,
          TOKEN_ID,
          stateHash,
          guardian.address,
          DEVICES.sender,
        );

        const stateSignature = signMessage(message, DEVICES.founder);
        const guardianSignature = signMessage(stateSignature, DEVICES.guardian);

        const senderBalance = await getBalance(DEVICES.sender);

        const { logs: [log], receipt: { gasUsed } } = await stateTokenFactory.burnToken(
          founder.address,
          TOKEN_ID,
          stateHash,
          guardian.address,
          stateSignature,
          guardianSignature, {
            from: DEVICES.sender,
          },
        );

        const costs = gasPrice.mul(new BN(gasUsed));

        expect(log.event)
          .toBe('TokenBurned');

        expect(log.args.tokenHash)
          .toBe(tokenHash);

        expect(log.args.beneficiaryAddress)
          .toBe(DEVICES.sender);

        expect(await getBalance(DEVICES.sender))
          .toEqualBN(
            senderBalance.add(TOKEN_BALANCE)
              .sub(costs),
          );
      });
    });
  });
});
