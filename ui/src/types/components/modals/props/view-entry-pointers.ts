import type { BCMSModalInputDefaults } from '../../../services';

export type BCMSViewEntryPointerModalOutputData = void;
export interface BCMSViewEntryPointerModalInputData
  extends BCMSModalInputDefaults<BCMSViewEntryPointerModalOutputData> {
  items: Array<{
    label: string;
    uri: string;
  }>;
}
