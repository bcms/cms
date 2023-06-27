import type { BCMSMedia } from '@becomes/cms-sdk/types';
import type { BCMSModalInputDefaults } from '../../../services';

export interface BCMSMediaPickerModalOutputData {
  media: BCMSMedia;
}
export interface BCMSMediaPickerModalInputData
  extends BCMSModalInputDefaults<BCMSMediaPickerModalOutputData> {
  media?: BCMSMedia;
}
