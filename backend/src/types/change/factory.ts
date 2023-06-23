import type { BCMSChange, BCMSChangeName } from './models';

export interface BCMSChangeFactory {
  create(data: { name?: BCMSChangeName; count?: number }): BCMSChange;
}
