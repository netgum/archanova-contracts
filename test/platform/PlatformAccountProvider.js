/* eslint-env mocha */

const expect = require('expect');
const {
  getEnsNameHash,
  getEnsLabelHash,
  getEnsNameInfo,
  computeCreate2Address,
  abiEncodePacked,
  sha3,
  getMethodSignature,
  ZERO_ADDRESS,
} = require('@netgum/utils');
const { AccountAccessTypes } = require('../constants');
const { signMessage } = require('../utils');

const ENSRegistry = artifacts.require('ENSRegistry');
const Account = artifacts.require('Account');
const PlatformAccount = artifacts.require('PlatformAccount');
const PlatformAccountProvider = artifacts.require('PlatformAccountProvider');

contract('PlatformAccountProvider', (addresses) => {
  let ens;
  let guardian;
  let platformAccountProvider;

  const DEVICES = {
    guardian: addresses[1],
    unsafeOwner: addresses[2],
    accountProxy: addresses[8],
  };

  before(async () => {
    ens = await ENSRegistry.new();

    guardian = await Account.new(DEVICES.guardian);

    platformAccountProvider = await PlatformAccountProvider.new(
      ens.address,
      getEnsNameHash('test'),
      guardian.address,
      DEVICES.accountProxy,
      PlatformAccount.binary,
    );

    await ens.setSubnodeOwner('0x00', getEnsLabelHash('test'), platformAccountProvider.address);
  });

  describe('views', () => {
    const accountEnsInfo = getEnsNameInfo('unsafe.test');
    let accountAddress;

    before(async () => {
      const { logs: [log] } = await platformAccountProvider.unsafeCreateAccount(
        0,
        DEVICES.unsafeOwner,
        accountEnsInfo.labelHash,
        0, {
          from: DEVICES.guardian,
        },
      );

      ({ accountAddress } = log.args);
    });

    describe('addr()', () => {
      it('expect to return account address for exiting ens name', async () => {
        expect(await platformAccountProvider.addr(accountEnsInfo.nameHash))
          .toBe(accountAddress);
      });

      it('expect to return ZERO address when ens name doesn\'t exists', async () => {
        expect(await platformAccountProvider.addr(getEnsNameHash('test.test1')))
          .toBe(ZERO_ADDRESS);
      });
    });
  });

  describe('methods', () => {
    describe('unsafeCreateAccount()', () => {
      it('expect to create account', async () => {
        const accountEnsLabelHash = getEnsLabelHash('account1.test');
        const accountId = 1;
        const salt = sha3(abiEncodePacked(
          'bytes',
          'uint256',
        )(
          getMethodSignature('unsafeCreateAccount', 'uint256', 'address', 'bytes32', 'uint256'),
          accountId,
        ));

        const computedAddress = computeCreate2Address(
          platformAccountProvider.address,
          salt,
          PlatformAccount.binary,
        );

        const { logs: [log] } = await platformAccountProvider.unsafeCreateAccount(
          accountId,
          DEVICES.unsafeOwner,
          accountEnsLabelHash,
          0, {
            from: DEVICES.guardian,
          },
        );

        expect(log.event)
          .toBe('AccountCreated');
        expect(log.args.accountAddress)
          .toBe(computedAddress);

        const account = await PlatformAccount.at(log.args.accountAddress);

        expect(await account.getDeviceAccessType(DEVICES.unsafeOwner))
          .toEqualBN(AccountAccessTypes.OWNER);
        expect(await account.getDeviceAccessType(DEVICES.accountProxy))
          .toEqualBN(AccountAccessTypes.OWNER);
      });
    });

    describe('createAccountWithGuardianSignature()', () => {
      it('expect to create account', async () => {
        const accountEnsLabelHash = getEnsLabelHash('account2.test');
        const device = addresses[3];
        const salt = sha3(device);
        const computedAddress = computeCreate2Address(
          platformAccountProvider.address,
          salt,
          PlatformAccount.binary,
        );

        const message = abiEncodePacked(
          'address',
          'bytes',
          'bytes32',
          'uint256',
        )(
          platformAccountProvider.address,
          getMethodSignature('createAccountWithGuardianSignature', 'bytes32', 'uint256', 'bytes', 'bytes'),
          accountEnsLabelHash,
          0,
        );

        const deviceSignature = signMessage(message, device);
        const guardianSignature = signMessage(deviceSignature, DEVICES.guardian);


        const { logs: [log] } = await platformAccountProvider.createAccountWithGuardianSignature(
          accountEnsLabelHash,
          0,
          deviceSignature,
          guardianSignature,
        );

        expect(log.event)
          .toBe('AccountCreated');
        expect(log.args.accountAddress)
          .toBe(computedAddress);
      });
    });

    describe('createAccount()', () => {
      it('expect to create account', async () => {
        const accountEnsLabelHash = getEnsLabelHash('account3.test');
        const device = addresses[4];
        const salt = sha3(device);
        const computedAddress = computeCreate2Address(
          platformAccountProvider.address,
          salt,
          PlatformAccount.binary,
        );

        const message = abiEncodePacked(
          'address',
          'bytes',
          'bytes32',
          'uint256',
        )(
          platformAccountProvider.address,
          getMethodSignature('createAccount', 'bytes32', 'uint256', 'bytes'),
          accountEnsLabelHash,
          0,
        );

        const deviceSignature = signMessage(message, device);

        const { logs: [log] } = await platformAccountProvider.createAccount(
          accountEnsLabelHash,
          0,
          deviceSignature, {
            from: DEVICES.guardian,
          },
        );

        expect(log.event)
          .toBe('AccountCreated');
        expect(log.args.accountAddress)
          .toBe(computedAddress);
      });
    });

    describe('releaseENSNode()', () => {
      it('expect to release ENS node', async () => {
        expect(await ens.owner(getEnsNameHash('test')))
          .toBe(platformAccountProvider.address);

        await platformAccountProvider.releaseENSNode({
          from: DEVICES.guardian,
        });

        expect(await ens.owner(getEnsNameHash('test')))
          .toBe(DEVICES.guardian);
      });
    });
  });
});
