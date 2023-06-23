import type { BCMSModalInputDefaults } from '../../../services';

export interface BCMSTemplateOrganizerCreateModalOutputData {
  name: string;
}
export interface BCMSTemplateOrganizerCreateModalInputData
  extends BCMSModalInputDefaults<BCMSTemplateOrganizerCreateModalOutputData> {
  name?: string;
}
