import type { BCMSUser, BCMSUserPolicy } from '@becomes/cms-sdk/types';
import type { BCMSModalInputDefaults } from '../../../services';

export interface BCMSViewUserModalOutputData {
  policy: BCMSUserPolicy;
}
export interface BCMSViewUserModalInputData
  extends BCMSModalInputDefaults<BCMSViewUserModalOutputData> {
  user: BCMSUser;
}
