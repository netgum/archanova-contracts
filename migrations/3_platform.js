const { getEnsLabelHash, getEnsNameHash } = require('../shared/utils');
const { ensTopLabels, virtualPaymentLockPeriod } = require('../config');

const Account = artifacts.require('Account');
const AccountProvider = artifacts.require('AccountProvider');
const AccountProxy = artifacts.require('AccountProxy');
const ENSRegistry = artifacts.require('ENSRegistry');
const VirtualPaymentManager = artifacts.require('VirtualPaymentManager');

function printEnv(name, value) {
  console.log( // eslint-disable-line no-console
    `ARCHANOVA_${name}=${value}`,
  );
}

module.exports = async (deployer, network, addresses) => {
  if (network === 'test') {
    return;
  }

  const guardianDevice = addresses[0];
  const ensOwner = addresses[0];
  const ensRoot = getEnsNameHash(network);

  await deployer.deploy(Account);
  await deployer.deploy(AccountProxy);
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

  const accountProvider = await AccountProvider.at(AccountProvider.address);

  await ens.setSubnodeOwner('0x00', getEnsLabelHash(network), ensOwner);

  await Promise
    .all(ensTopLabels.map(async (ensTopLabel) => {
      const ensName = `${ensTopLabel}.${network}`;
      const ensNameHash = getEnsNameHash(ensName);

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

  printEnv('ETH_ACCOUNT_PROVIDER_ADDRESS', AccountProvider.address);
  printEnv('ETH_ACCOUNT_PROXY_ADDRESS', AccountProxy.address);
  printEnv('ETH_ENS_REGISTRY_ADDRESS', ENSRegistry.address);
  printEnv('ETH_GUARDIAN_ADDRESS', Account.address);
  printEnv('ETH_VIRTUAL_PAYMENT_MANAGER_ADDRESS', VirtualPaymentManager.address);
};
