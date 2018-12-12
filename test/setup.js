const expect = require('expect');
const BN = require('bn.js');

console.log('ready!');

expect.extend({
  toEqualBN(received, expected) {
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
