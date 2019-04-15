/* eslint-env mocha */

const expect = require('expect');
const { ZERO_ADDRESS } = require('../../shared/constants');
const { getEnsNameHash, getEnsLabelHash } = require('../../shared/utils');
const { logGasUsed } = require('../utils');

const ENSMultiManager = artifacts.require('ENSMultiManagerWrapper');
const ENSRegistry = artifacts.require('ENSRegistry');

contract('ENSMultiManager', (addresses) => {
  const owner = addresses[1];
  const ensRootNodes = {
    verified: getEnsNameHash('verified'),
    notVerified: getEnsNameHash('notVerified'),
    invalid: getEnsNameHash('invalid'),
  };

  let ens;
  let ensMultiManager;

  describe('views', () => {
    before(async () => {
      ens = await ENSRegistry.new();
      ensMultiManager = await ENSMultiManager.new(ens.address);

      await ens.setSubnodeOwner('0x00', getEnsLabelHash('verified'), owner);
      await ens.setSubnodeOwner('0x00', getEnsLabelHash('notVerified'), owner);

      await ensMultiManager.addEnsRootNode(ensRootNodes.verified, {
        from: owner,
      });
      await ensMultiManager.addEnsRootNode(ensRootNodes.notVerified, {
        from: owner,
      });

      await ens.setOwner(ensRootNodes.verified, ensMultiManager.address, {
        from: owner,
      });

      await ensMultiManager.verifyEnsRootNode(ensRootNodes.verified, {
        from: owner,
      });
    });

    describe('ensRootNodes()', () => {
      it('expect to return correct struct for verified root node', async () => {
        const output = await ensMultiManager.ensRootNodes(ensRootNodes.verified);

        expect(output.owner)
          .toBe(owner);
        expect(output.verified)
          .toBeTruthy();
      });

      it('expect to return correct struct for not verified root node', async () => {
        const output = await ensMultiManager.ensRootNodes(ensRootNodes.notVerified);

        expect(output.owner)
          .toBe(owner);
        expect(output.verified)
          .toBeFalsy();
      });

      it('expect to return correct struct for invalid root node', async () => {
        const output = await ensMultiManager.ensRootNodes(ensRootNodes.invalid);

        expect(output.owner)
          .toBe(ZERO_ADDRESS);
        expect(output.verified)
          .toBeFalsy();
      });
    });
  });

  describe('methods', () => {
    before(async () => {
      ens = await ENSRegistry.new();
      ensMultiManager = await ENSMultiManager.new(ens.address);

      await ens.setSubnodeOwner('0x00', getEnsLabelHash('verified'), owner);
      await ens.setSubnodeOwner('0x00', getEnsLabelHash('notVerified'), owner);

      await ensMultiManager.addEnsRootNode(ensRootNodes.notVerified, {
        from: owner,
      });
    });

    describe('addEnsRootNode', () => {
      it('expect to add root node', async () => {
        const output = await ensMultiManager.addEnsRootNode(ensRootNodes.verified, {
          from: owner,
        });

        logGasUsed(output);

        const { logs: [log] } = output;

        expect(log.event)
          .toBe('EnsRootNodeAdded');
        expect(log.args.rootNode)
          .toBe(ensRootNodes.verified);
        expect(log.args.owner)
          .toBe(owner);
      });
    });

    describe('verifyEnsRootNode', () => {
      it('expect to verify root node', async () => {
        await ens.setOwner(ensRootNodes.verified, ensMultiManager.address, {
          from: owner,
        });

        const output = await ensMultiManager.verifyEnsRootNode(ensRootNodes.verified, {
          from: owner,
        });

        logGasUsed(output);

        const { logs: [log] } = output;

        expect(log.event)
          .toBe('EnsRootNodeVerified');
        expect(log.args.rootNode)
          .toBe(ensRootNodes.verified);
      });
    });

    describe('releaseEnsRootNode', () => {
      it('expect to release root node', async () => {
        const output = await ensMultiManager.releaseEnsRootNode(ensRootNodes.verified, {
          from: owner,
        });

        logGasUsed(output);

        const { logs: [log] } = output;

        expect(log.event)
          .toBe('EnsRootNodeReleased');
        expect(log.args.rootNode)
          .toBe(ensRootNodes.verified);
      });
    });
  });
});
