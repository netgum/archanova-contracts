/* eslint-disable no-console */
const Guardian = artifacts.require('Guardian');

module.exports = async (deployer, network, addresses) => {
  switch (network) {
    case 'development': {
      const guardianDevice = addresses[1];
      await deployer.deploy(Guardian, {
        from: guardianDevice,
      });

      // info
      console.info('   GLOBAL_GUARDIAN_CONTRACT', Guardian.address);
      console.info('   GLOBAL_GUARDIAN_DEVICE', guardianDevice);
      console.info();
      break;
    }

    default:
  }
};
