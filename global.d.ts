declare type TTest = (done?) => any | Promise<any>;

declare interface IContract {
  (description: string, callback: (accounts?: string[]) => any): any;

  skip (description: string, callback: (accounts?: string[]) => any): any;
}

declare interface IDescribe {
  (description: string, callback: () => any): any;

  skip (description: string, callback: () => any): any;
}

declare interface IIt {
  (description: string, callback: TTest): any;

  skip (description: string, callback: TTest): any;
}

declare interface IAction {
  (callback: TTest): any;

  skip (callback: TTest): any;
}

declare const contract: IContract
declare const describe: IDescribe

declare const it: IIt

declare const before: IAction
declare const beforeEach: IAction
declare const after: IAction
declare const afterEach: IAction

declare const web3: any
declare const artifacts: any
