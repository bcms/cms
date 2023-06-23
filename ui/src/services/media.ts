import type { BCMSMediaService } from '../types';

let service: BCMSMediaService;

export function useBcmsMediaService(): BCMSMediaService {
  return service;
}

export function createBcmsMediaService(): void {
  service = {
    getPath({ allMedia, target }) {
      if (target.parentId) {
        const parent = allMedia.find((e) => e._id === target.parentId);
        if (parent) {
          if (parent.parentId) {
            return [
              ...service.getPath({ allMedia, target: parent }),
              target.name,
            ];
          } else {
            return [parent.name, target.name];
          }
        } else {
          return [target.name];
        }
      } else {
        return [target.name];
      }
    },
  };
}
