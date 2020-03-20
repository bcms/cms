import { Personal } from './personal.interface';
import { Address } from './address.interface';
import { UserPolicy } from './policy';

export interface CustomPool {
  personal: Personal;
  address: Address;
  policy: UserPolicy;
}
