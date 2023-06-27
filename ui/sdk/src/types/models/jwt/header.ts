// eslint-disable-next-line no-shadow
export enum BCMSJwtEncryptionAlg {
  HMACSHA256 = 'HS256',
  HMACSHA512 = 'HS512',
}

export interface BCMSJwtHeader {
  type: string;
  alg: BCMSJwtEncryptionAlg;
}
