/* eslint-env mocha */

const expect = require('expect');
const { sha3, computeCreate2Address } = require('@netgum/utils');

const ContractCreatorExample = artifacts.require('ContractCreatorExample');
const PingPongMock = artifacts.require('PingPongMock');

contract('ContractCreatorExample', () => {
  describe('methods', () => {
    const contractCode = PingPongMock.binary;
    const salt = sha3(Date.now());

    let contractCreatorExample;
    let computedAddress;

    before(async () => {
      contractCreatorExample = await ContractCreatorExample.new(contractCode);
      computedAddress = computeCreate2Address(
        contractCreatorExample.address,
        salt,
        contractCode,
      );
    });

    describe('createContract()', () => {
      it('should create contract on computed address', async () => {
        const { logs: [log] } = await contractCreatorExample.createContract(salt);
        const contract = await PingPongMock.at(computedAddress);

        expect(log.event)
          .toBe('ContractCreated');
        expect(log.args.contractAddress)
          .toBe(computedAddress);
        expect(await contract.ping())
          .toBe('pong');
      });

      it('should fail when salt was used', async () => {
        await expect(contractCreatorExample.createContract(salt))
          .rejects
          .toThrow();
      });
    });
  });
});
