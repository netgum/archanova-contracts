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
| ACCOUNTS_MNEMONIC 	| `false myself sadness rebuild shallow powder outdoor thank basket light fun tip` 	|
| ACCOUNTS_COUNT 	| `10` 	|
| NETWORK_PROVIDER_ENDPOINT 	| `http://localhost:8545` 	|
| PLATFORM_ACCOUNT_PROVIDER_ENS_ROOT_NODE_NAME 	| `smartsafe.test` 	|

Running tests on `testing` network

```bash
$ npm test
```

Running migration on `development` network

```bash
$ npm run truffle:migrate
```

## License

The MIT License

[npm-image]: https://badge.fury.io/js/%40archanova%2Fsolidity.svg
[npm-url]: https://npmjs.org/package/@archanova/solidity
