import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { BCMSIdCounter } from './models';

export interface BCMSIdCounterRepositoryMethods {
  findByForId(forId: string): Promise<BCMSIdCounter | null>;
  findAndIncByForId(forId: string): Promise<number | null>;
}

export type BCMSIdCounterRepository =
  | MongoDBRepository<BCMSIdCounter, BCMSIdCounterRepositoryMethods>
  | FSDBRepository<BCMSIdCounter, BCMSIdCounterRepositoryMethods>;
