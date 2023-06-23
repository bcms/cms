import { BCMSFactory } from '@backend/factory';
import { BCMSRepo } from '@backend/repo';
import type { Module } from '@becomes/purple-cheetah/types';

export function createIDCounterInitializeModule(): Module {
  return {
    name: 'ID counter initialization',
    initialize(moduleConfig) {
      BCMSRepo.idc.methods
        .findByForId('orgs')
        .then(async (result) => {
          if (!result) {
            const idc = BCMSFactory.idc.create({
              count: 1,
              forId: 'orgs',
              name: 'Organizations',
            });
            await BCMSRepo.idc.add(idc);
          }
          moduleConfig.next();
        })
        .catch((error) => {
          moduleConfig.next(error);
        });
    },
  };
}
