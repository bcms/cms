import type { BCMSUserAddress } from './address';
import type { BCMSUserPersonal } from './personal';
import type { BCMSUserPolicy } from './policy';

export interface BCMSUserCustomPool {
  personal: BCMSUserPersonal;
  address: BCMSUserAddress;
  policy: BCMSUserPolicy;
}
