import type { BCMSProp } from '@becomes/cms-sdk/types';
import type { BCMSModalInputDefaults } from '../../../services';

export type BCMSAddPropertyModalLocation = 'template' | 'group' | 'widget';
export type BCMSAddPropModalOutputData = BCMSProp;
export interface BCMSAddPropModalInputData
  extends BCMSModalInputDefaults<BCMSAddPropModalOutputData> {
  location: BCMSAddPropertyModalLocation;
  entityId: string;
  takenPropNames: string[];
}
