import type { BCMSModalInputDefaults } from '../../services';
import type { BCMSMultiSelectItem } from '../input';

export interface BCMSMultiSelectModalOutputData {
  items: BCMSMultiSelectItem[];
}
export interface BCMSMultiSelectModalInputData
  extends BCMSModalInputDefaults<BCMSMultiSelectModalOutputData> {
  items: BCMSMultiSelectItem[];
  onlyOne?: boolean;
}
