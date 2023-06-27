import type { BCMSModalInputDefaults } from '../../services';

export interface BCMSAddUpdateWidgetModalOutputData {
  label: string;
  desc: string;
  previewImage: string;
}
export interface BCMSAddUpdateWidgetModalInputData
  extends BCMSModalInputDefaults<BCMSAddUpdateWidgetModalOutputData> {
  label?: string;
  desc?: string;
  previewImage?: string;
  widgetNames: string[];
  mode: 'add' | 'update';
}
