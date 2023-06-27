import type { BCMSModalInputDefaults } from '../../../services';

export type BCMSViewEntryModelModalOutputData = void;
export interface BCMSViewEntryModelModalInputData
  extends BCMSModalInputDefaults<BCMSViewEntryModelModalOutputData> {
  templateId: string;
  entryId: string;
}
