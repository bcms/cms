import type { BCMSModalInputDefaults } from '../../services';

export interface BCMSAddUpdateTemplateModalOutputData {
  label: string;
  desc: string;
  singleEntry: boolean;
}
export interface BCMSAddUpdateTemplateModalInputData
  extends BCMSModalInputDefaults<BCMSAddUpdateTemplateModalOutputData> {
  label?: string;
  desc?: string;
  singleEntry?: boolean;
  templateNames: string[];
  mode: 'add' | 'update';
}
