import type { BCMSEntity } from '../entity';
import type { BCMSApiKeyAccess } from './access';

export interface BCMSApiKey extends BCMSEntity {
  userId: string;
  name: string;
  desc: string;
  blocked: boolean;
  secret: string;
  access: BCMSApiKeyAccess;
}

export interface BCMSApiKeyAddData {
  name: string;
  desc: string;
  blocked: boolean;
  access: BCMSApiKeyAccess;
}

export interface BCMSApiKeyUpdateData {
  _id: string;
  name?: string;
  desc?: string;
  blocked?: boolean;
  access?: BCMSApiKeyAccess;
}