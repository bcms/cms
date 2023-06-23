import type { BCMSModalInputDefaults } from '../../../services';

export interface BCMSAddUpdateDirModalOutputData {
  name: string;
}
export interface BCMSAddUpdateDirModalInputData
  extends BCMSModalInputDefaults<BCMSAddUpdateDirModalOutputData> {
  name?: string;
  mode: 'add' | 'update';
  takenNames: string[];
}
