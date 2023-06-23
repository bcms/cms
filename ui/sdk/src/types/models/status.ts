import type { BCMSEntity } from "./entity";

export interface BCMSStatus extends BCMSEntity {
  label: string;
  name: string;
  color: string;
}

export interface BCMSStatusCreateData {
  label: string;
  color?: string;
}

export interface BCMSStatusUpdateData {
  _id: string;
  label?: string;
  color?: string;
}