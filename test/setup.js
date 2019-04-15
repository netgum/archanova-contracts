const expect = require('expect');
const { BN } = require('./shared/utils');

const zeroAddress = `0x${'0'.repeat(40)}`;

expect.extend({
  toBeBN(received, expected) {
    let result;
    if (!BN.isBN(received)) {
      result = {
        message: () => `received ${received} is not BN`,
        pass: false,
      };
    }

    if (!BN.isBN(expected)) {
      result = {
        message: () => `expected ${expected} is not BN`,
        pass: false,
      };
    }

    if (received.eq(expected)) {
      result = {
        message: () => `expected ${received} is equal ${expected}`,
        pass: true,
      };
    } else {
      result = {
        message: () => `expected ${received} is not equal ${expected}`,
        pass: false,
      };
    }

    return result;
  },

  toBeZeroAddress(received) {
    let result;

    if (received === zeroAddress) {
      result = {
        message: () => `expected ${received} is zero address`,
        pass: true,
      };
    } else {
      result = {
        message: () => `expected ${received} is not zero address`,
        pass: false,
      };
    }

    return result;
  },
});
