export declare enum ContractNames {
  Account = 'Account',
  AccountFriendRecovery = 'AccountFriendRecovery',
  AccountProvider = 'AccountProvider',
  AccountProxy = 'AccountProxy',
  ENSRegistry = 'ENSRegistry',
  ENSResolver = 'ENSResolver',
  Guardian = 'Guardian',
  VirtualPaymentManager = 'VirtualPaymentManager',
}

export declare function getContractAddress(contractName: ContractNames, network: string): string;

export declare function getContractAbi(contractName: ContractNames): any;

export declare function getContractByteCodeHash(contractName: ContractNames): string;
