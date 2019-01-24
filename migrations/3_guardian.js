/* eslint-disable no-console */
const Guardian = artifacts.require('Account');

module.exports = async (deployer, network, [guardianDevice]) => {
  switch (network) {
    case 'development': {
      await deployer.deploy(Guardian);
      const guardian = await Guardian.at(Guardian.address);
      await guardian.initialize([guardianDevice]);

      // info
      console.info('GLOBAL_GUARDIAN_CONTRACT_ADDRESS', Guardian.address);
      console.info('GLOBAL_GUARDIAN_DEVICE_ADDRESS', guardianDevice);
      console.info();
      break;
    }

    default:
  }
};
