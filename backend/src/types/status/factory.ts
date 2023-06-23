import type { BCMSStatus } from './models';

export interface BCMSStatusFactory {
  create(data: { label?: string; name?: string; color?: string }): BCMSStatus;
}
