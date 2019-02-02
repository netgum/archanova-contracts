/* eslint-disable no-console */

const Account = artifacts.require('Account');

module.exports = async (deployer, network, addresses) => {
  switch (network) {
    case 'development': {
      const guardianDevice = addresses[1];
      await deployer.deploy(Account, guardianDevice);

      // info
      console.info('   GLOBAL_GUARDIAN_CONTRACT', Account.address);
      console.info('   GLOBAL_GUARDIAN_DEVICE', guardianDevice);
      console.info();
      break;
    }

    default:
  }
};
