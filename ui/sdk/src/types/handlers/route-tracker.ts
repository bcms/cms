import type { SendFunction } from '../main';
import type { BCMSUser } from '../models';
import type { BCMSUserHandler } from './user';

export interface BCMSRouteTrackerHandlerConfig {
  send: SendFunction;
  userHandler: BCMSUserHandler;
}

export interface BCMSRouteTrackerHandler {
  register(path: string): Promise<void>;
  getUserAtPath(path: string): Promise<BCMSUser[]>;
  getUsers(): Promise<Array<{ id: string; path: string }>>;
}
