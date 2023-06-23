import type { BCMSProp } from '@becomes/cms-sdk/types';
import type { BCMSModalInputDefaults } from '../../../services';
import type { BCMSAddPropertyModalLocation } from './add';

export interface BCMSEditPropModalOutputData {
  prop: BCMSProp;
}
export interface BCMSEditPropModalInputData
  extends BCMSModalInputDefaults<BCMSEditPropModalOutputData> {
  prop: BCMSProp;
  location: BCMSAddPropertyModalLocation;
  entityId: string;
  takenPropNames: string[];
}
