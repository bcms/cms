import type { BCMSModalInputDefaults } from '../../../services';

export interface BCMSAddUpdateApiKeyModalOutputData {
  name: string;
  desc: string;
}
export interface BCMSAddUpdateApiKeyModalInputData
  extends BCMSModalInputDefaults<BCMSAddUpdateApiKeyModalOutputData> {
  name?: string;
  desc?: string;
}
