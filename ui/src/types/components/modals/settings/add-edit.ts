import type { BCMSModalInputDefaults } from '@ui/types';

export type BCMSAddEditUserModalOutputData = void;

export interface BCMSAddEditUserModalInputData
  extends BCMSModalInputDefaults<BCMSAddEditUserModalOutputData> {
  userId?: string;
}
