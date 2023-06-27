import type { BCMSModalInputDefaults } from '../../../services';

export interface BCMSStatusUpdateData {
  _id?: string;
  color: string;
  label: string;
  type: 'create' | 'update' | 'remove';
}
export interface BCMSEntryStatusModalOutputData {
  updates: BCMSStatusUpdateData[];
}
export type BCMSEntryStatusModalInputData =
  BCMSModalInputDefaults<BCMSEntryStatusModalOutputData>;
