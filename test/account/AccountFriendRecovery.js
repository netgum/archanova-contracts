/* eslint-env mocha */

const expect = require('expect');
const {
  logGasUsed,
  soliditySha3,
  sign,
  getMethodSign,
  getGasPrice,
  joinHex,
} = require('../shared/utils');

const Account = artifacts.require('Account');
const AccountFriendRecovery = artifacts.require('AccountFriendRecovery');

contract('AccountFriendRecovery', (addresses) => {
  let account;
  let accountFriendRecovery;
  let gasPrice;

  before(async () => {
    gasPrice = await getGasPrice();
  });

  describe('methods', () => {
    const methodSigns = {
      recoverAccount: getMethodSign(
        'recoverAccount', 'address', 'address', 'address[]', 'bytes', 'uint256',
      ),
    };

    const friendOwnerDevices = [
      addresses[1],
      addresses[2],
      addresses[3],
    ];
    let friendAccounts;

    before(async () => {
      accountFriendRecovery = await AccountFriendRecovery.new();
      account = await Account.new();

      friendAccounts = await Promise.all(
        friendOwnerDevices
          .map(friendDevice => Account.new({
            from: friendDevice,
          }).then(({ address }) => address)),
      );

      await account.addDevice(accountFriendRecovery.address, true);
    });

    describe('connect()', () => {
      it('expects to connect account', async () => {
        const data = accountFriendRecovery
          .contract
          .methods
          .connect(
            2,
            friendAccounts,
          )
          .encodeABI();

        const output = await account.executeTransaction(
          accountFriendRecovery.address,
          0,
          data,
        );

        logGasUsed(output);

        const { connected } = await accountFriendRecovery.accounts(account.address);

        expect(connected).toBeTruthy();
      });
    });

    describe('recoverAccount()', () => {
      it('expects to recover account', async () => {
        const recoveredDevices = addresses[4];

        const messageHash = soliditySha3(
          accountFriendRecovery.address,
          methodSigns.recoverAccount,
          account.address,
          recoveredDevices,
          0,
          0,
          gasPrice,
        );

        const signatures = await Promise.all(friendOwnerDevices.map(device => sign(messageHash, device)));

        const output = await accountFriendRecovery.recoverAccount(
          account.address,
          recoveredDevices,
          friendAccounts.slice(0, 2),
          joinHex(...signatures.slice(0, 2)),
          0,
        );

        logGasUsed(output);

        const { isOwner, exists, existed } = await account.devices(recoveredDevices);

        expect(isOwner).toBeTruthy();
        expect(exists).toBeTruthy();
        expect(existed).toBeTruthy();
      });
    });
  });
});
