export interface BCMSApiKeySignature {
  /** Key */
  k: string;
  /** Timestamp */
  t: number | string;
  /** Nonce */
  n: string;
  /** Signature */
  s: string;
}

export interface BCMSApiKeyRequestObject<Payload> {
  data: BCMSApiKeySignature;
  payload: Payload;
  requestMethod: string;
  path: string;
}
