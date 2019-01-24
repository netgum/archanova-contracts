/* eslint-disable no-console */
const Guardian = artifacts.require('Account');
const Registry = artifacts.require('Registry');

module.exports = async (deployer, network) => {
  switch (network) {
    case 'development': {
      const guardian = await Guardian.at(Guardian.address);
      await deployer.deploy(Registry, guardian.address, Guardian.binary);

      // info
      console.info('REGISTRY_CONTRACT_ADDRESS', Registry.address);
      console.info();
      break;
    }

    default:
  }
};
