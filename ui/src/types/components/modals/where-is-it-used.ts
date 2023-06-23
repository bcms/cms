import type { BCMSModalInputDefaults } from '../../services';

export interface BCMSWhereIsItUsedItem {
  type: 'entry' | 'group' | 'widget' | 'template';
  label: string;
  id: string;
  template?: {
    id: string;
    label: string;
  };
  linkText?: string;
}

export type BCMSWhereIsItUsedModalOutputData = void;
export interface BCMSWhereIsItUsedModalInputData
  extends BCMSModalInputDefaults<BCMSWhereIsItUsedModalOutputData> {
  colsVisible?: {
    type?: boolean;
    label?: boolean;
    location?: boolean;
  };
  items: BCMSWhereIsItUsedItem[];
}
