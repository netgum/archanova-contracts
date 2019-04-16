# Archanova Solidity
[![NPM version][npm-image]][npm-url]
[![CircleCI](https://circleci.com/gh/archanova/solidity.svg?style=svg)](https://circleci.com/gh/archanova/solidity)

Archanova [solidity](http://solidity.readthedocs.io) contracts

## Installation

```bash
$ npm i @archanova/solidity -S
```

## Usage

Example:

```typescript
import { Account, AccountProvider } from '@archanova/solidity'; 

console.log('Account abi:', Account.abi);
console.log('Account byteCodeHash:', Account.byteCodeHash);
console.log('AccountProvider addresses:', AccountProvider.addresses);
```

Exported fields:

| Contract name 	| `abi` 	| `byteCodeHash` 	| `addresses` 	|
| --- | :---: | :---: | :---: |
| `Account` 	| ✅ 	| ✅ 	| 	|
| `AccountProvider` 	| ✅ 	| 	| ✅ 	|
| `AccountProxy` 	| ✅ 	| 	| ✅ 	|
| `ENSRegistry` 	| ✅ 	| 	| ✅ 	|
| `ENSResolver` 	| ✅ 	| 	|  	|
| `Guardian` 	|  	| 	| ✅ 	|
| `VirtualPaymentManager` 	| ✅ 	| 	| ✅ 	|

## Development

### Setup

```bash
$ git clone git@github.com:archanova/solidity.git
$ cd ./solidity
$ npm i
```

### Migration

#### Configure `env` variables:

| Name 	| Default Value 	|
| --- | ---|
| PROVIDER_MNEMONIC 	| `-` 	|
| PROVIDER_ENDPOINT 	| `http://localhost:8545` 	|
| ENS_TOP_LABELS 	| `archanova,smartsafe` 	|
| VIRTUAL_PAYMENT_LOCK_PERIOD 	| `30 * 24 * 60 * 60` 	|

#### Start Migration:

```bash
# Rinkeby TestNet
$ npm run migrate:rinkeby

# Kovan TestNet
$ npm run migrate:kovan
```

### Building `./dist`

```bash
$ npm run build
```

### Running Tests

```bash
$ npm test
```

## License

The MIT License

[npm-image]: https://badge.fury.io/js/%40archanova%2Fsolidity.svg
[npm-url]: https://npmjs.org/package/@archanova/solidity
