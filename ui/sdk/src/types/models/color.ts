import type { BCMSEntity } from './entity';

export interface BCMSColor extends BCMSEntity {
  cid: string;
  label: string;
  name: string;
  value: string;
  userId: string;
  global: boolean;
}

export interface BCMSColorCreateData {
  label: string;
  value: string;
  global: boolean;
}

export interface BCMSColorUpdateData {
  _id: string;
  label?: string;
  value?: string;
  global?: boolean;
}
