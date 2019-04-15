const expect = require('expect');
const { BN } = require('../shared/utils');

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
});
