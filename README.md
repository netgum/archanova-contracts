# Archanova Solidity
[![NPM version][npm-image]][npm-url]

Archanova [solidity](http://solidity.readthedocs.io) contracts

## Installation

```bash
$ npm i @archanova/solidity -S
```

## Development

Configuration via environment variables:

| Name 	| Default Value 	|
| --- | ---|
| TRUFFLE_ACCOUNTS_MNEMONIC 	| `false myself sadness rebuild shallow powder outdoor thank basket light fun tip` 	|
| TRUFFLE_ACCOUNTS_COUNT 	| `10` 	|
| TRUFFLE_NETWORK_ENDPOINT 	| `http://localhost:8545` 	|
| TRUFFLE_ENS_ADDRESS 	| `archanova.test` 	|
| TRUFFLE_ENS_ROOT_NODE 	| `null` 	|

Running tests on `development` network

```bash
$ npm test
```

Running migration on `production` network

```bash
$ npm run truffle:migrate
```

## License

The MIT License

[npm-image]: https://badge.fury.io/js/%40archanova%2Fsolidity.svg
[npm-url]: https://npmjs.org/package/@archanova/solidity
