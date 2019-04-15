const { getEnsLabelHash, getEnsNameHash } = require('../shared/utils');
const { ensTopLabels, virtualPaymentLockPeriod } = require('../config');

const Account = artifacts.require('Account');
const AccountProvider = artifacts.require('AccountProvider');
const AccountProxy = artifacts.require('AccountProxy');
const ENSRegistry = artifacts.require('ENSRegistry');
const VirtualPaymentManager = artifacts.require('VirtualPaymentManager');

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
};
