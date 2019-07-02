const { getEnsLabelHash, getEnsNameHash } = require('../shared/utils');
const { ensTopLabels, virtualPaymentLockPeriod } = require('../config');

const Account = artifacts.require('Account');
const AccountProvider = artifacts.require('AccountProvider');
const AccountProxy = artifacts.require('AccountProxy');
const AccountFriendRecovery = artifacts.require('AccountFriendRecovery');
const ENSRegistry = artifacts.require('ENSRegistry');
const VirtualPaymentManager = artifacts.require('VirtualPaymentManager');
const ExampleToken = artifacts.require('ExampleToken');

/* eslint-disable no-console */
function printLabel(label) {
  console.log();
  console.log(label);
  console.log('-'.repeat(label.length));
}

function printEnv(name, value) {
  console.log(
    `ARCHANOVA_${name}=${value}`,
  );
}

function printEnsName(ensName, ensNameHash) {
  console.log(
    `name: ${ensName}, nameHash: ${ensNameHash}`,
  );
}
/* eslint-enable no-console */

module.exports = async (deployer, network, addresses) => {
  if (network === 'test') {
    return;
  }

  const guardianDevice = addresses[0];
  const ensOwner = addresses[0];
  const ensRoot = getEnsNameHash(network);

  await deployer.deploy(Account);
  await deployer.deploy(AccountProxy);
  await deployer.deploy(AccountFriendRecovery);
  await deployer.deploy(ENSRegistry);

  const accountProxy = await AccountProxy.at(AccountProxy.address);
  const guardian = await Account.at(Account.address, {
    from: guardianDevice,
  });
  const ens = await ENSRegistry.at(ENSRegistry.address);

  await deployer.deploy(
    AccountProvider,
    guardian.address,
    Account.binary,
    accountProxy.address,
    ens.address,
  );

  await deployer.deploy(
    VirtualPaymentManager,
    guardian.address,
    virtualPaymentLockPeriod,
  );

  await deployer.deploy(ExampleToken);

  const accountProvider = await AccountProvider.at(AccountProvider.address);

  await ens.setSubnodeOwner('0x00', getEnsLabelHash(network), ensOwner);

  printLabel('ENS root nodes');

  await Promise
    .all(ensTopLabels.map(async (ensTopLabel) => {
      const ensName = `${ensTopLabel}.${network}`;
      const ensNameHash = getEnsNameHash(ensName);

      printEnsName(ensName, ensNameHash);

      await ens.setSubnodeOwner(ensRoot, getEnsLabelHash(ensName), ensOwner);

      await accountProvider.addEnsRootNode(ensNameHash, {
        from: ensOwner,
      });

      await ens.setOwner(ensNameHash, accountProvider.address, {
        from: ensOwner,
      });

      await accountProvider.verifyEnsRootNode(ensNameHash, {
        from: ensOwner,
      });
    }));

  printLabel('Env variables');

  printEnv('ETH_ACCOUNT_PROVIDER_ADDRESS', AccountProvider.address);
  printEnv('ETH_ACCOUNT_PROXY_ADDRESS', AccountProxy.address);
  printEnv('ETH_ACCOUNT_FRIEND_RECOVERY_ADDRESS', AccountFriendRecovery.address);
  printEnv('ETH_ENS_REGISTRY_ADDRESS', ENSRegistry.address);
  printEnv('ETH_GUARDIAN_ADDRESS', Account.address);
  printEnv('ETH_VIRTUAL_PAYMENT_MANAGER_ADDRESS', VirtualPaymentManager.address);
  printEnv('ETH_EXAMPLE_TOKEN', ExampleToken.address);
};
