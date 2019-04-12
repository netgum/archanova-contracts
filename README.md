# Archanova Solidity
[![NPM version][npm-image]][npm-url]

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

### Running Tests

```bash
$ npm test
```

### Running Migration

#### Kovan TestNet

```bash
# configuration via env variables
$ export KOVAN_PROVIDER_ENDPOINT=
$ export KOVAN_ACCOUNT_MNEMONIC=

# start migration
$ npm run migrate:kovan
```

## License

The MIT License

[npm-image]: https://badge.fury.io/js/%40archanova%2Fsolidity.svg
[npm-url]: https://npmjs.org/package/@archanova/solidity
