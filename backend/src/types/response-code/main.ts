export interface BCMSResponseCode {
  (code: string, vars?: { [key: string]: string }): {
    code: string;
    message: string;
  };
}
export interface BCMSResponseCodeRegister {
  (codes: Array<{ name: string; msg: string }>): void;
}
export interface BCMSResponseCodeList {
  [key: string]: {
    msg: string;
  };
}
