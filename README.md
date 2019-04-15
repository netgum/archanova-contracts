# Archanova Solidity
[![NPM version][npm-image]][npm-url]
[![CircleCI](https://circleci.com/gh/archanova/solidity.svg?style=svg)](https://circleci.com/gh/archanova/solidity)

Archanova [solidity](http://solidity.readthedocs.io) contracts

## Installation

```bash
$ npm i @archanova/solidity -S
```

## Development

### Setup

```bash
$ git clone git@github.com:archanova/solidity.git
$ cd ./solidity
$ npm i
```

### Running Migration

Configuration via env variables:

| Name 	| Default Value 	|
| --- | ---|
| PROVIDER_MNEMONIC 	| `false myself sadness rebuild shallow powder outdoor thank basket light fun tip` 	|
| PROVIDER_ENDPOINT 	| `http://localhost:8545` 	|
| ENS_TOP_LABELS 	| `archanova,smartsafe` 	|
| VIRTUAL_PAYMENT_LOCK_PERIOD 	| `30 * 24 * 60 * 60` 	|

```bash
# Local TestNet:
$ npm run migrate:local

# Kovan TestNet
$ npm run migrate:kovan
```

### Running Tests

```bash
$ npm test
```

## License

The MIT License

[npm-image]: https://badge.fury.io/js/%40archanova%2Fsolidity.svg
[npm-url]: https://npmjs.org/package/@archanova/solidity
