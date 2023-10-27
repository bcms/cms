import type { BCMSEntryContentParsedItem } from '@backend/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import type { BCMSPropParsed } from './main';

export interface BCMSPropEntryPointerData {
  templateId: string;
  entryIds: string[];
  displayProp: string;
}

// export interface BCMSPropEntryPointerDataParsed {
//   [lng: string]: BCMSPropParsed;
// }

export interface BCMSPropEntryPointerDataParsed {
  _id: string;
  cid: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  templateName: string;
  userId: string;
  status?: string;
  meta: { [lng: string]: BCMSPropParsed };
  content: { [lng: string]: BCMSEntryContentParsedItem[] };
}

export const BCMSPropEntryPointerDataSchema: ObjectSchema = {
  templateId: {
    __type: 'string',
    __required: true,
  },
  entryIds: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'string',
    },
  },
  displayProp: {
    __type: 'string',
    __required: true,
  },
};

export interface BCMSPropValueEntryPointer {
  tid: string;
  eid: string;
}
