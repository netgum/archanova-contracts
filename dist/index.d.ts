export interface IContract {
  abi: any;
  byteCodeHash: string;
  addresses: { [ key: string ]: string };
}

export declare const Account: IContract;
export declare const AccountProvider: IContract;
export declare const AccountProxy: IContract;
export declare const VirtualPaymentManager: IContract;
