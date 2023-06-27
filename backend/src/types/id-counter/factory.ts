import type { BCMSIdCounter } from './models';

export interface BCMSIdCounterFactory {
  create(data: {
    name?: string;
    forId?: string;
    count?: number;
  }): BCMSIdCounter;
}
