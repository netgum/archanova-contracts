const {
  PROVIDER_MNEMONIC,
  PROVIDER_ENDPOINT,
  ENS_TOP_LABELS,
  VIRTUAL_PAYMENT_LOCK_PERIOD,
} = process.env;

module.exports = {
  providerMnemonic: PROVIDER_MNEMONIC || '',
  providerEndpoint: PROVIDER_ENDPOINT || 'http://localhost:8545',
  ensTopLabels: (ENS_TOP_LABELS || 'archanova,smartsafe,pillar').split(','),
  virtualPaymentLockPeriod: parseInt(VIRTUAL_PAYMENT_LOCK_PERIOD, 10) || 30 * 24 * 60 * 60,
};
