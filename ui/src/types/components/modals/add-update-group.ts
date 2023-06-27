import type { BCMSModalInputDefaults } from '../../services';

export interface BCMSAddUpdateGroupModalOutputData {
  label: string;
  desc: string;
}
export interface BCMSAddUpdateGroupModalInputData
  extends BCMSModalInputDefaults<BCMSAddUpdateGroupModalOutputData> {
  label?: string;
  desc?: string;
  groupNames: string[];
  mode: 'add' | 'update';
}
