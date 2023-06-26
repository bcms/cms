import type { BCMSApiKeySignature } from '../models';

/**
 * The Client security handler.
 */
export interface BCMSClientSecurity {
  /**
   * Sign a request using API key.
   */
  sign<Payload>(payload: Payload): BCMSApiKeySignature;
}
