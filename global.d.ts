interface IContractFunction {
  (name: string, fn: (addresses: string[]) => void): any;
  only: (name: string, fn: (addresses: string[]) => void) => any;
  skip: (name: string, fn: (addresses: string[]) => void) => any;
}

declare const contract: IContractFunction;
declare const web3: any;
declare const artifacts: any;
