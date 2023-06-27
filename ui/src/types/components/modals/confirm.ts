import type { BCMSModalInputDefaults } from '../../services';

export type BCMSConfirmModalOutputData = void;
export interface BCMSConfirmModalInputData
  extends BCMSModalInputDefaults<BCMSConfirmModalOutputData> {
  body: string;
  prompt?: string;
}
